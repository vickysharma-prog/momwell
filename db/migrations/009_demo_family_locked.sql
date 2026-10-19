-- A visitor can't put themselves into someone's demo family: from the browser, a profile is created with its id, role
-- and name only; demo_family is set by the server alone.
revoke insert on public.profiles from authenticated;
grant insert (id, role, name) on public.profiles to authenticated;
