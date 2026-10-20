-- Her baby's doctor, so a warning about the baby calls the right doctor in one tap. Hers to set; read with her dates.
alter table public.mothers add column baby_doctor_name text check (length(baby_doctor_name) <= 60);
alter table public.mothers add column baby_doctor_phone text check (baby_doctor_phone ~ '^\+?[0-9]{7,15}$');
grant update (baby_doctor_name, baby_doctor_phone) on public.mothers to authenticated;
