-- Life Link Database Schema (Protected Version)
-- This file defines the structure of the database without any hardcoded data.

-- Donors Table
create table if not exists donors (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  blood_group text not null check (blood_group in ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
  city text not null,
  phone text,
  available boolean default true,
  last_donated date,
  total_donations int default 0,
  created_at timestamptz default now()
);

-- Hospitals Table
create table if not exists hospitals (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  city text not null,
  contact_person text,
  phone text,
  created_at timestamptz default now()
);

-- Blood Requests Table
create table if not exists blood_requests (
  id uuid default gen_random_uuid() primary key,
  hospital_id uuid references hospitals(id) on delete cascade,
  blood_group text not null check (blood_group in ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
  component text not null default 'Whole blood'
    check (component in ('Whole blood','Platelets','Plasma','RBC')),
  units_needed int not null default 1,
  urgency text not null default 'Routine'
    check (urgency in ('Routine','Urgent','Critical')),
  status text not null default 'open'
    check (status in ('open','in_progress','filled','cancelled')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Donor Responses Table
create table if not exists donor_responses (
  id uuid default gen_random_uuid() primary key,
  request_id uuid references blood_requests(id) on delete cascade,
  donor_id uuid references donors(id) on delete cascade,
  status text not null default 'alerted'
    check (status in ('alerted','confirmed','declined','donated')),
  eta_minutes int,
  responded_at timestamptz,
  created_at timestamptz default now(),
  unique(request_id, donor_id)
);

-- Realtime Configuration
alter publication supabase_realtime add table blood_requests;
alter publication supabase_realtime add table donor_responses;

-- Row Level Security (RLS)
-- NOTE: In a production environment, these should be restricted using Supabase Auth.
alter table donors          enable row level security;
alter table hospitals       enable row level security;
alter table blood_requests  enable row level security;
alter table donor_responses enable row level security;

create policy "allow all donors"    on donors          for all using (true) with check (true);
create policy "allow all hospitals" on hospitals       for all using (true) with check (true);
create policy "allow all requests"  on blood_requests  for all using (true) with check (true);
create policy "allow all responses" on donor_responses for all using (true) with check (true);
