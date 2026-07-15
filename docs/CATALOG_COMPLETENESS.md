# Dungeon Cards Catalog Completeness

Last updated: 2026-07-15

## Definition of complete

For D&D, complete means every reusable game record contained in both licensed source documents is represented, source-tagged, edition-separated, validated, searchable, and usable in the appropriate workspace:

- System Reference Document 5.1 under CC BY 4.0;
- System Reference Document 5.2.1 under CC BY 4.0.

Content outside those SRDs is not silently copied into the application. Proprietary names, creatures, subclasses, settings, artwork, and book-only material require a separate license or original replacement content.

For the Call of Cthulhu prototype, complete means a complete original/custom catalog and a clear source-backed procedure guide. Official Chaosium creature statistics, spell text, weapon tables, scenarios, artwork, and protected prose remain excluded until an appropriate software license exists.

## Current D&D coverage

### Complete source families

- [x] SRD 5.1 weapon table: 37 weapons.
- [x] SRD 5.2.1 weapon table: 38 weapons.
- [x] Separate weapon Attack, Damage, and eligible Quick Roll cards.
- [x] Six individual ability saving-throw cards.
- [x] Eighteen individual skill-check cards.
- [x] Generic Attack Roll, Saving Throw, and Ability Check cards.

### Partial source families

- [ ] Spells: 22 audited effect families currently implemented; full SRD 5.1 and 5.2.1 spell catalogs required.
- [ ] Monsters: three audited 2014 samples currently implemented; full SRD monster catalogs required.
- [ ] Magic items: selected generators and item procedures only.
- [ ] Traps and hazards: selected examples only.
- [ ] Core rule procedures: basic guide implemented; full searchable reference-card set required.

### Missing source families

- [ ] Conditions and status reference cards.
- [ ] Actions, Bonus Actions, Reactions, movement, cover, and environmental procedure cards.
- [ ] Complete armor, adventuring gear, tools, mounts, vehicles, and services records.
- [ ] Complete feats available in each SRD.
- [ ] Complete class, subclass, species, background, and progression reference records available in each SRD.
- [ ] Complete magic-item records available in each SRD.
- [ ] Complete monster actions, traits, spellcasting, legendary actions, and lair procedures available in each SRD.
- [ ] Complete spell metadata, scaling, attacks, saves, damage, healing, duration, concentration, and components available in each SRD.

## Required import architecture

Each source family must use a machine-readable manifest rather than a hand-maintained monolithic component.

Every record must include:

- stable application ID;
- source edition and exact source reference;
- source license;
- name and category;
- concise original summary;
- structured executable data where applicable;
- validation status;
- automated boundary tests;
- explicit edition differences;
- no fallback from one edition into another.

## Ordered delivery plan

1. Finish independent card instances and roll-side Advantage/Disadvantage.
2. Add the plain-language D&D and Call of Cthulhu rules guides.
3. Add source manifests and coverage tests that fail when expected catalog records are absent.
4. Import all SRD 5.1 spells and monsters.
5. Import all SRD 5.2.1 spells and monsters without blending changed records.
6. Import conditions, core procedures, equipment, magic items, feats, classes, species, and backgrounds.
7. Add catalog counts and edition filters to the interface.
8. Complete browser, accessibility, print, and rules-accuracy acceptance.

## Call of Cthulhu boundary

The current public repository may contain:

- original weapon, creature, spell, and ritual records;
- custom/homebrew builders;
- concise original descriptions of reviewed game procedures;
- source links and verification metadata;
- independent percentile, Sanity, combat, wound, and firearm engines.

It may not contain copied official catalogs or protected text without a separate Chaosium software license. The source audit remains available, but the user-facing Rules Guide must explain procedures before exposing verification details.
