-- A small pool of demo families made ahead, so "Try it as Maya" opens at once. Claiming one moves its whole story to
-- now (yesterday's check-in is still yesterday's, today's asks are still today's), then counts its two days from now.
alter table public.demo_families add column claimed_at timestamptz;
update public.demo_families set claimed_at = created_at;
alter table public.demo_families alter column ip_hash drop not null;
create index demo_families_pool on public.demo_families (created_at) where claimed_at is null;

create function public.claim_demo_family(ip text) returns uuid language plpgsql security definer set search_path = ''
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
  update public.demo_families set claimed_at = now(), created_at = now(), ip_hash = ip where id = fam;
  return fam;
end
$$;
revoke all on function public.claim_demo_family(text) from public, anon, authenticated;
