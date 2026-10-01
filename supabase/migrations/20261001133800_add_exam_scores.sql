-- Create assessments table
create table public.assessments (
  id uuid default gen_random_uuid() primary key,
  teacher_id uuid references public.profiles(id) not null,
  title text not null,
  type text not null default 'exam', -- 'exam', 'assignment', 'work'
  max_score integer not null,
  date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create assessment_scores table
create table public.assessment_scores (
  id uuid default gen_random_uuid() primary key,
  assessment_id uuid references public.assessments(id) on delete cascade not null,
  student_id uuid references public.students(id) on delete cascade not null,
  score integer,
  feedback text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Ensure only one score per student per assessment
  unique(assessment_id, student_id)
);

-- Enable RLS
alter table public.assessments enable row level security;
alter table public.assessment_scores enable row level security;

-- Policies for assessments
create policy "Teachers can manage their own assessments"
on public.assessments for all
using (teacher_id = auth.uid());

create policy "Admins can view all assessments"
on public.assessments for select
using (public.is_admin());

create policy "Students can view assessments from their teacher"
on public.assessments for select
using (
  teacher_id = (
    select teacher_id from public.students where user_id = auth.uid() limit 1
  )
);

-- Policies for assessment_scores
create policy "Teachers can manage scores for their assessments"
on public.assessment_scores for all
using (
  exists (
    select 1 from public.assessments
    where assessments.id = assessment_scores.assessment_id
    and assessments.teacher_id = auth.uid()
  )
);

create policy "Admins can view all assessment scores"
on public.assessment_scores for select
using (public.is_admin());

create policy "Students can view their own assessment scores"
on public.assessment_scores for select
using (
  student_id = (
    select id from public.students where user_id = auth.uid() limit 1
  )
);
