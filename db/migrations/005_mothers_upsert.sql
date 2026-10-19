-- Saving her dates is an upsert, which updates every column it sends, so the update grant covers the row; the
-- policy keeps it to her own row, and the check stops the id being changed to someone else's.
grant update on public.mothers to authenticated;
drop policy "she changes her own dates" on public.mothers;
create policy "she changes her own dates" on public.mothers for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
