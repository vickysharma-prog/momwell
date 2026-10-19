-- A check-in about her baby (lib/safety/baby.ts) lives with hers, so alerts, the result screen and "How this was
-- decided" work the same. Who sees it follows "Baby updates", not "Daily check-ins": her partner sees the baby's,
-- not hers, by default.
alter table public.checkins add column subject text not null default 'mother' check (subject in ('mother', 'baby'));

drop policy "check-ins by what she shares" on public.checkins;
create policy "check-ins by what she shares" on public.checkins for select to authenticated
  using (public.can_see(mother_id, case when subject = 'baby' then 'baby' else 'checkins' end));
