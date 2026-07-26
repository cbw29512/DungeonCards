# D&D Character Vault v2

## Objective

Players choose an edition, class, public subclass, and level, then receive an optimized ready-to-play character that can be browsed anonymously, printed, or copied into a signed-in personal vault.

The interface may use familiar character-sheet information hierarchy, but it must remain an original DM Forge design. Do not copy D&D Beyond logos, artwork, wording, colors, icons, or pixel-identical trade dress.

## Product Flow

```text
Public optimized build
  -> choose edition / class / subclass / level
  -> inspect Actions / Spells / Features / Inventory / Notes / Build Guide
  -> print anonymously
  -> sign in to save a personal copy
  -> persist play state across devices
```

## Release States

- **Blueprint:** class path and level exist, but required build data is incomplete.
- **Ready to play:** the original character record passes the current eleven-category gate.
- **Vault Ready:** the record also passes optimization, advancement, magic-item, attunement, tactics, source, and sheet-v2 gates.

A display label never controls release state.

## Optimized Build Contract

Every Vault Ready build includes:

- a defined combat and exploration role;
- a beginner, standard, or advanced complexity rating;
- a concise build goal;
- explicit ASI, feat, and class-option choices at the levels where they occur;
- legal prerequisites and public source references;
- class-specific tactics and a first-round plan;
- spells, equipment, resources, and attacks selected for the build goal;
- an explanation for every magic item and advancement choice.

## Magic-Item Policy

The 2024 default follows the official Starting Equipment at Higher Levels guide:

| Starting level | Default magic items |
| --- | --- |
| 1 | None |
| 2–4 | 1 Common |
| 5–10 | 1 Common, 1 Uncommon |
| 11–16 | 2 Common, 3 Uncommon, 1 Rare |
| 17–20 | 2 Common, 4 Uncommon, 3 Rare, 1 Very Rare |

The 2014 public Vault uses the same counts as an original conservative compatibility preset, not as a claim that the table appears in the 2014 Basic Rules. A DM-facing control can later select another campaign item policy.

All builds enforce:

- no more than three attuned items;
- no default attunement for items that do not require it;
- no duplicate attunement to the same named item;
- level and class prerequisites;
- valid charge maxima;
- visible consumable, recharge, effect, source, and synergy data.

## Character-Sheet Information Architecture

### Header

- original portrait or placeholder;
- name, edition, level, class, subclass, species, and background;
- inspiration, proficiency, AC, HP, initiative, speed, senses, and passive scores;
- Save, Duplicate, Print, and Archive actions when signed in.

### Tabs

1. **Actions:** attacks, action economy, damage, saves, resources, conditions, and death saves.
2. **Spells:** casting ability, attack bonus, save DC, cantrips, prepared/known spells, and slot tracking.
3. **Features:** class, subclass, species, background, and feat features.
4. **Inventory:** mundane gear, currency, magic items, attunement, charges, and consumables.
5. **Notes:** personality, campaign notes, and custom reminders.
6. **Build Guide:** role, optimization choices, level-by-level advancement, tactics, and item synergy.

## Print Packet

Print output is a predictable black-and-white packet:

1. core statistics and actions;
2. spells when applicable;
3. features and resources;
4. inventory and magic items;
5. build guide and sources.

Navigation, buttons, tracker controls, and authentication UI are hidden in print mode. Page breaks are deliberate, and no card may be clipped across pages when avoidable.

## Account Architecture

Supabase is the selected implementation target because the React client supports browser authentication and the Postgres database supports Row Level Security.

Anonymous users can browse and print. Signed-in users can save, rename, duplicate, archive, and delete personal copies. Email magic link is the minimum login method; Google OAuth is optional after provider configuration.

The browser uses only the Supabase project URL and publishable key. Service-role credentials never enter client code.

## Persistence Boundary

Public build definitions remain version-controlled and immutable at runtime. Saved characters store only player-owned state and reference a public `baseBuildId`.

Persisted state includes:

- current and temporary HP;
- inspiration and death saves;
- resource and spell-slot usage;
- item charges and attunement;
- custom display name and notes;
- archive state and timestamps.

Postgres RLS restricts every profile and saved-character row to `auth.uid()`.

## Delivery Sequence

1. Consolidate completed ladders into one live catalog.
2. Land the Vault v2 types, validators, SQL schema, and tests.
3. Migrate one completed class ladder to Vault Ready with feats and magic items.
4. Build the original tabbed sheet and print packet against that reference ladder.
5. Add Supabase client/auth and saved-character repository after project credentials are configured.
6. Migrate remaining completed ladders, then continue unfinished classes.
