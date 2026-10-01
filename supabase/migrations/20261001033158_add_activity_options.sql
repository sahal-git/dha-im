-- Add options column to store custom dropdown answers and their scores
alter table public.activities 
add column if not exists options jsonb default '[]'::jsonb;
