# Rule Card Workspace v3

Status: implementation review  
Parent issues: #71 and #67  
Reviewed: 2026-07-27

## Purpose

Rule Card Workspace v3 preserves the exact D&D edition selected on every independent card copy. A saved card may no longer depend on temporary React state to remember whether it uses 2014 or 2024 rules.

## Persisted identity

Each `RuleCardInstance` stores:

- stable instance ID;
- catalog card ID;
- exact SRD ruleset;
- matching Card Platform `gameSystemId`;
- optional custom label;
- pinned state.

Supported identity pairs are:

- `srd-5.1-2014` → `dnd-2014`;
- `srd-5.2.1-2024` → `dnd-2024`.

Changing the edition toggle updates both values in one workspace mutation.

## User behavior

- Opening a saved table restores each copy in its saved edition.
- Adding a card from the Library stores the edition visibly selected on that card.
- Duplicate copies of the same catalog card may use different editions without overwriting one another.
- Roll-history entries continue recording the exact ruleset used for each roll.

## Storage migration

The current key is:

```text
dungeon-rule-card-workspace-v3-<role>
```

Loading follows this order:

1. Validate and normalize a v3 workspace.
2. Migrate a v2 instance workspace by assigning the preferred supported edition.
3. Migrate a v1 one-copy workspace from its active card IDs.
4. Fall back to a validated default workspace.

Migrated data is written to the v3 key by the existing save effect. Older keys remain untouched for rollback safety but are no longer written.

## Architecture cleanup

The former 179-line storage module is split into:

- workspace model and normalization;
- instance mutations;
- repository and migration logic;
- a small compatibility export barrel.

Rule roll execution was also extracted from the oversized state hook so card-state configuration and dice execution remain independently auditable.

## Boundaries

This slice covers Player and DM rule-card tables. Monster encounters, homebrew libraries, favorites, and other workspace families receive their own exact-system migration slices rather than being coupled to this schema change.
