# DM Forge Master Card Platform Roadmap

Status: controlling architecture roadmap  
Master epic: #67  
Reviewed: 2026-07-27

## Objective

Build one card-centered tabletop operating library for D&D 2014, D&D 2024, and Call of Cthulhu 7th Edition.

The card platform is the center. Characters, compendiums, encounters, maps, and campaign tools create, consume, equip, pin, track, search, organize, or print cards.

## Product domains

1. **Card Platform** — identities, types, sources, visibility, actions, resources, runtime instances, decks, search, favorites, print, import/export.
2. **D&D Library** — 2014/2024 rules, spells, monsters, equipment, conditions, DM procedures, encounters, builders, and private owned-content imports.
3. **Character Vault** — optimized builds, sheets, saved play state, print packets, and character-generated decks.
4. **Call of Cthulhu Library** — Investigator and Keeper cards, percentile procedures, weapons, creatures/NPCs, spells/rituals, encounters, clues, handouts, and builders.
5. **Campaign and Map Tools** — system-agnostic map/token assets, per-game instances, scenes, clues, locations, notes, timelines, and card links.
6. **Homebrew and Private Content** — validated original/private cards and versioned import/export without public redistribution of protected content.

## Required identities

Persisted content must use exact system identity:

```ts
export type GameSystemId = "dnd-2014" | "dnd-2024" | "coc-7e";
```

The broad D&D gateway may group editions visually. Cards, saved state, decks, history, encounters, builders, and imports may not collapse the editions.

## Card Platform v2 target

The current `DiceCard` model is a legacy subtype, not the future root contract.

The root card definition needs:

- stable ID and schema version;
- exact game-system identity;
- card type and tags;
- public, player-safe, Keeper-only, or private visibility;
- source, license, edition, review status, and review date;
- concise face content and expandable folio content;
- executable rolls, guided procedures, and tracked resources;
- print-layout metadata;
- linked cards and sequences;
- immutable library definition separated from runtime instance state.

Required card families include rules, actions, spells, rituals, weapons, items, conditions, creatures/NPCs, clues, handouts, locations, scenes, tables, generators, and character/investigator actions.

## Runtime instance target

One library card may have multiple independent instances. Runtime state may include:

- custom name;
- owner and visibility;
- HP, Magic Points, Sanity, Luck, ammunition, charges, spell slots, uses, and duration;
- conditions and temporary modifiers;
- encounter order or map position;
- private and player-safe notes;
- archived/defeated state.

Changing an instance must never mutate the library definition or another instance.

## Current verified baseline

- D&D/Call of Cthulhu system gateway;
- D&D rule, roll, monster, spell, condition, equipment, encounter, and homebrew tools;
- 658 generated D&D spells and 642 generated D&D monsters;
- Call of Cthulhu percentile, Sanity, Luck, weapon, firearm, injury, healing, investigator, Keeper, and procedure components;
- tabbed Character Vault sheet and print packet;
- 120 Vault Ready D&D builds across Fighter/Champion, Barbarian/Berserker, and Cleric/Life;
- optional Supabase login and owner-only saved-character storage.

## Audit gaps

- `src/types/cards.ts` lacks exact game-system identity and models only dice-card categories.
- `App.tsx` is oversized and combines system gateway, D&D shell, navigation, routing, and workspace composition.
- Call of Cthulhu remains concentrated in `CocPreview` rather than routed Investigator/Keeper library areas.
- Saved Character Play Mode exists only as unfinished local work and is not source-controlled remotely.
- README and product copy became stale after account support.
- stale pre-Vault PRs were still open and could have overwritten current architecture.
- browser Supabase configuration needed explicit secret/service-role rejection.
- full-history credential scanning needed rebuilding from current `main`.

## Controlled delivery order

1. Security/configuration audit and secret scan.
2. Recover, split, test, and merge Saved Character Play Mode.
3. Add Card Platform v2 schemas and migration adapters without breaking legacy cards.
4. Split application composition into system gateway, D&D shell, and Call of Cthulhu shell.
5. Make decks, favorites, history, builders, and workspace storage system/edition safe.
6. Generate reusable cards from Character Vault actions, spells, features, conditions, and items.
7. Continue D&D rules/DM coverage and remaining Vault Ready ladders in parallel.
8. Route Call of Cthulhu into Investigator, Keeper, Rules, Weapons, Spells/Rituals, Creatures/NPCs, Encounters, and Builders.
9. Link cards to campaigns, scenes, maps, tokens, encounters, and handouts.
10. Rebuild deferred export/security ideas only from current `main`.

## PR anti-drift checklist

Every PR must state:

- product track;
- supported system and exact edition;
- how it strengthens or consumes cards;
- public/private/source boundary;
- library definitions and runtime state affected;
- persistence and migration impact;
- responsive, accessibility, and print behavior;
- tests and validation gates;
- shared-platform debt created or removed.

A PR that does not strengthen the card-centered multi-system library requires explicit justification before merge.
