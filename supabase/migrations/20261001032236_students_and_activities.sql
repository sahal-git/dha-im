-- Create students table
create table public.students (
  id uuid default gen_random_uuid() primary key,
  teacher_id uuid references public.profiles(id) not null,
  full_name text not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create activities table
create table public.activities (
  id uuid default gen_random_uuid() primary key,
  teacher_id uuid references public.profiles(id) not null,
  name text not null,
  frequency text default 'Daily',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create daily scores table
create table public.daily_scores (
  id uuid default gen_random_uuid() primary key,
  activity_id uuid references public.activities(id) on delete cascade not null,
  student_id uuid references public.students(id) on delete cascade not null,
  date date not null,
  score integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Ensure only one score per student per activity per day
  unique(activity_id, student_id, date)
);

-- Enable RLS
alter table public.students enable row level security;
alter table public.activities enable row level security;
alter table public.daily_scores enable row level security;

-- Policies for students
create policy "Teachers can manage their own students"
on public.students for all
using (teacher_id = auth.uid());

create policy "Admins can view all students"
on public.students for select
using (public.is_admin());

-- Policies for activities
create policy "Teachers can manage their own activities"
on public.activities for all
using (teacher_id = auth.uid());

create policy "Admins can view all activities"
on public.activities for select
using (public.is_admin());

-- Policies for daily scores
create policy "Teachers can manage scores for their students"
on public.daily_scores for all
using (
  exists (
    select 1 from public.students 
    where students.id = daily_scores.student_id 
    and students.teacher_id = auth.uid()
  )
);

create policy "Admins can view all scores"
on public.daily_scores for select
using (public.is_admin());
