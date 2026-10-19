-- The mood check (lib/safety/mood.ts): her answers and the score the rules gave them, written on the server with the
-- service role. Seen by her and by whoever she shares "Mood screening" with. A thought of harm also becomes a
-- check-in with the harm_thoughts warning sign (source 'mood'), so it alerts like any other warning sign; she is told
-- this before she answers. Her answers never go into that check-in.
alter table public.checkins drop constraint checkins_source_check;
alter table public.checkins add constraint checkins_source_check check (source in ('tap', 'talk', 'mood'));

create table public.moods (
  id uuid primary key default gen_random_uuid(),
  mother_id uuid not null references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('phq2', 'phq9')),
  answers smallint[] not null check (array_length(answers, 1) in (2, 9)),
  score int not null check (score between 0 and 27),
  level text not null check (level in ('urgent', 'call_doctor', 'none')),
  engine_version text not null,
  checkin_id uuid references public.checkins on delete set null
);
create index moods_mother on public.moods (mother_id, created_at desc);

alter table public.moods enable row level security;
revoke all on public.moods from anon;
revoke insert, update, delete on public.moods from authenticated;
create policy "moods by what she shares" on public.moods for select to authenticated
  using (public.can_see(mother_id, 'mood'));
