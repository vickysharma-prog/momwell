-- The mother's pregnancy dates, her daily check-ins, and the alerts they raise. The level of a check-in is decided
-- on the server by the rules engine (lib/safety/engine.ts) and written with the service role; nobody writes it
-- from the browser.

create table public.mothers (
  id uuid primary key references public.profiles on delete cascade,
  due_date date,
  birth_date date,
  updated_at timestamptz not null default now()
);

-- May the signed-in person see this scope of this mother? Her own data always; others by what she granted.
create function public.can_see(mother uuid, scope text) returns boolean language sql stable security definer set search_path = ''
as $$
  select mother = auth.uid() or exists (
    select 1 from public.links where mother_id = mother and person_id = auth.uid() and scope = any(sees)
  )
$$;

create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  mother_id uuid not null references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  signs text[] not null default '{}',
  systolic int,
  diastolic int,
  temp_value numeric(5, 2),
  temp_unit text check (temp_unit in ('F', 'C')),
  note text not null default '' check (length(note) <= 2000),
  level text not null check (level in ('urgent', 'call_doctor', 'check', 'none')),
  reasons jsonb not null default '[]',
  engine_version text not null
);
create index checkins_mother on public.checkins (mother_id, created_at desc);

-- An alert says only how urgent and when. The detail lives in the check-in, behind the checkins scope, so a partner
-- with alerts but not check-ins learns she needs him, not what she reported.
create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  mother_id uuid not null references public.profiles on delete cascade,
  checkin_id uuid not null references public.checkins on delete cascade,
  level text not null check (level in ('urgent', 'call_doctor')),
  created_at timestamptz not null default now(),
  seen_at timestamptz,
  seen_by uuid references public.profiles on delete set null
);
create index alerts_mother on public.alerts (mother_id, created_at desc);

alter table public.mothers enable row level security;
alter table public.checkins enable row level security;
alter table public.alerts enable row level security;
revoke all on public.mothers, public.checkins, public.alerts from anon;
revoke insert, update, delete on public.checkins, public.alerts from authenticated;
revoke update on public.mothers from authenticated;
grant update (due_date, birth_date, updated_at) on public.mothers to authenticated;
grant update (seen_at, seen_by) on public.alerts to authenticated;

create policy "her dates: hers, and her care team's" on public.mothers for select to authenticated
  using (public.can_see(id, 'checkins') or public.can_see(id, 'appointments'));
create policy "she sets her own dates" on public.mothers for insert to authenticated
  with check (id = (select auth.uid()) and public.my_role() = 'mother');
create policy "she changes her own dates" on public.mothers for update to authenticated
  using (id = (select auth.uid()));

create policy "check-ins by what she shares" on public.checkins for select to authenticated
  using (public.can_see(mother_id, 'checkins'));

create policy "alerts by what she shares" on public.alerts for select to authenticated
  using (public.can_see(mother_id, 'alerts'));
-- "Seen" is the care team's to mark, and she sees it.
create policy "her care team marks an alert seen" on public.alerts for update to authenticated
  using (exists (select 1 from public.links l where l.mother_id = alerts.mother_id and l.person_id = (select auth.uid()) and l.kind = 'care_team' and 'alerts' = any(l.sees)))
  with check (seen_by = (select auth.uid()));

revoke execute on function public.can_see(uuid, text) from public, anon;
grant execute on function public.can_see(uuid, text) to authenticated;

-- Live alerts in the browser; realtime applies the select policy above to each subscriber.
alter publication supabase_realtime add table public.alerts;
