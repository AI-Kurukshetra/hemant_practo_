# Practo Clinic Suite

A production-ready Next.js app for multi-clinic management: appointments, prescriptions, patients, and billing with Supabase auth and RLS.

## Stack
- Next.js (App Router)
- TypeScript
- Bootstrap 5
- Supabase (Auth + Postgres)
- Vitest (basic unit tests)

## Local Setup

1) Install dependencies

```bash
npm install
```

2) Configure environment variables

Create `.env.local` using `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

3) Create Supabase tables

Run the SQL in `supabase/schema.sql` inside the Supabase SQL editor.

4) Seed data (optional)

Update user UUIDs in `supabase/seed.sql` to match your Supabase Auth users, then run it in the SQL editor.

5) Start the app

```bash
npm run dev
```

## Auth Notes
- Registration collects `full_name` and `role`. A trigger in `schema.sql` creates a `profiles` row when a user signs up.
- Roles: `admin`, `doctor`, `receptionist`, `patient`.

## Testing

```bash
npm run test
```

## Vercel Deployment

1) Push the project to GitHub.
2) Import into Vercel.
3) Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4) Deploy.

## Project Structure
- `src/app` - App Router pages
- `src/lib` - Supabase client, auth helpers, utilities
- `supabase/` - Schema and seed SQL
