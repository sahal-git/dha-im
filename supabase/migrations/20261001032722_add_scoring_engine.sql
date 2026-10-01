-- Add 'type' to activities to determine the scoring logic (e.g., 'salah', 'quran', 'generic')
alter table public.activities 
add column if not exists type text default 'generic';

-- Add 'raw_value' to daily_scores to store the exact input (e.g., 'jamaath' or '8')
alter table public.daily_scores 
add column if not exists raw_value text;
