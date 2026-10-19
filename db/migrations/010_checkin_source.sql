-- Where a check-in came from: the tap list, or her words to the companion (where the model named the signs and the
-- rules decided). Shown in "How this was decided".
alter table public.checkins add column source text not null default 'tap' check (source in ('tap', 'talk'));
