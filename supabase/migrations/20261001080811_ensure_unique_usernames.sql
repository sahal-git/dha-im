-- Ensure email (used as username) is unique across all users in the profiles table.
-- auth.users already enforces this globally; this adds the same guarantee to our mirror.
alter table public.profiles
  add constraint profiles_email_unique unique (email);
