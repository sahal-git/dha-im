-- Create profiles table linked to auth.users
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  email text,
  role text check (role in ('admin', 'teacher'))
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Policies
-- Create a function to check admin status without triggering RLS recursively
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer set search_path = public;

-- Admins can do everything on profiles
create policy "Admins can manage all profiles" 
on public.profiles 
for all 
using ( public.is_admin() );

-- Users can view their own profile
create policy "Users can view own profile" 
on public.profiles 
for select 
using ( auth.uid() = id );
