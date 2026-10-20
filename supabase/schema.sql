-- Officer Assistant initial schema (Supabase / Postgres)
create table if not exists profiles (
  id uuid primary key references auth.users(id),
  display_name text,
  avatar_url text,
  rank text,
  department text check (department in ('deck','engine','both')),
  created_at timestamptz default now()
);

create table if not exists subscriptions (
  user_id uuid primary key references auth.users(id),
  plan text default 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  updated_at timestamptz default now()
);

create table if not exists editor_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  question text not null,
  inspection text not null,
  vessel_type text,
  answer text,
  contract_id uuid,
  created_at timestamptz default now()
);

create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  ship_name text not null,
  ship_type text,
  join_port text,
  sign_on_date date,
  sign_off_date date,
  rank text,
  company text,
  status text default 'active',
  gibs_done boolean default false,
  gibs_done_at timestamptz,
  gibs_off_done boolean default false,
  estimated_end_date date,
  dep_port text,
  dest_port text,
  eta date,
  nav_status text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table subscriptions enable row level security;
alter table editor_questions enable row level security;

create policy "own profile" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own subscription" on subscriptions for select using (auth.uid() = user_id);
create policy "own questions" on editor_questions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
alter table contracts enable row level security;
create policy "own contracts" on contracts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
