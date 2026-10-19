-- Private server-side cache of Qloo responses (Qloo allows private caching). A repeat question never spends quota.
-- Only the service role reads and writes it; row-level security with no policies blocks everyone else.
create table public.qloo_cache (
  key text primary key,
  path text not null,
  body jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.qloo_cache enable row level security;
revoke all on public.qloo_cache from anon, authenticated;
