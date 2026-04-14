-- Run this entire file in Supabase Dashboard → SQL Editor

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

create table if not exists hospitals (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  city text not null,
  contact_person text,
  phone text,
  created_at timestamptz default now()
);

create table if not exists blood_requests (
  id uuid default gen_random_uuid() primary key,
  hospital_id uuid references hospitals(id) on delete cascade,
  blood_group text not null check (blood_group in ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
  component text not null default 'Whole blood'
    check (component in ('Whole blood','Platelets','Plasma','RBC')),
  units_needed int not null default 1,
  urgency text not null default 'Urgent'
    check (urgency in ('Routine','Urgent','Critical')),
  status text not null default 'open'
    check (status in ('open','in_progress','filled','cancelled')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

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

-- Enable realtime
alter publication supabase_realtime add table blood_requests;
alter publication supabase_realtime add table donor_responses;

-- Seed hospitals
insert into hospitals (name, city, contact_person, phone) values
  ('KMC Manipal', 'Manipal', 'Dr. Anjali Rao', '+91 98765 43210'),
  ('Manipal Hospital', 'Mangalore', 'Dr. Suresh Kamath', '+91 98765 43211'),
  ('Apollo BGS Hospital', 'Mysuru', 'Dr. Priya Shetty', '+91 98765 43212');

-- Seed donors
insert into donors (name, blood_group, city, phone, available, last_donated, total_donations) values
  ('Rahul Kumar',  'B+', 'Manipal',  '+91 91234 56789', true,  now() - interval '92 days',  7),
  ('Priya Menon',  'O+', 'Manipal',  '+91 91234 56790', true,  now() - interval '120 days', 3),
  ('Arjun Shetty', 'B+', 'Manipal',  '+91 91234 56791', true,  now() - interval '60 days',  5),
  ('Kavya Nair',   'AB+','Udupi',    '+91 91234 56792', true,  now() - interval '200 days', 2),
  ('Deepak Rao',   'O-', 'Manipal',  '+91 91234 56793', false, now() - interval '30 days',  12),
  ('Sneha Pai',    'A+', 'Mangalore','+91 91234 56794', true,  now() - interval '150 days', 4);

-- RLS — allow all for demo
alter table donors          enable row level security;
alter table hospitals       enable row level security;
alter table blood_requests  enable row level security;
alter table donor_responses enable row level security;

create policy "allow all donors"    on donors          for all using (true) with check (true);
create policy "allow all hospitals" on hospitals       for all using (true) with check (true);
create policy "allow all requests"  on blood_requests  for all using (true) with check (true);
create policy "allow all responses" on donor_responses for all using (true) with check (true);