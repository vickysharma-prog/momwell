-- What she loves, for Qloo: her city, her diet, and the shows, films and artists she picks. Hers to set; her circle
-- reads it when she shares "Ways to help", so the help they offer fits her.
create function public.valid_diets(d text[]) returns boolean language sql immutable set search_path = ''
as $$ select d <@ array['vegetarian', 'vegan', 'gluten_free', 'halal', 'kosher']::text[] $$;

create table public.tastes (
  mother_id uuid primary key references public.profiles on delete cascade,
  city text not null default '' check (length(city) <= 80),
  diets text[] not null default '{}' check (public.valid_diets(diets)),
  liked jsonb not null default '[]' check (jsonb_typeof(liked) = 'array' and jsonb_array_length(liked) <= 30),
  updated_at timestamptz not null default now()
);

alter table public.tastes enable row level security;
revoke all on public.tastes from anon;

create policy "her taste: hers, and those she lets help" on public.tastes for select to authenticated
  using (public.can_see(mother_id, 'tasks'));
create policy "she sets her taste" on public.tastes for insert to authenticated
  with check (mother_id = (select auth.uid()) and public.my_role() = 'mother');
create policy "she changes her taste" on public.tastes for update to authenticated
  using (mother_id = (select auth.uid())) with check (mother_id = (select auth.uid()));
