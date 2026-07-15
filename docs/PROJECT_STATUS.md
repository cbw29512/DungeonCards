# Dungeon Cards Project Status

Last updated: 2026-07-15

This file is the current implementation source of truth. Detailed coverage is tracked in [`CATALOG_COMPLETENESS.md`](./CATALOG_COMPLETENESS.md).

## Product goal

Build a polished tabletop card application that:

- runs accurate D&D SRD 5.1 and SRD 5.2.1 procedures;
- keeps editions explicitly separated;
- provides complete licensed reference catalogs and progressively automated cards;
- gives Player, DM, and Monster workspaces independent saved state;
- supports multiple individually named copies of the same card;
- turns configured cards into fast click-to-roll table tools;
- explains D&D and Call of Cthulhu procedures in plain language;
- supports original homebrew cards and monsters;
- prints readable poker-size monster cards and ordered boss folios.

## Main branch state

Merged into `main`:

- automatic GitHub Pages deployment;
- Player and DM card engines;
- independent duplicate card instances with rename, pin, movement, and migration;
- result-side Normal, Advantage, and Disadvantage controls;
- click-the-result-card-to-reroll interaction;
- complete SRD 5.1 and SRD 5.2.1 weapon tables;
- eighteen individual skill cards and six individual saving-throw cards;
- twenty-two automated spell families;
- Monster Card Forge integration and ordered equal-size folios;
- Call of Cthulhu playable preview, plain-language Rules Guide, and source-audit workspace;
- plain-language D&D Rules Guide.

## Current branch

Branch: `agent/full-srd-catalog-foundation`

Pull request: #15

Delivered on this branch:

- a searchable D&D Compendium page;
- separate Spells and Monsters views;
- SRD 5.1, SRD 5.2.1, or combined filters;
- text search and 48-record pagination;
- expandable complete spell and monster reference cards;
- official-PDF generation pipeline;
- source PDF URLs, SHA-256 digests, page references, and CC BY 4.0 attribution;
- deterministic generated JSON committed for local builds and GitHub Pages;
- parser tests, expected-count checks, edition-difference sentinels, required-field checks, class-list checks, component checks, and PDF line-wrap checks;
- narrowly documented corrections for three source-PDF text defects.

## Generated Compendium counts

### SRD 5.1 — 2014

- 319 spell references;
- 314 monster references;
- PDF SHA-256: `2504d2a0abb0a4d491a939be4f17910a2dde0312570ab8d208080225ccf0a1f0`.

### SRD 5.2.1 — 2024

- 339 spell references;
- 328 monster references;
- PDF SHA-256: `8974902d109d6e63672d7c490bde9ccf052410503d9cfa768237154fbc5e3d87`.

### Combined

- 658 spell references;
- 642 monster references;
- 1,300 generated spell and monster records.

## Reference-complete versus automation-complete

The Compendium is **reference-complete for SRD spells and monsters**. Every generated record is searchable, edition-tagged, source-referenced, and readable.

The Player, DM, and Encounter workspaces are not yet automation-complete for all 1,300 imported records:

- weapons, core d20 cards, skills, saves, and twenty-two spell families have executable roll behavior;
- Goblin, Adult Black Dragon, and Lich have encounter-ready card/folio behavior;
- the remaining generated records are complete references and must still be promoted into structured roll cards or encounter cards.

This distinction must remain visible in product copy and documentation.

## Call of Cthulhu boundary

The prototype may include original/custom creatures, weapons, spells, rituals, builders, and concise source-linked procedure summaries.

It may not include copied official Chaosium creature statistics, spell text, weapon tables, scenarios, artwork, logos, or protected prose without an appropriate software license. The Rules Guide explains playable procedures; Sources preserves verification details.

## Current acceptance checklist

### Compendium generation

- [x] Official SRD 5.1 and SRD 5.2.1 PDFs are canonical inputs.
- [x] PDF SHA-256 digests are recorded.
- [x] 319/339 spell counts pass validation.
- [x] 314/328 monster counts pass validation.
- [x] Unique IDs and edition separation pass.
- [x] Acid Splash and Goblin Minion edition sentinels pass.
- [x] Required spell and monster fields pass.
- [x] Wrapped material components and modern class lists pass.
- [x] Visible PDF line-wrap artifacts are rejected.
- [x] Documented source corrections pass unit and full-generation validation.

### Application quality

- [x] Locked dependency installation passes.
- [x] High-severity dependency audit passes.
- [x] Unit and catalog tests pass.
- [x] Strict TypeScript compilation passes.
- [x] Vite production build passes.
- [x] Official-PDF generation job passes.
- [ ] Manual desktop Compendium acceptance.
- [ ] Manual narrow-screen Compendium acceptance.
- [ ] Screen-reader and keyboard acceptance.

### Remaining catalog work

- [ ] Convert all generated spells into structured executable procedures.
- [ ] Convert all generated monsters into encounter-ready cards and ordered folios.
- [ ] Import conditions and core procedure references.
- [ ] Import equipment, magic items, feats, classes, species, backgrounds, traps, and hazards.
- [ ] Persist every individual card copy’s selected settings across refresh.

## Next ordered work

1. Merge PR #15 after final documentation CI passes.
2. Browser-test the Compendium search, filters, pagination, and expanded references.
3. Generate structured spell automation metadata from the complete reference catalog.
4. Generate complete encounter-card models from the monster catalog.
5. Import the remaining SRD source families.
6. Complete accessibility, print, and rules-accuracy acceptance.
