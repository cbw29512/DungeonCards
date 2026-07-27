# Card Platform v2 Foundation

Status: implementation review  
Parent issues: #71 and #67  
Reviewed: 2026-07-27

## Purpose

Card Platform v2 provides one versioned contract for the card-centered D&D 2014, D&D 2024, and Call of Cthulhu 7e library without breaking the existing Dice, Rule, monster, Character Vault, or CoC components.

## Exact system identity

Persisted definitions, runtime instances, decks, deck state, and exports use one of:

```ts
"dnd-2014" | "dnd-2024" | "coc-7e"
```

The broad D&D user interface may group editions, but stored cards and runtime state may not collapse them.

## Definition versus runtime state

A `CardDefinition` is a reusable, immutable or versioned library asset. It contains:

- stable ID and schema version;
- exact game-system identity;
- family and visibility;
- concise face content and tags;
- source, license, distribution, and review metadata;
- executable actions and tracked-resource declarations;
- linked-card identities;
- print-layout metadata.

A `CardRuntimeInstance` is an independently tracked copy. It contains:

- its own ID and definition reference;
- exact game-system identity;
- optional owner, custom name, and visibility;
- current resource values, conditions, notes, archive state, and timestamps.

Changing one runtime copy never mutates the library definition or another copy.

## Supported card families

The root schema supports rules, guided procedures, roll/actions, spells, rituals, weapons, items, conditions, creatures, NPCs, clues, handouts, locations, scenes, tables, generators, character actions, and investigator actions.

## Universal physical size

Standard cards and folio panels use the locked `poker-2.5x3.5` size ID:

- 250 × 350 pixels on screen;
- 2.5 × 3.5 inches in print;
- 5:7 aspect ratio.

Large trackers remain explicitly named responsive workspace panels rather than oversized cards.

## Visibility and publishing boundary

Visibility is one of public, player-safe, game-master-only, or private. Public and player-safe cards require a source marked for public distribution. User-owned private sources can never be marked distributable.

This contract supports SRD, free-rules, original, licensed, user-owned private, and reference-only source kinds without implying that source access grants redistribution rights.

## Compatibility layer

The first adapters project existing models into v2 definitions:

- legacy `DiceCard` becomes a `roll-action` card;
- a D&D `RuleCard` variant becomes an exact `dnd-2014` or `dnd-2024` card;
- formulas, tags, source references, actions, and universal print sizing are retained;
- existing components continue consuming their current models during migration.

No existing model is removed in this foundation PR.

## Validation gates

Definition validation rejects unsafe IDs, missing content, duplicate tags/actions/resources/links, invalid sources, unreviewed verified cards, malformed actions/resources, self-links, and nonstandard card print sizes.

Runtime validation rejects mismatched definitions, cross-system instances, missing or unknown resources, values outside declared limits, duplicate conditions, private instances without owners, invalid timestamps, and foreign-system cards inside decks.

## Delivery sequence

1. Merge schemas, validators, factories, and legacy Dice/Rule adapters.
2. Add system identity to deck, favorites, history, builder, and workspace persistence.
3. Add monster and Call of Cthulhu adapters.
4. Generate action, spell, feature, condition, and item cards from Character Vault profiles.
5. Add versioned import/export migrations.
6. Remove legacy root assumptions only after every consumer has an adapter and green regression coverage.
