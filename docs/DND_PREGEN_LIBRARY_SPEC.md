# D&D Premade Character Library

## Objective

Provide ready-to-play D&D characters for every legally supported edition, class, subclass, and level without mixing rules or exposing incomplete sheets.

## Release Contract

A public character is selectable only when:

1. its schema is complete;
2. every source matches its edition;
3. all derived values pass automated checks;
4. a rules reviewer has approved it;
5. it has been playtested;
6. `reviewStatus` is `verified` and `reviewedAt` is recorded.

Draft records must never appear in the public picker.

## Content Boundary

- `srd`: reusable SRD 5.1 or SRD 5.2.1 material with attribution;
- `original`: DM Forge names, tactics, personalities, and original compatible content;
- `owned`: private user-provided material that is stored locally and is never committed to the public catalog.

Paid-book and other non-SRD subclasses cannot be copied into the public repository without a separate license.

## Generation Model

Do not hand-author one independent sheet for every level. Use deterministic blueprints:

```text
PregenBlueprint
  + edition option catalog
  + class progression
  + subclass progression
  + species/background package
  + level package
  + equipment/spell strategy
  = PregenCharacter
```

The same blueprint and level must always generate the same rules record.

## Core Records

### `PregenBlueprint`

Stores the stable build strategy: edition, class, subclass, ability plan, proficiencies, equipment, spell choices, role, complexity, personality, tactics, source references, and level packages.

### `PregenCharacter`

Stores the generated ready-to-play sheet: identity, level, abilities, proficiency bonus, AC, HP, speed, initiative, saves, skills, attacks, resources, features, spellcasting, equipment, tactics, sources, and review metadata.

## Derived Values

Derived values must come from tested functions rather than duplicated numbers:

- ability modifiers;
- proficiency bonus;
- initiative;
- saving throws and skills;
- passive values;
- spell attack bonus and save DC;
- maximum HP and hit dice;
- class/subclass resource maxima;
- spell slots and prepared/known limits.

## Coverage Matrix

The CI coverage gate will track each supported tuple:

```text
edition × class × subclass × level 1–20
```

A tuple is complete only when exactly one verified public pregen exists. Unsupported or owned-source tuples remain explicit and do not count as public coverage.

## Delivery Phases

1. Route, schema, validator, filters, tests, and empty-state workspace.
2. Edition-separated SRD class, subclass, species, background, and feat catalogs.
3. Character progression and derived-stat engine.
4. Reference blueprints for every public class/subclass.
5. Levels 1–20 generation and catalog-wide verification.
6. Printable sheet and Player Workspace / encounter import.
7. Private owned-content import.

## File Boundaries

Keep each module under 150 lines where practical:

- `src/types/pregens.ts`: schema only;
- `src/utils/pregenCatalog.ts`: validation and filtering;
- future `src/utils/pregenGenerator.ts`: deterministic generation;
- future edition data files: one concern per file;
- `src/components/DndPregenLibrary.tsx`: picker and catalog display;
- print and responsive styles remain separate.
