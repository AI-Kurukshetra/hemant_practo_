-- Replace the UUIDs below with actual auth.users IDs from Supabase Auth.
-- You can find them in the Supabase dashboard under Authentication > Users.

-- Sample user IDs
-- admin_id:        9321b684-3d83-4c85-802c-e9456464a473
-- doctor_id:       5a9dc8f1-c545-4493-9a5f-012b80967aaf
-- receptionist_id: 4813a781-60d4-45ea-8a62-c1ca757bd2fb
-- patient_id:      1cfd8348-743f-4207-a7eb-abb52242afff

insert into public.profiles (id, full_name, role)
values
  ('9321b684-3d83-4c85-802c-e9456464a473', 'Aarav Patel', 'admin'),
  ('5a9dc8f1-c545-4493-9a5f-012b80967aaf', 'Dr. Leena Roy', 'doctor'),
  ('4813a781-60d4-45ea-8a62-c1ca757bd2fb', 'Mira Singh', 'receptionist'),
  ('1cfd8348-743f-4207-a7eb-abb52242afff', 'Samira Khan', 'patient')
on conflict (id) do nothing;

insert into public.clinics (id, name, address, city, state, phone, timezone)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Downtown Clinic', '12 Market Street', 'San Francisco', 'CA', '+1 415-555-1000', 'America/Los_Angeles'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Harbor Clinic', '88 Bay Avenue', 'Oakland', 'CA', '+1 510-555-2000', 'America/Los_Angeles')
on conflict (id) do nothing;

insert into public.clinic_users (clinic_id, user_id, role)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '9321b684-3d83-4c85-802c-e9456464a473', 'admin'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '5a9dc8f1-c545-4493-9a5f-012b80967aaf', 'doctor'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '4813a781-60d4-45ea-8a62-c1ca757bd2fb', 'receptionist'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '9321b684-3d83-4c85-802c-e9456464a473', 'admin')
on conflict do nothing;

insert into public.patients (id, clinic_id, user_id, full_name, email, phone, gender)
values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '1cfd8348-743f-4207-a7eb-abb52242afff', 'Samira Khan', 'samira@example.com', '+1 415-555-3000', 'female'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', null, 'Liam Chen', 'liam@example.com', '+1 415-555-4000', 'male')
on conflict (id) do nothing;

insert into public.doctors (id, clinic_id, user_id, specialization, license_number)
values
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '5a9dc8f1-c545-4493-9a5f-012b80967aaf', 'Cardiology', 'CA-112233')
on conflict (id) do nothing;

insert into public.appointments (id, clinic_id, patient_id, doctor_id, scheduled_at, status, reason)
values
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', now() + interval '1 day', 'scheduled', 'Routine checkup'),
  ('abababab-abab-abab-abab-abababababab', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', now() + interval '2 days', 'scheduled', 'Follow-up')
on conflict (id) do nothing;

insert into public.prescriptions (id, clinic_id, appointment_id, doctor_id, patient_id, diagnosis, notes, items)
values
  (
    'cdcdcdcd-cdcd-cdcd-cdcd-cdcdcdcdcdcd',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Mild hypertension',
    'Reduce sodium intake and review in 30 days.',
    '[{"medicine":"Amlodipine","dosage":"5mg","frequency":"Once daily"}]'
  )
on conflict (id) do nothing;

insert into public.invoices (id, clinic_id, patient_id, appointment_id, status, total, due_date)
values
  (
    'efefefef-efef-efef-efef-efefefefefef',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'issued',
    220,
    now()::date + 15
  )
on conflict (id) do nothing;

insert into public.invoice_items (invoice_id, description, quantity, unit_price, amount)
values
  ('efefefef-efef-efef-efef-efefefefefef', 'Consultation', 1, 150, 150),
  ('efefefef-efef-efef-efef-efefefefefef', 'Lab tests', 1, 70, 70)
on conflict do nothing;

insert into public.payments (invoice_id, amount, method, reference)
values
  ('efefefef-efef-efef-efef-efefefefefef', 100, 'card', 'PAY-1001')
on conflict do nothing;
