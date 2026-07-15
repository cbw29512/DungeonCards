# Dungeon Cards Catalog Completeness

Last updated: 2026-07-15

## What complete means

Dungeon Cards tracks two separate levels of completeness:

1. **Reference-complete:** every licensed source record is searchable, edition-tagged, source-referenced, and readable in the Compendium.
2. **Automation-complete:** the record also has structured buttons, modifiers, scaling, attacks, saves, damage, healing, tables, or encounter controls that execute its procedure.

For D&D, the licensed canonical sources are:

- System Reference Document 5.1 under CC BY 4.0;
- System Reference Document 5.2.1 under CC BY 4.0.

Content outside those SRDs is not copied into the public application. Proprietary names, creatures, subclasses, settings, artwork, and book-only material require a separate license or original replacement content.

For the Call of Cthulhu prototype, complete means original/custom catalogs plus a clear source-backed procedure guide. Official Chaosium creature statistics, spell text, weapon tables, scenarios, artwork, and protected prose remain excluded until an appropriate software license exists.

## Current D&D coverage

### Reference-complete source families

- [x] SRD 5.1 spells: 319 searchable references.
- [x] SRD 5.2.1 spells: 339 searchable references.
- [x] SRD 5.1 monsters: 314 searchable references.
- [x] SRD 5.2.1 monsters: 328 searchable references.
- [x] Official PDF source URLs and SHA-256 digests stored in the generated manifest.
- [x] Exact edition filters and source-page references.
- [x] Search and pagination in the D&D Compendium.
- [x] SRD 5.1 weapon table: 37 weapons.
- [x] SRD 5.2.1 weapon table: 38 weapons.

### Automation-complete source families

- [x] Separate weapon Attack, Damage, and eligible Quick Roll cards.
- [x] Six individual ability saving-throw cards.
- [x] Eighteen individual skill-check cards.
- [x] Generic Attack Roll, Saving Throw, and Ability Check cards.
- [ ] All imported spells converted into executable roll cards.
- [ ] All imported monsters converted into encounter-ready poker cards or ordered folios.

### Partially automated families

- [x] Twenty-two audited spell effect families.
- [x] Three encounter-ready 2014 monster samples: Goblin, Adult Black Dragon, and Lich.
- [x] Selected traps, magic items, and random tables.
- [x] Plain-language core rules guide.

### Remaining reference families

- [ ] Conditions and status references.
- [ ] Actions, Bonus Actions, Reactions, movement, cover, exploration, rests, concentration, death, and environmental procedures.
- [ ] Armor, adventuring gear, tools, mounts, vehicles, and services.
- [ ] Feats available in each SRD.
- [ ] Classes, SRD subclasses, species, backgrounds, and progression records.
- [ ] Complete magic-item records.
- [ ] Complete trap and hazard records.

## Official-source generation

The spell and monster Compendium is generated from the official versioned Wizards of the Coast PDFs—not a community transcription.

The generator:

- downloads each official PDF;
- records its SHA-256 digest;
- extracts only the configured spell and monster page ranges;
- normalizes PDF typography and wrapped columns;
- keeps SRD 5.1 and SRD 5.2.1 records separate;
- validates minimum counts, unique IDs, source references, required fields, edition-specific sentinels, readable components, complete 2024 class lists, and visible line-wrap artifacts;
- commits deterministic JSON for local development and GitHub Pages.

Three narrowly scoped source-PDF text defects are corrected by exact edition-and-record keys and covered by tests:

- 2014 Animal Friendship’s clipped higher-level sentence;
- Animal Friendship’s “spells ends” typo;
- 2014 Animal Messenger’s “3nd level” typo.

## Required record architecture

Every imported family must include:

- stable application ID;
- source edition, version, page, and license;
- searchable category metadata;
- complete readable source reference text;
- structured executable data where applicable;
- automated boundary and expected-count tests;
- explicit edition differences;
- no silent fallback from one edition into another.

## Ordered delivery plan

1. Convert generated spell records into structured attack, save, damage, healing, concentration, duration, component, and scaling data.
2. Convert generated monster records into complete encounter-ready cards and ordered folios.
3. Import conditions, core procedures, equipment, and magic items.
4. Import feats, classes, species, backgrounds, traps, and hazards.
5. Persist every individual card copy’s ruleset, mode, modifiers, scaling, and roll mode.
6. Complete browser, accessibility, print, and rules-accuracy acceptance.

## Call of Cthulhu boundary

The public repository may contain:

- original weapon, creature, spell, and ritual records;
- custom/homebrew builders;
- concise original descriptions of reviewed procedures;
- source links and verification metadata;
- independent percentile, Sanity, combat, wound, and firearm engines.

It may not contain copied official catalogs or protected text without a separate Chaosium software license. The user-facing Rules Guide explains procedures before the Sources area exposes verification details.
