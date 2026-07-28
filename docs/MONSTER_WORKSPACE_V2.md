# Monster Encounter Workspace v2

Status: superseded by `MONSTER_ENCOUNTER_WORKSPACE_V3.md`  
Parent issues: #71 and #67  
Originally reviewed: 2026-07-27

## Historical purpose

Monster Encounter Workspace v2 introduced separate browser-local encounter tables for D&D 2014 and D&D 2024. It prevented one mixed-edition monster table from reopening under another ruleset.

Its exact-edition browser keys were:

```text
dungeon-cards-workspace-v2-monster-dnd-2014
dungeon-cards-workspace-v2-monster-dnd-2024
```

The v2 model stored unique monster definition IDs. That made edition isolation reliable, but it could not represent multiple independent copies of the same creature and did not store per-combatant HP, initiative, conditions, reactions, recharge, or legendary-action state.

## v3 migration

Monster Encounter Workspace v3 replaces the unique-definition table with independent encounter instances. When no v3 save exists, the application reads the selected edition’s v2 key and converts every formerly active definition into one instance while preserving order and pins.

The old v2 keys remain untouched for rollback safety. New changes save only to the v3 exact-edition keys documented in `MONSTER_ENCOUNTER_WORKSPACE_V3.md`.