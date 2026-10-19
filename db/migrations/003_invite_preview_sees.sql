-- The invite page shows what the inviter will see, so the mother agrees to it before accepting.
drop function public.invite_preview(uuid);
create function public.invite_preview(t uuid)
returns table (from_name text, from_role public.role, kind text, relation text, partner boolean, sees text[], usable boolean)
language sql stable security definer set search_path = ''
as $$
  select p.name, p.role, i.kind, i.relation, i.partner, i.sees, i.accepted_by is null and i.expires_at > now()
  from public.invites i join public.profiles p on p.id = i.from_id
  where i.token = t
$$;

revoke execute on function public.invite_preview(uuid) from public;
grant execute on function public.invite_preview(uuid) to anon, authenticated;
