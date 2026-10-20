-- A phone number on each profile, so a warning screen can call her partner or her doctor in one tap. Read under the
-- same rule as the name (herself and people linked to her); each person sets only their own.
alter table public.profiles add column phone text check (phone ~ '^\+?[0-9]{7,15}$');
grant update (name, phone) on public.profiles to authenticated;
