-- People and who is linked to whom. The mother's circle and her care team are both links to her; what each person
-- sees is a list of scopes she controls. Nobody can write a link directly: it comes only from accepting an invite.

create type public.role as enum ('mother', 'circle', 'care_team');

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  role public.role not null,
  name text not null default '' check (length(name) <= 80),
  created_at timestamptz not null default now()
);

-- Same list as SCOPES in lib/people/access.ts (a unit test keeps them equal).
create function public.valid_scopes(s text[]) returns boolean language sql immutable set search_path = ''
as $$ select s <@ array['tasks', 'alerts', 'checkins', 'mood', 'baby', 'appointments', 'medicines']::text[] $$;

create table public.links (
  mother_id uuid not null references public.profiles on delete cascade,
  person_id uuid not null references public.profiles on delete cascade,
  kind text not null check (kind in ('circle', 'care_team')),
  relation text not null default '' check (length(relation) <= 40),
  partner boolean not null default false check (not partner or kind = 'circle'),
  sees text[] not null check (public.valid_scopes(sees)),
  created_at timestamptz not null default now(),
  primary key (mother_id, person_id),
  check (mother_id <> person_id)
);
create unique index links_one_partner on public.links (mother_id) where partner;
create index links_person on public.links (person_id);

-- A mother invites her circle or care team; a clinician invites a patient. The token is the link sent by email.
create table public.invites (
  token uuid primary key default gen_random_uuid(),
  from_id uuid not null references public.profiles on delete cascade,
  kind text not null check (kind in ('circle', 'care_team')),
  relation text not null default '' check (length(relation) <= 40),
  partner boolean not null default false check (not partner or kind = 'circle'),
  sees text[] not null check (public.valid_scopes(sees)),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '14 days',
  accepted_by uuid references public.profiles on delete set null
);
create index invites_from on public.invites (from_id);

-- Helpers for policies. Security definer so a policy on one table can read another without recursing.
create function public.my_role() returns public.role language sql stable security definer set search_path = ''
as $$ select role from public.profiles where id = auth.uid() $$;

create function public.linked(other uuid) returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.links
    where (mother_id = auth.uid() and person_id = other) or (mother_id = other and person_id = auth.uid())
  )
$$;

alter table public.profiles enable row level security;
alter table public.links enable row level security;
alter table public.invites enable row level security;

revoke all on public.profiles, public.links, public.invites from anon;
revoke update on public.profiles, public.links from authenticated;
grant update (name) on public.profiles to authenticated;
grant update (relation, partner, sees) on public.links to authenticated;
revoke insert on public.links from authenticated;

create policy "see yourself and people linked to you" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.linked(id));
create policy "create your own profile once" on public.profiles for insert to authenticated
  with check (id = (select auth.uid()));
create policy "change your own name" on public.profiles for update to authenticated
  using (id = (select auth.uid()));

create policy "both sides see the link" on public.links for select to authenticated
  using (mother_id = (select auth.uid()) or person_id = (select auth.uid()));
create policy "the mother decides what each person sees" on public.links for update to authenticated
  using (mother_id = (select auth.uid()));
create policy "either side can end the link" on public.links for delete to authenticated
  using (mother_id = (select auth.uid()) or person_id = (select auth.uid()));

create policy "see invites you sent" on public.invites for select to authenticated
  using (from_id = (select auth.uid()));
create policy "mothers invite anyone, clinicians invite patients" on public.invites for insert to authenticated
  with check (
    from_id = (select auth.uid())
    and accepted_by is null
    and (public.my_role() = 'mother' or (public.my_role() = 'care_team' and kind = 'care_team'))
  );
create policy "take back an invite" on public.invites for delete to authenticated
  using (from_id = (select auth.uid()));
revoke update on public.invites from authenticated;

-- Accepting an invite is the only way a link is made. The invite's direction comes from the inviter's role.
create function public.accept_invite(t uuid) returns void language plpgsql security definer set search_path = ''
as $$
declare
  inv public.invites;
  inviter public.role;
  me public.role := public.my_role();
begin
  select * into inv from public.invites where token = t and accepted_by is null and expires_at > now() for update;
  if not found then raise exception 'This invite has expired or was already used'; end if;
  if me is null then raise exception 'Create your profile first'; end if;
  select role into inviter from public.profiles where id = inv.from_id;
  if inviter = 'mother' then
    if me::text <> inv.kind then raise exception 'This invite is for a % account', inv.kind; end if;
    insert into public.links (mother_id, person_id, kind, relation, partner, sees)
    values (inv.from_id, auth.uid(), inv.kind, inv.relation, inv.partner, inv.sees)
    on conflict (mother_id, person_id) do update set kind = excluded.kind, relation = excluded.relation,
      partner = excluded.partner, sees = excluded.sees;
  else
    if me <> 'mother' then raise exception 'This invite is for a mother'; end if;
    insert into public.links (mother_id, person_id, kind, relation, sees)
    values (auth.uid(), inv.from_id, 'care_team', inv.relation, inv.sees)
    on conflict (mother_id, person_id) do nothing;
  end if;
  update public.invites set accepted_by = auth.uid() where token = t;
end
$$;

revoke execute on function public.accept_invite(uuid), public.my_role(), public.linked(uuid) from public, anon;
grant execute on function public.accept_invite(uuid), public.my_role(), public.linked(uuid) to authenticated;
