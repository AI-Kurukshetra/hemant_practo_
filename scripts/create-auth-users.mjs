import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const users = [
  {
    label: "admin",
    email: "hemant@email.com",
    password: "Hem@nt.Practo",
    full_name: "Aarav Patel",
    role: "admin",
  },
  {
    label: "doctor",
    email: "sahaj@email.com",
    password: "S@haj.Practo",
    full_name: "Dr. Leena Roy",
    role: "doctor",
  },
  {
    label: "receptionist",
    email: "dss@email.com",
    password: "DSS.Practo",
    full_name: "Mira Singh",
    role: "receptionist",
  },
  {
    label: "patient",
    email: "hc@email.com",
    password: "HC@Practo",
    full_name: "Samira Khan",
    role: "patient",
  },
];

async function ensureUser(user) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: {
      full_name: user.full_name,
      role: user.role,
    },
  });

  if (!error && data?.user) {
    return data.user;
  }

  const message = error?.message || "";
  if (!message.toLowerCase().includes("already")) {
    throw error;
  }

  const { data: existing, error: existingError } =
    await supabase.auth.admin.getUserByEmail(user.email);

  if (existingError || !existing?.user) {
    throw existingError || new Error("User exists but cannot be fetched");
  }

  return existing.user;
}

(async () => {
  const results = {};
  for (const user of users) {
    const created = await ensureUser(user);
    results[user.label] = created.id;
  }

  console.log(JSON.stringify(results, null, 2));
})();
