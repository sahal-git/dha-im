-- 1. Update profiles role enum/check
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('admin', 'teacher', 'student'));

-- 2. Add user_id to students so we can link a student record to an auth profile
alter table public.students add column if not exists user_id uuid references auth.users(id);

-- 3. Add RLS for students
-- Students can view their own student record
create policy "Students can view their own record"
on public.students for select
using (user_id = auth.uid());

-- Students can view activities assigned by their teacher
create policy "Students can view activities"
on public.activities for select
using (
  teacher_id = (
    select teacher_id from public.students where user_id = auth.uid() limit 1
  )
);

-- Students can view and update their own scores
create policy "Students can manage their own scores"
on public.daily_scores for all
using (
  student_id = (
    select id from public.students where user_id = auth.uid() limit 1
  )
);
