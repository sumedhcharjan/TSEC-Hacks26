-- 1. Create the reports table
create table public.reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  
  image_url text, -- We will enable Storage later
  description text,
  category text, -- e.g. 'Pothole', 'Water', etc.
  latitude float,
  longitude float,
  
  status text default 'PENDING', -- 'PENDING', 'ANALYZING', 'RESOLVED'
  risk_score int default 0,      -- 0 to 100, set by AI
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table public.reports enable row level security;

-- Policy 1: Everyone can view reports (Transparency!)
create policy "Reports are viewable by everyone"
  on reports for select
  using ( true );

-- Policy 2: Authenticated users can create reports
create policy "Users can upload reports"
  on reports for insert
  with check ( auth.uid() = user_id );

-- Policy 3: Only Admins can update status/risk (We use a trick here)
-- We check if the user trying to update has the 'admin' role in their profile
create policy "Admins can update reports"
  on reports for update
  using ( 
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
