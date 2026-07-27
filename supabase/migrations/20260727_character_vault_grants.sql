grant usage on schema public to authenticated;

grant select, insert, update
  on table public.character_vault_profiles
  to authenticated;

grant select, insert, update, delete
  on table public.saved_characters
  to authenticated;

revoke all
  on table public.character_vault_profiles
  from anon;

revoke all
  on table public.saved_characters
  from anon;
