# Dungeon Cards

Dungeon Cards is a React and TypeScript tabletop toolkit for D&D SRD 5.1, D&D SRD 5.2.1, original Homebrew content, and a separate Call of Cthulhu 7e procedure prototype.

The application combines:

- complete licensed D&D spell and monster reference catalogs;
- fast executable Player and DM roll cards;
- independent personal card copies;
- encounter-ready monster cards and ordered boss folios;
- plain-language D&D and Call of Cthulhu rules guides;
- original homebrew card and monster builders.

## D&D areas

### Rules Guide

The D&D Rules Guide explains common table procedures before presenting source details:

- d20 tests;
- Advantage and Disadvantage;
- attacks and damage;
- checks and saving throws;
- turn structure;
- hit points and death;
- concentration and spellcasting;
- keeping 2014 and 2024 rules separate.

### SRD Compendium

The Compendium is generated from the official Wizards of the Coast SRD PDFs and includes:

| Ruleset | Spells | Monsters |
|---|---:|---:|
| SRD 5.1 — 2014 | 319 | 314 |
| SRD 5.2.1 — 2024 | 339 | 328 |
| **Combined** | **658** | **642** |

Users can:

- switch between Spells and Monsters;
- search by name and relevant metadata;
- filter 2014, 2024, or both editions;
- page through large catalogs;
- open complete source-reference text;
- see exact source pages and edition labels.

The generator records the official PDF URL, SHA-256 digest, source version, page references, and CC BY 4.0 attribution. It rejects duplicate IDs, missing fields, edition leakage, clipped components, missing 2024 class lists, and visible PDF line-wrap artifacts.

### Player and DM cards

Executable cards currently include:

- complete SRD 5.1 weapon table: 37 weapons;
- complete SRD 5.2.1 weapon table: 38 weapons;
- separate weapon Attack, Damage, and eligible Quick Roll cards;
- generic Attack Roll, Saving Throw, and Ability Check cards;
- six individual ability saving throws;
- eighteen individual skill checks;
- twenty-two automated spell families;
- selected traps, magic items, and random tables.

Configured cards roll from the result face. Cards that allow Advantage use mutually exclusive **Normal**, **ADV**, and **DIS** controls on that result face, so the roll mode can change between rolls without reopening settings. **Change** returns to the configuration face.

### Independent copies

Player and DM tables store card instances rather than a unique list of catalog IDs. A user can:

- add the same source card repeatedly;
- give each copy its own name;
- pin, reorder, and remove each copy independently;
- keep separate temporary configuration state while the page remains mounted;
- migrate an existing one-copy table into the instance schema.

Persisting every copy’s ruleset, modifiers, spell level, selected mode, and Advantage state across browser refreshes remains future work.

### Monster Encounter

The encounter workspace currently provides fully formatted cards for:

- Goblin;
- Adult Black Dragon;
- Lich;
- saved original homebrew monsters.

Simple monsters use poker-size cards. Complex monsters open as a numbered six-card sequence with equal 5:7 dimensions, Previous/Next navigation, and fixed printing at 2.5 × 3.5 inches per card.

The Compendium contains all generated SRD monster references, but converting every imported monster into a complete encounter-ready card or boss folio remains separate automation work.

## Reference-complete versus automation-complete

Dungeon Cards deliberately distinguishes two milestones:

- **Reference-complete:** every licensed record is searchable, edition-tagged, source-referenced, and readable.
- **Automation-complete:** the record also has structured controls that execute attacks, saves, damage, healing, scaling, tables, or encounter procedures.

The spell and monster Compendium is reference-complete. Weapons, core d20 cards, skills, saves, twenty-two spell families, and three imported monsters have deeper executable behavior. Product copy must not imply that every generated reference is already an automated roll card.

## Official SRD synchronization

Node.js 22.12 or newer and Poppler’s `pdftotext` are required to regenerate source catalogs.

```bash
npm ci
npm run sync:srd
npm run verify:srd
```

The synchronization pipeline:

1. downloads the official versioned PDFs;
2. extracts configured spell and monster page ranges;
3. normalizes PDF typography and wrapped text;
4. parses edition-specific records;
5. applies three narrowly documented source-text corrections;
6. validates counts, fields, quality, attribution, and edition differences;
7. writes deterministic JSON into `src/generated`.

The current official inputs are SRD 5.1 and SRD 5.2.1 under Creative Commons Attribution 4.0 International.

## Call of Cthulhu prototype

The Call of Cthulhu side includes a plain-language Rules Guide and playable procedure cards for percentile checks, Bonus/Penalty dice, opposed rolls, Sanity, wounds, close combat, and firearms.

The public repository uses original demonstration creatures, weapons, spells, and rituals. It does not copy official Chaosium catalogs, stat blocks, spell text, weapon tables, scenarios, artwork, or protected prose. A separate software license would be required for those materials.

## Local development

```bash
npm ci
npm run dev
```

## Verification

```bash
npm test
npm run build
npm run check
```

GitHub Actions runs:

- locked dependency installation;
- high-severity dependency audit;
- unit, storage, parser, and catalog tests;
- strict TypeScript compilation;
- Vite production build;
- official-PDF generation and quality validation on the catalog branch.

## Current limitations

- no production login or cloud synchronization;
- one local Player, DM, and Monster workspace per role;
- per-instance card settings do not yet survive refresh;
- only three imported monsters currently have complete encounter-card formatting;
- only twenty-two spell families currently have executable spell procedures;
- conditions, equipment, magic items, feats, classes, species, backgrounds, traps, and hazards are not yet reference-complete;
- no deck import/export;
- roll history resets when its page unmounts or the browser reloads.

## Attribution

See [`ATTRIBUTION.md`](ATTRIBUTION.md) for the required SRD 5.1 and SRD 5.2.1 Creative Commons attribution statements.

## Architecture rule

Keep handwritten source files under 150 lines where practical. Split components, generated data, styling, persistence, validation, and rules logic before they become difficult to audit.
