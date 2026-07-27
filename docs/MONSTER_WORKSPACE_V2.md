# Monster Encounter Workspace v2

Status: implementation review  
Parent issues: #71 and #67  
Reviewed: 2026-07-27

## Purpose

Monster Encounter Workspace v2 gives D&D 2014 and D&D 2024 independent local encounter tables. A DM can no longer save one mixed-edition monster table and unknowingly reopen it under another ruleset.

## Exact workspace identity

Each generic `CardWorkspace` now stores a Card Platform `gameSystemId`. Monster workspaces use:

- `dnd-2014` for SRD 5.1 encounters;
- `dnd-2024` for SRD 5.2.1 encounters.

The browser keys are:

```text
dungeon-cards-workspace-v2-monster-dnd-2014
dungeon-cards-workspace-v2-monster-dnd-2024
```

Changing the Encounter Edition selector loads the matching independent workspace.

## Catalog boundary

A monster encounter library contains:

- SRD monsters from the selected exact edition;
- locally created homebrew monsters.

It excludes SRD monsters from the other edition. Homebrew entries remain available in both workspaces because the workspace itself supplies the edition context in which the DM is using that private creature.

## Legacy migration

The repository checks the exact v2 key first. If none is valid, it reads the former role-only v1 key and filters the legacy IDs through the selected edition’s allowed catalog.

This means a previously mixed encounter migrates safely:

- 2014 SRD IDs move only into the 2014 workspace;
- 2024 SRD IDs move only into the 2024 workspace;
- homebrew IDs may appear in both when they remain available;
- unknown or removed IDs are discarded;
- the legacy key is left untouched for rollback safety.

## UI behavior

- The former All/2014/2024/Homebrew ruleset filter is replaced by an explicit 2014 or 2024 Encounter Edition selector.
- Search and creature-type filters operate only inside the selected edition-safe catalog.
- The toolbar count and DM Forge handoff use the selected exact workspace.
- Reset clears only the selected edition’s encounter.
- Card size remains the universal 250 × 350 pixel / 2.5 × 3.5 inch standard.

## Architecture cleanup

The former 163-line generic storage module is split into:

- workspace model and normalization;
- workspace mutations and ordering;
- repository and legacy migration;
- a small compatibility export barrel.

The former oversized Monster Deck is split into orchestration, filters, and card-grid rendering components.

## Release gates

- separate-key storage tests;
- legacy mixed-workspace filtering tests;
- cross-system rejection tests;
- exact-key clear tests;
- pure catalog boundary and filter tests;
- full dependency audit, unit tests, strict TypeScript build, production export, and security scan.
