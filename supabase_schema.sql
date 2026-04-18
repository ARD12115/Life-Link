-- Life Link Database Schema (Security Hardened)

-- Donors Table
create table if not exists donors (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
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
  user_id uuid references auth.users,
  name text not null,
  city text not null,
  contact_person text,
  phone text,
  created_at timestamptz default now()
);

-- Profiles Table
create table if not exists profiles (
  user_id uuid primary key references auth.users on delete cascade,
  role text not null check (role in ('hospital','donor')),
  display_name text,
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
alter table profiles        enable row level security;
alter table donors          enable row level security;
alter table hospitals       enable row level security;
alter table blood_requests  enable row level security;
alter table donor_responses enable row level security;

create policy "profiles_owner" on profiles for all using (
  auth.uid() = user_id
) with check (
  auth.uid() = user_id
);

-- Donors: donors can manage their own record only if they are a donor profile; hospitals can read donors.
create policy "donors_owner_manage" on donors for all using (
  auth.uid() = user_id
) with check (
  auth.uid() = user_id
  AND exists (
    select 1 from profiles p where p.user_id = auth.uid() and p.role = 'donor'
  )
);

create policy "hospitals_read_donors" on donors for select using (
  auth.uid() = user_id
  OR exists (
    select 1 from hospitals h where h.user_id = auth.uid()
  )
);

-- Hospitals: hospitals can manage their own record only if they are a hospital profile; related donors can read limited hospital info.
create policy "hospitals_owner_manage" on hospitals for all using (
  auth.uid() = user_id
) with check (
  auth.uid() = user_id
  AND exists (
    select 1 from profiles p where p.user_id = auth.uid() and p.role = 'hospital'
  )
);

create policy "authenticated_hospitals_view" on hospitals for select using (
  auth.uid() = user_id
  OR exists (
    select 1
    from blood_requests br
    join donor_responses dr on dr.request_id = br.id
    join donors d on d.id = dr.donor_id
    where br.hospital_id = hospitals.id
      and d.user_id = auth.uid()
  )
);

-- Requests: hospitals can manage their own requests; donors can view requests assigned to them.
create policy "hospitals_manage_requests" on blood_requests for all using (
  exists (
    select 1 from hospitals h where h.id = blood_requests.hospital_id and h.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from hospitals h where h.id = blood_requests.hospital_id and h.user_id = auth.uid()
  )
);

create policy "donors_view_assigned_requests" on blood_requests for select using (
  exists (
    select 1
    from donor_responses dr
    join donors d on d.id = dr.donor_id
    where dr.request_id = blood_requests.id
      and d.user_id = auth.uid()
  )
);

-- Responses: donors may update their own responses; hospitals may insert/update responses for their own requests.
create policy "donors_manage_responses" on donor_responses for all using (
  exists (
    select 1 from donors d where d.id = donor_responses.donor_id and d.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from donors d where d.id = donor_responses.donor_id and d.user_id = auth.uid()
  )
);

create policy "hospitals_manage_responses" on donor_responses for all using (
  exists (
    select 1
    from blood_requests br
    join hospitals h on h.id = br.hospital_id
    where br.id = donor_responses.request_id
      and h.user_id = auth.uid()
  )
) with check (
  exists (
    select 1
    from blood_requests br
    join hospitals h on h.id = br.hospital_id
    where br.id = donor_responses.request_id
      and h.user_id = auth.uid()
  )
);
