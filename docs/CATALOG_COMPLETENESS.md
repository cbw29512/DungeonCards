# Dungeon Cards Catalog Completeness

Last updated: 2026-07-28

## What complete means

Dungeon Cards tracks two separate levels of completeness:

1. **Reference-complete:** every licensed source record is searchable, edition-tagged, source-referenced, and readable in the Compendium.
2. **Automation-complete:** the record also has structured buttons, modifiers, scaling, attacks, saves, damage, healing, tables, or encounter controls that execute its procedure.

For D&D, the licensed canonical sources are:

- System Reference Document 5.1 under CC BY 4.0;
- System Reference Document 5.2.1 under CC BY 4.0.

Content outside those SRDs is not copied into the public application. Proprietary names, creatures, subclasses, settings, artwork, and book-only material require a separate license, private user-owned entry, or original replacement content.

For percentile horror, public completeness means original/custom catalogs plus clear source-audited procedures. Official Chaosium creature statistics, spell text, weapon tables, scenarios, artwork, and protected prose remain excluded unless an appropriate software license exists.

## Current D&D coverage

### Reference-complete source families

- [x] SRD 5.1 spells: exactly 319 searchable references.
- [x] SRD 5.2.1 spells: exactly 339 searchable references.
- [x] SRD 5.1 monsters: exactly 314 searchable references.
- [x] SRD 5.2.1 monsters: exactly 328 searchable references.
- [x] Official PDF source URLs and SHA-256 digests stored in the generated manifest.
- [x] Exact edition filters and source-page references.
- [x] Search and pagination in the D&D Compendium.
- [x] Complete licensed raw monster source record inside every Compendium stat-block expander.
- [x] SRD 5.1 weapon table: 37 weapons.
- [x] SRD 5.2.1 weapon table: 38 weapons.

### Automation-complete source families

- [x] Separate weapon Attack, Damage, and eligible Quick Roll cards.
- [x] Six individual ability saving-throw cards.
- [x] Eighteen individual skill-check cards.
- [x] Generic Attack Roll, Saving Throw, and Ability Check cards.
- [ ] All imported spells converted into fully structured executable roll cards.
- [ ] All imported monster attacks, saves, damage, recharge rolls, areas, and multiattacks converted into executable controls.

### Partially automated families

- [x] Twenty-two audited spell effect families.
- [x] All 642 edition-specific generated monster records expose a quick combat face, complete licensed source folio, and independent encounter-instance state.
- [x] Three formatted 2014 monster samples—Goblin, Adult Black Dragon, and Lich—retain richer hand-structured action data.
- [x] Selected traps, magic items, and random tables.
- [x] Plain-language core rules guide.

### Remaining reference families

- [ ] Complete equipment beyond weapons: armor, adventuring gear, tools, mounts, vehicles, and services.
- [ ] Complete public feats available in each SRD.
- [ ] Complete class, SRD subclass, species, background, and progression reference records.
- [ ] Complete magic-item records.
- [ ] Complete trap and hazard records.

Conditions, common actions, movement, cover, concentration, health, death, initiative, and other major table procedures already have dedicated exact-edition libraries or tools. They remain subject to ongoing source and automation audits rather than being described as absent.

## Official-source generation

The spell and monster Compendium is generated from the official versioned Wizards of the Coast PDFs—not a community transcription.

The generator:

- downloads each official PDF;
- records its SHA-256 digest;
- extracts only the configured spell and monster page ranges;
- normalizes PDF typography and wrapped columns;
- keeps SRD 5.1 and SRD 5.2.1 records separate;
- requires the reviewed exact counts of 319/314 and 339/328 rather than permissive minimums;
- validates unique IDs and names, source references, positive source pages, complete raw monster text, required fields, edition-specific sentinels, readable components, complete 2024 class lists, and visible line-wrap artifacts;
- verifies manifest counts against the extracted catalogs;
- commits deterministic JSON for local development and GitHub Pages.

A count change is treated as a parser or source-review event. It cannot silently pass merely because more than 250 monsters remain.

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
- automated boundary and exact expected-count tests;
- explicit edition differences;
- no silent fallback from one edition into another.

## Ordered delivery plan

1. Convert generated spell records into structured attack, save, damage, healing, concentration, duration, component, and scaling data.
2. Convert generated monster records into executable attacks, saves, damage, recharge, multiattack, and area-effect controls.
3. Complete remaining equipment, magic-item, feat, class, species, background, trap, and hazard records.
4. Persist every individual card copy’s ruleset, mode, modifiers, scaling, and roll mode.
5. Continue rendered-route, accessibility, print, performance, source, and rules-accuracy acceptance.

## Percentile-horror boundary

The public repository currently contains original/public-safe libraries for:

- creatures and NPCs;
- weapons;
- rituals and unnatural effects;
- occupations;
- premade Investigators;
- custom/private builders;
- concise source-audited procedures;
- independent percentile, Sanity, combat, wound, and firearm engines.

It may not contain copied official catalogs or protected text without a separate Chaosium software license. User-owned official records belong in the private library.