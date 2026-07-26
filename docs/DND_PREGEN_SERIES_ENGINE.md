# D&D Pregen Series Engine

## Objective

Produce ready-to-play level 1–20 characters from stable class/subclass blueprints without duplicating identity data or allowing incomplete sheets to appear as finished.

## Stable Build Identity

Every slot uses:

```text
ruleset × classId × subclassId × level
```

Example:

```text
srd-5.2.1-2024-fighter-champion-5
```

The subclass segment is mandatory. It prevents two subclasses of the same class and level from sharing a slot or picker value.

## Generation Flow

```text
DndPregenSeriesBlueprint
  + DndPregenLevelPackage
  -> generateDndPregenLevel
  -> DndCharacterRecord
  -> validateDndCharacterRecord
  -> success or explicit validation issues
```

The series blueprint stores stable identity, edition, class, subclass, species, background, and sources. Each level package stores the final level-specific statistics, proficiencies, attacks, resources, spellcasting, features, equipment, and print-review state.

## Failure Rules

The generator never invents missing advancement data.

- Levels outside 1–20 fail explicitly.
- Missing level packages fail explicitly.
- Invalid generated records return readiness findings by category.
- Unexpected failures are logged with blueprint ID and level.
- Series generation returns one result for every level, so coverage gaps remain visible.

## Shared Promotion Gate

Generated records must pass the existing character-record validator. The gate covers identity, abilities, defenses, proficiencies, combat, resources, spellcasting, advancement, equipment, sources, and print review.

The identity check also verifies that `buildSlotId` matches the record's edition, class, subclass, and level.

## Module Boundaries

- `dndCharacterMath.ts`: shared derived-number functions.
- `dndCharacterBlueprint.ts`: empty record construction and spellcasting expectations.
- `dndCharacterValidation.ts`: promotion gate.
- `dndCharacterRecord.ts`: compatibility re-exports.
- `dndPregenSeries.ts`: deterministic level generation.
- `DndPregenLibrary.tsx`: picker state and selected blueprint display.
- `DndPregenValidationPanel.tsx`: validation presentation.

## Publishing Boundary

Public blueprints may use SRD 5.1, SRD 5.2.1, and original compatible content with required attribution. Paid-book subclasses and protected text require a private user-owned import layer.

## Next Data Layer

1. Import edition-separated SRD species, backgrounds, feats, class progressions, and equipment choices.
2. Define one reviewed level series for every public class/subclass path.
3. Generate all twenty records per series.
4. Add catalog-wide uniqueness and completeness checks.
5. Render printable quick-play and full-reference sheets.
6. Load verified pregens into Player Workspace and live combat.
