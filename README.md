# DM Forge — Rules Compendium & Roll Cards

DM Forge is a local-first, account-free tabletop operating workspace for Dungeons & Dragons and Call of Cthulhu. It is designed for fast table use: authoritative references remain available, while the primary interface surfaces the numbers, procedures, and state a GM needs during play.

## Product standards

- **Fast under pressure:** combat and procedure cards prioritize decisive information over decorative prose.
- **Rules-transparent:** verified summaries link to their source record, edition, and licensing boundary.
- **System-separated:** D&D 2014, D&D 2024, and Call of Cthulhu 7th Edition procedures do not silently mix.
- **Accessible:** keyboard navigation, skip links, visible focus, reduced-motion behavior, responsive menus, and minimum touch targets are part of the release gate.
- **Local-first:** personal cards and encounter selections remain in the browser without requiring an account.
- **Print-ready:** operational cards and folios avoid navigation chrome and unnecessary effects when printed.

## Current workspaces

### Dungeons & Dragons

- Rules guide and executable roll cards
- SRD 5.1 and SRD 5.2.1 spell and monster references
- Player and DM personal tables
- Structured monster quick-combat cards with complete sourced folios
- Homebrew card and monster builders with live previews
- DM Forge Encounter handoff

### Call of Cthulhu 7th Edition

- Percentile, difficulty, opposed-roll, and pushed-roll procedures
- Sanity loss, temporary insanity, bouts of madness, and reality checks
- DEX order, close combat, Fighting Maneuvers, outnumbering, firearms, and wounds
- First Aid, Medicine, dying, natural healing, and Major Wound recovery
- Magic Points, first-time spell casting, pushed casting, and casting timing
- Skill-improvement procedure
- Keeper investigation flow, case preparation, and original demonstration dossiers

Official paid scenarios, proprietary creature statistics, spell descriptions, artwork, and logos are not reproduced. Cthulhu examples are original demonstration content unless a separate authorized source is identified.

## Source catalogs

| Ruleset | Spells | Monsters |
|---|---:|---:|
| SRD 5.1 — 2014 | 319 | 314 |
| SRD 5.2.1 — 2024 | 339 | 328 |
| **Combined** | **658** | **642** |

The generator records official PDF URLs, SHA-256 digests, source versions, source pages, and CC BY 4.0 attribution. Generated records are validated for required fields, edition separation, duplicate IDs, line-wrap artifacts, and deterministic output.

## Encounter cards

Every generated SRD monster receives a structured quick-combat face that attempts to surface:

- armor class, hit points, speed, initiative, and ability scores;
- saving throws, skills, senses, vulnerabilities, resistances, and immunities;
- prioritized attacks, Multiattack, save DCs, recharge actions, reactions, bonus actions, and legendary actions.

The complete source-authoritative folio remains available behind the quick-reference face. The parser fails safely when an unusual or older stat block omits an expected section.

## Local development

Node.js 22.12 or newer is required.

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

The production build regenerates and validates the DM Forge monster and cleric-spell exports. GitHub Actions blocks on:

- high-severity dependency advisories;
- unit, storage, parser, catalog, and release-shell regressions;
- TypeScript compilation errors;
- SRD export failures;
- production bundle failures.

The professional release shell additionally protects responsive navigation, keyboard skip links, active-page context, focus restoration, reduced-motion behavior, print cleanup, and readable quick-combat card dimensions.

## Official SRD synchronization

Poppler's `pdftotext` is required only when regenerating official source catalogs.

```bash
npm run sync:srd
npm run verify:srd
```

The synchronization pipeline downloads the configured official PDFs, extracts page ranges, normalizes PDF typography, parses edition-specific records, validates data quality and attribution, and writes deterministic JSON into `src/generated`.

## Storage and current boundaries

- No production login or cloud synchronization
- Local browser storage for personal workspaces and homebrew records
- Per-instance temporary card configuration may reset when a page unmounts or the browser reloads
- Official paid Call of Cthulhu catalogs and proprietary text are excluded
- The current GitHub Pages route remains `/DungeonCards/` for compatibility while the visible product brand is DM Forge

## Attribution

See [`ATTRIBUTION.md`](ATTRIBUTION.md) for required SRD 5.1 and SRD 5.2.1 Creative Commons attribution statements.

## Architecture rule

Keep handwritten source files under 150 lines where practical. Split components, generated data, styling, persistence, validation, and rules logic before they become difficult to audit.
