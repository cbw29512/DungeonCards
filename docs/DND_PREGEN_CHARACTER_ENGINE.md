# D&D Pregen Character Engine

## Objective

Generate complete, edition-separated, ready-to-play characters for every supported class, subclass, and level without maintaining unrelated hand-written sheets.

## Identity Matrix

Every public build slot uses this stable key:

```text
ruleset × classId × subclassId × level
```

Example:

```text
srd-5.2.1-2024-fighter-champion-5
```

Including `subclassId` prevents future subclasses for the same class and level from colliding.

## Data Flow

```text
DndPregenBlueprint
  + reviewed DndPregenLevelPackage
  -> generateDndPregenCharacter
  -> DndPregenCharacterRecord
  -> validateDndPregenCharacter
  -> checked-in public catalog
  -> Ready-to-play build slot
```

A blueprint stores stable identity, source, role, personality, and tactics. Each level package stores the level-specific statistics, features, attacks, resources, spells, and equipment.

## Ready-to-Play Gate

A record is not ready unless all of these conditions pass:

- level is an integer from 1 through 20;
- slot ID exactly matches ruleset, class, subclass, and level;
- proficiency bonus matches level;
- all six ability scores are valid;
- AC, HP, Speed, and Initiative are valid;
- class, subclass, species, and background identities exist;
- source references use HTTPS and match the selected edition;
- at least one attack or action exists;
- equipment and table tactics exist;
- standard spell attack and save DC formulas match when spellcasting exists;
- review status is `verified` and a review date is recorded.

## Catalog Audit

CI rejects:

- invalid character records;
- duplicate character IDs;
- duplicate build-slot assignments;
- records assigned to unknown slots;
- incomplete production records that claim to be verified.

If two verified records claim the same slot, neither silently wins. The slot remains a Blueprint until the conflict is resolved.

## Generation Failure Rules

The generator never invents missing level data.

- Levels outside 1–20 return an explicit error.
- A missing level package returns an explicit error.
- Validation issues return with the generated level.
- Unexpected failures are logged with blueprint ID and level.
- Generating a series returns one result for every level, making incomplete coverage visible.

## Publishing Boundary

Public records may contain SRD 5.1, SRD 5.2.1, and original compatible content with appropriate attribution. Paid-book subclasses and other protected material require a private owned-content layer and must not enter the public catalog.

## Next Implementation Layer

1. Import edition-separated SRD species, backgrounds, feats, and class progression.
2. Define reviewed level packages for one reference blueprint per public class/subclass path.
3. Generate and validate levels 1–20.
4. Add complete character rendering and print output.
5. Load verified characters into Player Workspace and live combat.
6. Expand with additional original subclasses or private owned-content imports.
