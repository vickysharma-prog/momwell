-- Today's plan for her and her family: what Momwell's planner chose through Qloo (a show, a place to eat, an artist)
-- and two short notes, with the planner's steps. Built from her taste and asks only, never her symptoms or mood, so
-- she and the people she shares ways to help with can both read it. Written on the server; the safety line on top of
-- it is decided live by the rules, not stored here.
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  mother_id uuid not null references public.profiles on delete cascade,
  for_date date not null,
  picks jsonb not null,
  note_her text not null default '',
  note_circle text not null default '',
  made_by text not null check (made_by in ('agent', 'rules')),
  trace jsonb not null default '[]',
  created_at timestamptz not null default now(),
  unique (mother_id, for_date)
);
alter table public.plans enable row level security;
revoke all on public.plans from anon;
revoke insert, update, delete on public.plans from authenticated;
create policy "her plan: hers, and those she lets help" on public.plans for select to authenticated
  using (public.can_see(mother_id, 'tasks'));

-- A pooled demo family's plan moves to today with the rest of its story.
create or replace function public.claim_demo_family(ip text) returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  fam uuid;
  made timestamptz;
  shift interval;
  days int;
  mom uuid;
begin
  select id, created_at into fam, made from public.demo_families where claimed_at is null order by created_at limit 1 for update skip locked;
  if fam is null then
    return null;
  end if;
  shift := now() - made;
  days := current_date - made::date;
  select id into mom from public.profiles where demo_family = fam and role = 'mother';
  update public.mothers set due_date = due_date + days, birth_date = birth_date + days where id = mom;
  update public.checkins set created_at = created_at + shift where mother_id = mom;
  update public.alerts set created_at = created_at + shift, seen_at = seen_at + shift where mother_id = mom;
  update public.moods set created_at = created_at + shift where mother_id = mom;
  update public.asks set needed_on = needed_on + days, taken_at = taken_at + shift, created_at = created_at + shift where mother_id = mom;
  update public.plans set for_date = for_date + days where mother_id = mom;
  update public.demo_families set claimed_at = now(), created_at = now(), ip_hash = ip where id = fam;
  return fam;
end
$$;
revoke all on function public.claim_demo_family(text) from public, anon, authenticated;
