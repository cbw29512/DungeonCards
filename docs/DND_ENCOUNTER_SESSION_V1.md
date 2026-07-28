# D&D Encounter Session v1

Status: implementation candidate  
Parent issues: #100, #97, and #67  
Reviewed: 2026-07-28

## Purpose

The Initiative, Turns & Concentration tracker is a live-session workspace. Closing the tab, navigating elsewhere, refreshing the page, or switching editions must not silently destroy a running encounter.

## Exact-edition storage

Each edition uses a separate versioned browser-local key:

```text
dm-forge-dnd-encounter-session-v1-srd-5.1-2014
dm-forge-dnd-encounter-session-v1-srd-5.2.1-2024
```

Switching editions loads that edition's saved session. Combatants, monster references, and positions never cross the edition boundary.

## Automatically saved state

The snapshot includes:

- setup order or the active round and current turn;
- every combatant's name, side, initiative, Dexterity modifier, speed, and movement remaining;
- Action, Bonus Action, and Reaction availability;
- surprise state and remaining first-turn restriction;
- current, maximum, and temporary Hit Points;
- life state and Death Save counters;
- concentration and its effect name;
- timed/manual effects, save DCs, durations, and notes;
- imported monster action references;
- independent per-action recharge ready/spent state;
- grid position and creature size;
- source reference, AC, saving throws, and senses used by the live monster panel.

Transient form inputs such as the next manual combatant name or the most recent concentration-roll message are not session state and are not persisted.

## Reset behavior

- `End encounter` clears the active edition's saved session and returns it to an empty setup.
- `Clear saved setup` performs the same intentional reset before combat begins.
- Clearing one edition does not affect the other edition.

## Safe normalization

Loaded data is normalized before entering React state:

- crossed-edition snapshots are rejected;
- malformed JSON and unknown schema versions fall back to an empty exact-edition session;
- duplicate or missing combatant IDs are discarded;
- references and positions without a surviving combatant are discarded;
- HP, movement, initiative, rounds, effects, save DCs, coordinates, and recharge thresholds are bounded;
- strings and collection sizes are capped;
- invalid action kinds, effects, references, and positions are omitted;
- current turn index is clamped to the surviving combatant list.

## Release gates

- complete session round-trip test;
- turn-resource, HP, concentration, effect, recharge, and position preservation;
- exact-edition isolation;
- crossed reference and position removal;
- malformed JSON fallback;
- unknown schema fallback;
- crossed-edition fallback;
- edition-specific clear behavior;
- rendered-route, dependency, production-build, and security gates.