# Monster Encounter Workspace v3

Status: implemented and regression-tested  
Parent issues: #100, #97, and #67  
Reviewed: 2026-07-28

## Purpose

Monster Encounter Workspace v3 treats a monster definition and an encounter combatant as different things.

The Monster Library contains one canonical Goblin definition. The active encounter may contain Goblin 1, Goblin 2, Goblin 3, and any number of additional independent instances. Repeated combatants are not duplicate catalog content.

## Exact-edition persistence

Each edition keeps a separate versioned browser-local encounter:

```text
dungeon-monster-encounter-v3-dnd-2014
dungeon-monster-encounter-v3-dnd-2024
```

Changing the Encounter Edition selector loads the matching workspace. SRD records never cross editions. Homebrew definitions remain available in either exact-edition workspace as private user material.

## Instance state

Every combatant stores:

- stable instance ID and source monster ID;
- editable encounter label;
- current and maximum Hit Points;
- initiative;
- active conditions;
- universal reaction availability;
- recharge ready/spent state when the stat block contains recharge text;
- legendary-action maximum and remaining budget;
- pin and display order.

Start Turn refreshes the creature's reaction and legendary-action budget. It deliberately does not mark a recharge ability ready; the DM resolves the listed recharge roll and updates that state explicitly.

## Library and table behavior

- Library cards appear once per canonical monster definition.
- `Add to My Encounter` becomes `Add another` after the first copy.
- The active table renders every combatant independently and is never narrowed by Monster Library discovery filters.
- Library search, type, size, CR, capability, and sorting controls appear only in the Library view.
- Removing one instance does not remove other copies or the canonical library definition.
- Automatically generated encounter labels use the first available positive copy number, so removing and re-adding a creature cannot create duplicate visible labels.
- Initiative sorting places known values high-to-low and leaves unrolled combatants last while preserving the pinned group.

## Hit Point handling

- A new combatant starts at the average Hit Points listed by its source record.
- Maximum HP is editable for rolled or scenario-adjusted monster Hit Points.
- Changing maximum HP while the creature is still at full health moves current HP to the new maximum.
- Changing maximum HP after damage preserves current HP unless it must be clamped down to the new maximum.
- Current HP remains bounded between zero and maximum HP.

## Migration

If no v3 workspace exists, the repository reads the former exact-edition v2 key:

```text
dungeon-cards-workspace-v2-monster-dnd-2014
dungeon-cards-workspace-v2-monster-dnd-2024
```

Each formerly active definition becomes one independent instance. Order and pinned state are preserved. Unknown or removed monster IDs are discarded. The old key remains untouched for rollback safety.

## DM Forge handoff

DungeonCards keeps independent combat state locally. The version-1 DM Forge handoff groups repeated source definitions into quantities:

- Goblin 1 + Goblin 2 + Goblin 3 → Goblin, quantity 3;
- Ogre 1 → Ogre, quantity 1.

Only verified same-edition SRD monsters transfer under the current handoff schema. Homebrew transfer remains blocked until its versioned schema is complete.

## Accuracy rules

- Every creature receives a once-per-round reaction budget, even if its stat block has no special Reactions section.
- A special Reactions section is signaled separately from the universal reaction budget.
- Legendary-action maximum is parsed from explicit source text when available and otherwise defaults to the standard three only when legendary actions exist.
- Conditions come from the selected edition's condition library.

## Release gates

- repeated-definition instance and unique-label tests;
- independent current/maximum HP, initiative, and condition tests;
- reaction, recharge, and legendary-turn refresh tests;
- initiative ordering tests;
- library-versus-table control rendering tests;
- state normalization and clamping tests;
- exact-edition save/load tests;
- v2 migration tests;
- malformed-storage fallback tests;
- handoff quantity aggregation tests;
- rendered-route, dependency, build, and security gates.