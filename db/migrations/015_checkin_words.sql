-- A check-in from Talk's instant path: the word scan found the signs in her words and she confirmed them. No model
-- ran, so "How this was decided" says so (source 'words', unlike 'talk' where the companion named the signs).
alter table public.checkins drop constraint checkins_source_check;
alter table public.checkins add constraint checkins_source_check check (source in ('tap', 'talk', 'mood', 'words'));
