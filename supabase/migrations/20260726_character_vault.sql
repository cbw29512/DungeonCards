create extension if not exists pgcrypto;

create table if not exists public.character_vault_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  default_ruleset text not null default 'srd-5.2.1-2024'
    check (default_ruleset in ('srd-5.1-2014', 'srd-5.2.1-2024')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_characters (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  base_build_id text not null,
  display_name text not null,
  ruleset text not null
    check (ruleset in ('srd-5.1-2014', 'srd-5.2.1-2024')),
  level integer not null check (level between 1 and 20),
  current_hit_points integer not null check (current_hit_points >= 0),
  temporary_hit_points integer not null default 0 check (temporary_hit_points >= 0),
  inspiration boolean not null default false,
  death_save_successes integer not null default 0 check (death_save_successes between 0 and 3),
  death_save_failures integer not null default 0 check (death_save_failures between 0 and 3),
  resource_state jsonb not null default '{}'::jsonb,
  spell_slot_state jsonb not null default '{}'::jsonb,
  item_charge_state jsonb not null default '{}'::jsonb,
  attuned_item_ids jsonb not null default '[]'::jsonb,
  custom_notes text not null default '',
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, id)
);

create index if not exists saved_characters_owner_updated_idx
  on public.saved_characters (owner_id, updated_at desc);

alter table public.character_vault_profiles enable row level security;
alter table public.saved_characters enable row level security;

create policy "Profiles are readable by their owner"
  on public.character_vault_profiles for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Profiles are insertable by their owner"
  on public.character_vault_profiles for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Profiles are updatable by their owner"
  on public.character_vault_profiles for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Saved characters are readable by their owner"
  on public.saved_characters for select
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Saved characters are insertable by their owner"
  on public.saved_characters for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Saved characters are updatable by their owner"
  on public.saved_characters for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Saved characters are deletable by their owner"
  on public.saved_characters for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

create or replace function public.set_character_vault_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger character_vault_profiles_updated_at
before update on public.character_vault_profiles
for each row execute function public.set_character_vault_updated_at();

create trigger saved_characters_updated_at
before update on public.saved_characters
for each row execute function public.set_character_vault_updated_at();
