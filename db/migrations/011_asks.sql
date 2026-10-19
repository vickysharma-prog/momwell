-- What she needs, asked of her circle: a dinner, the night feeds, groceries, company, a ride. Seen and taken by the
-- people she shares "Ways to help" with. She asks; one of them takes it; it's done.
create table public.asks (
  id uuid primary key default gen_random_uuid(),
  mother_id uuid not null references public.profiles on delete cascade,
  kind text not null check (kind in ('meal', 'night_feeds', 'groceries', 'company', 'ride', 'other')),
  note text not null default '' check (length(note) <= 200),
  needed_on date not null default current_date,
  taken_by uuid references public.profiles on delete set null,
  taken_at timestamptz,
  done boolean not null default false,
  created_at timestamptz not null default now()
);
create index asks_mother on public.asks (mother_id, needed_on desc);

alter table public.asks enable row level security;
revoke all on public.asks from anon;
revoke update on public.asks from authenticated;
grant update (taken_by, taken_at, done) on public.asks to authenticated;

create policy "asks: hers, and the people she shares ways to help with" on public.asks for select to authenticated
  using (public.can_see(mother_id, 'tasks'));
create policy "she asks" on public.asks for insert to authenticated
  with check (mother_id = (select auth.uid()) and public.my_role() = 'mother');
create policy "she takes back an ask" on public.asks for delete to authenticated
  using (mother_id = (select auth.uid()));
-- Her circle takes an ask for themselves, or lets go of one they took; she can mark any of hers done.
create policy "take, let go or finish an ask" on public.asks for update to authenticated
  using (mother_id = (select auth.uid()) or (public.can_see(mother_id, 'tasks') and (taken_by is null or taken_by = (select auth.uid()))))
  with check (mother_id = (select auth.uid()) or taken_by is null or taken_by = (select auth.uid()));

alter publication supabase_realtime add table public.asks;
