create extension if not exists "pgcrypto";

create type public.user_role as enum (
  'admin',
  'doctor',
  'receptionist',
  'patient'
);

create type public.appointment_status as enum (
  'scheduled',
  'checked_in',
  'in_progress',
  'completed',
  'cancelled',
  'no_show'
);

create type public.invoice_status as enum (
  'draft',
  'issued',
  'paid',
  'void'
);

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  role public.user_role not null default 'patient',
  phone text,
  created_at timestamptz not null default now()
);

create table public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  city text,
  state text,
  phone text,
  timezone text default 'UTC',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.clinic_users (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  role public.user_role not null,
  created_at timestamptz not null default now(),
  unique (clinic_id, user_id)
);

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics on delete cascade,
  user_id uuid references auth.users on delete set null,
  full_name text not null,
  email text,
  phone text,
  dob date,
  gender text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.doctors (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  specialization text,
  license_number text,
  availability jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (clinic_id, user_id)
);

alter table public.doctors
add constraint doctors_user_profile_fkey
foreign key (user_id) references public.profiles(id) on delete cascade;

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics on delete cascade,
  patient_id uuid not null references public.patients on delete cascade,
  doctor_id uuid references public.doctors on delete set null,
  scheduled_at timestamptz not null,
  status public.appointment_status not null default 'scheduled',
  reason text,
  created_at timestamptz not null default now()
);

create table public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics on delete cascade,
  appointment_id uuid references public.appointments on delete set null,
  doctor_id uuid references public.doctors on delete set null,
  patient_id uuid not null references public.patients on delete cascade,
  diagnosis text,
  notes text,
  items jsonb not null default '[]'::jsonb,
  issued_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics on delete cascade,
  patient_id uuid not null references public.patients on delete cascade,
  appointment_id uuid references public.appointments on delete set null,
  status public.invoice_status not null default 'issued',
  total numeric(10, 2) not null default 0,
  due_date date,
  issued_at timestamptz not null default now()
);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices on delete cascade,
  description text not null,
  quantity int not null default 1,
  unit_price numeric(10, 2) not null default 0,
  amount numeric(10, 2) not null default 0
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices on delete cascade,
  amount numeric(10, 2) not null,
  method text,
  reference text,
  paid_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'patient'),
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_clinic_member(clinic_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.clinic_users cu
    where cu.clinic_id = is_clinic_member.clinic_id
      and cu.user_id = auth.uid()
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

create or replace function public.is_patient_owner(patient_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.patients p
    where p.id = is_patient_owner.patient_id
      and p.user_id = auth.uid()
  );
$$;

create or replace function public.is_invoice_owner(invoice_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.invoices i
    join public.patients p on p.id = i.patient_id
    where i.id = is_invoice_owner.invoice_id
      and p.user_id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.clinics enable row level security;
alter table public.clinic_users enable row level security;
alter table public.patients enable row level security;
alter table public.doctors enable row level security;
alter table public.appointments enable row level security;
alter table public.prescriptions enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;

create policy "profiles_select" on public.profiles
for select using (id = auth.uid() or public.is_admin());

create policy "profiles_update" on public.profiles
for update using (id = auth.uid())
with check (id = auth.uid());

create policy "clinics_select" on public.clinics
for select using (public.is_clinic_member(id) or public.is_admin());

create policy "clinics_insert" on public.clinics
for insert with check (public.is_admin());

create policy "clinics_update" on public.clinics
for update using (public.is_admin() and public.is_clinic_member(id))
with check (public.is_admin());

create policy "clinics_delete" on public.clinics
for delete using (public.is_admin() and public.is_clinic_member(id));

create policy "clinic_users_select" on public.clinic_users
for select using (
  user_id = auth.uid()
  or (public.is_admin() and public.is_clinic_member(clinic_id))
);

create policy "clinic_users_modify" on public.clinic_users
for all using (
  public.is_admin()
  or user_id = auth.uid()
)
with check (
  public.is_admin()
  or (
    user_id = auth.uid()
    and role in ('admin', 'doctor', 'receptionist')
    and role = (
      select p.role from public.profiles p where p.id = auth.uid()
    )
  )
);

create policy "patients_select" on public.patients
for select using (public.is_clinic_member(clinic_id) or public.is_patient_owner(id));

create policy "patients_insert" on public.patients
for insert with check (public.is_clinic_member(clinic_id));

create policy "patients_update" on public.patients
for update using (public.is_clinic_member(clinic_id) or public.is_patient_owner(id))
with check (public.is_clinic_member(clinic_id) or public.is_patient_owner(id));

create policy "patients_delete" on public.patients
for delete using (public.is_clinic_member(clinic_id));

create policy "doctors_select" on public.doctors
for select using (public.is_clinic_member(clinic_id));

create policy "doctors_modify" on public.doctors
for all using (public.is_admin() and public.is_clinic_member(clinic_id))
with check (public.is_admin() and public.is_clinic_member(clinic_id));

create policy "appointments_select" on public.appointments
for select using (
  public.is_clinic_member(clinic_id)
  or public.is_patient_owner(patient_id)
);

create policy "appointments_insert" on public.appointments
for insert with check (public.is_clinic_member(clinic_id));

create policy "appointments_update" on public.appointments
for update using (public.is_clinic_member(clinic_id))
with check (public.is_clinic_member(clinic_id));

create policy "appointments_delete" on public.appointments
for delete using (public.is_clinic_member(clinic_id));

create policy "prescriptions_select" on public.prescriptions
for select using (
  public.is_clinic_member(clinic_id)
  or public.is_patient_owner(patient_id)
);

create policy "prescriptions_modify" on public.prescriptions
for all using (public.is_clinic_member(clinic_id))
with check (public.is_clinic_member(clinic_id));

create policy "invoices_select" on public.invoices
for select using (
  public.is_clinic_member(clinic_id)
  or public.is_patient_owner(patient_id)
);

create policy "invoices_modify" on public.invoices
for all using (public.is_clinic_member(clinic_id))
with check (public.is_clinic_member(clinic_id));

create policy "invoice_items_select" on public.invoice_items
for select using (
  public.is_clinic_member((select clinic_id from public.invoices i where i.id = invoice_id))
  or public.is_invoice_owner(invoice_id)
);

create policy "invoice_items_modify" on public.invoice_items
for all using (
  public.is_clinic_member((select clinic_id from public.invoices i where i.id = invoice_id))
)
with check (
  public.is_clinic_member((select clinic_id from public.invoices i where i.id = invoice_id))
);

create policy "payments_select" on public.payments
for select using (
  public.is_clinic_member((select clinic_id from public.invoices i where i.id = invoice_id))
  or public.is_invoice_owner(invoice_id)
);

create policy "payments_modify" on public.payments
for all using (
  public.is_clinic_member((select clinic_id from public.invoices i where i.id = invoice_id))
)
with check (
  public.is_clinic_member((select clinic_id from public.invoices i where i.id = invoice_id))
);

create index if not exists idx_clinic_users_user on public.clinic_users(user_id);
create index if not exists idx_patients_clinic on public.patients(clinic_id);
create index if not exists idx_doctors_clinic on public.doctors(clinic_id);
create index if not exists idx_appointments_clinic on public.appointments(clinic_id);
create index if not exists idx_prescriptions_clinic on public.prescriptions(clinic_id);
create index if not exists idx_invoices_clinic on public.invoices(clinic_id);
