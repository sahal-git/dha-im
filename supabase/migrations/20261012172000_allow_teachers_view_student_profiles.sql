-- Allow teachers to view student profiles for students assigned to them
drop policy if exists "Teachers can view their students profiles" on public.profiles;
create policy "Teachers can view their students profiles"
on public.profiles for select
using (
  exists (
    select 1 from public.students
    where students.user_id = profiles.id
    and students.teacher_id = auth.uid()
  )
);
