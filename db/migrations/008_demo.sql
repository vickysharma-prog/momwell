-- The judge demo: one click makes a fresh family (a mother, her partner, her OB-GYN) for that visitor alone, so
-- visitors never share or overwrite each other's data. Families are marked, rate-limited by a hashed IP, and
-- removed after two days by the cleanup route.
create table public.demo_families (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  created_at timestamptz not null default now()
);
create index demo_families_ip on public.demo_families (ip_hash, created_at desc);
alter table public.demo_families enable row level security;
revoke all on public.demo_families from anon, authenticated;

alter table public.profiles add column demo_family uuid references public.demo_families on delete cascade;
create index profiles_demo_family on public.profiles (demo_family) where demo_family is not null;
