# D&D Homebrew Card Storage v2

Status: implementation review  
Parent issues: #71 and #67  
Reviewed: 2026-07-27

## Purpose

Homebrew Card Storage v2 gives every locally created D&D Dice card an exact Card Platform system identity. A custom card is no longer an unscoped record that can silently appear in both D&D editions.

## Stored card contract

A `HomebrewDiceCard` extends the legacy Dice card shape with:

- `schemaVersion: 2`;
- `gameSystemId: "dnd-2014" | "dnd-2024"`.

The storage envelope is written under:

```text
dungeon-cards.homebrew.v2
```

The envelope validates schema version, exact system identity, unique card IDs, field lengths, thresholds, and dice formulas before loading or saving.

## Builder behavior

- The builder requires an explicit D&D 2014 or D&D 2024 edition selection.
- The selected edition is converted to the exact Card Platform system ID before creation.
- The workspace displays only cards matching the selected edition.
- Switching editions changes the visible private library without rewriting the other edition’s cards.
- Card rendering and preview continue using the universal 250 × 350 pixel / 2.5 × 3.5 inch card footprint.

## Legacy migration

The former key is:

```text
dungeon-cards.homebrew.v1
```

Legacy records contain no edition evidence. To avoid pretending that the old data is edition-neutral, migration assigns those records to `dnd-2024`, writes the new v2 envelope, and displays a visible notice explaining the assignment. The original v1 key remains untouched for rollback safety.

Users may recreate a 2014 copy when the custom rule is appropriate for that edition. The application does not silently duplicate legacy cards into both libraries.

## Architecture cleanup

The former 179-line builder is split into:

- a state and validation hook;
- an edition-aware form;
- a universal-size live preview;
- an edition-filtered D&D homebrew workspace.

The former 180-line stylesheet is split into core builder/preview styling and action/responsive styling. The application shell now renders one focused homebrew workspace component rather than composing the builder and library inline.

## Release gates

- v2 save/load tests;
- invalid system, envelope, formula, and duplicate-ID rejection;
- v1 migration tests;
- default 2024 library isolation rendering test;
- explicit migration-notice rendering test;
- dependency audit, full unit tests, strict TypeScript build, production export, universal-card checks, and security scan.
