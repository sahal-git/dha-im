-- Create a security definer function to securely fetch a student's teacher_id without recursion
create or replace function public.get_my_teacher_id()
returns uuid as $$
  select teacher_id from public.students where user_id = auth.uid() limit 1;
$$ language sql security definer;

-- Drop old overly restrictive policies
drop policy if exists "Students can view their own record" on public.students;
drop policy if exists "Students can manage their own scores" on public.daily_scores;

-- New Policy: Students can view ALL students that belong to their teacher
create policy "Students can view classmates"
on public.students for select
using (
  teacher_id = public.get_my_teacher_id()
  or user_id = auth.uid()
);

-- New Policy: Students can view ALL scores for students that belong to their teacher
create policy "Students can view classmates scores"
on public.daily_scores for select
using (
  student_id in (
    select id from public.students where teacher_id = public.get_my_teacher_id()
  )
);

-- New Policy: Students can only insert/update/delete THEIR OWN scores
create policy "Students can modify their own scores"
on public.daily_scores for all
using (
  student_id = (
    select id from public.students where user_id = auth.uid() limit 1
  )
);
