# DM Forge — Card-Centered Tabletop Operating Library

DM Forge, developed in the `DungeonCards` repository, is a card-centered tabletop operating workspace for:

- Dungeons & Dragons 2014 / SRD 5.1;
- Dungeons & Dragons 2024 / SRD 5.2.1;
- Call of Cthulhu 7th Edition.

The goal is to reduce rulebook interruption during play. Verified libraries, characters, creatures, encounters, equipment, clues, and campaign tools feed concise, source-traceable, printable, executable cards and linked card sequences.

Characters, compendiums, maps, and campaign tools are connected subsystems. **Cards, decks, and table-ready workspaces remain the product center.**

See master epic [#67](https://github.com/cbw29512/DungeonCards/issues/67) for the controlling roadmap.

## Product standards

- **Card first:** frequently used rules and game entities should become executable cards when card form improves play.
- **Fast under pressure:** cards prioritize decisive numbers, procedures, actions, and tracked state over decorative prose.
- **Rules transparent:** verified summaries link to source, edition, review status, and licensing boundary.
- **System separated:** D&D 2014, D&D 2024, and Call of Cthulhu procedures and persistence never silently mix.
- **State first:** source data, card definitions, runtime instances, saved state, and presentation remain separate.
- **Local first:** public browsing, card use, homebrew, and printing work without login.
- **Optional private accounts:** signed-in players can save supported Character Vault copies across devices through owner-only database policies.
- **Accessible:** keyboard, screen-reader, focus, reduced-motion, responsive, and touch behavior are release gates.
- **Print ready:** cards, sheets, folios, and encounter references remove controls and avoid clipped content.
- **No fake completion:** structured validation and CI—not display text—determine release status.

## Current card platform

- Rule and guided-procedure cards
- Executable dice and action cards
- Player and DM personal decks
- Monster quick-combat cards and expandable folios
- Spell and monster reference cards
- Call of Cthulhu Sanity, Luck, weapon, firearm, injury, healing, and procedure cards
- Local homebrew card and monster builders
- Favorites, roll history, independent card instances, and print layouts

The shared card domain is being upgraded under #67 to add exact game-system identity, edition-safe persistence, broader card types, visibility boundaries, versioning, and reusable runtime instances.

## Dungeons & Dragons workspaces

- Rules guide and executable roll cards
- Edition-separated conditions and Exhaustion
- Movement, jumping, cover, Grapple, Shove, Hide, Search, and Opportunity Attack tools
- HP, Temporary HP, Death Saves, stabilization, and concentration tracking
- Initiative, turns, movement, reactions, surprise, conditions, and timed effects
- Weapon Mastery, armor, carrying capacity, tools, mounts, containers, vehicles, and equipment procedures
- SRD 5.1 and SRD 5.2.1 spell and monster compendium
- Structured monster quick-combat cards with complete source folios
- Player and DM card workspaces
- Homebrew card and monster builders
- Character Vault with optimized builds, print packets, optional accounts, and private saves

### Current Character Vault baseline

Vault Ready ladders currently include both editions at levels 1–20 for:

- Fighter / Champion
- Barbarian / Berserker
- Cleric / Life Domain

Each Vault Ready build includes legal advancement, tactics, class-specific magic items, attunement validation, a tabbed digital sheet, and complete print output. Saved Character Play Mode remains an active milestone and is not considered complete until protected by a reviewed remote branch and green CI.

## Call of Cthulhu 7th Edition workspaces

- Top-level system gateway and isolated Cthulhu experience
- Percentile, difficulty, opposed, Bonus/Penalty, Pushed, and Luck procedures
- Sanity loss, temporary insanity, bouts of madness, and reality checks
- DEX order, close combat, Fighting Maneuvers, outnumbering, firearms, and wounds
- First Aid, Medicine, dying, natural healing, and Major Wound recovery
- Magic Points, casting procedures, and skill improvement
- Investigator builder and Keeper investigation tools
- Original demonstration dossiers and source/licensing audits

The controlling Call of Cthulhu epic is [#7](https://github.com/cbw29512/DungeonCards/issues/7). The target is a complete card-first Investigator and Keeper library with weapons, creatures/NPCs, spells/rituals, encounters, clues, handouts, case preparation, builders, and print decks without reproducing protected scenarios, artwork, or proprietary text.

## Source catalogs

| Ruleset | Spells | Monsters |
|---|---:|---:|
| SRD 5.1 — 2014 | 319 | 314 |
| SRD 5.2.1 — 2024 | 339 | 328 |
| **Combined** | **658** | **642** |

Generated records retain official PDF URLs, SHA-256 digests, source versions, source pages, and required CC BY 4.0 attribution. Validation checks required fields, edition separation, duplicate IDs, extraction artifacts, and deterministic output.

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

GitHub Actions blocks on high-severity dependency advisories, unit regressions, TypeScript errors, source-export failures, and production-build failures. A focused security workflow additionally scans tracked files and Git history for credential patterns without printing secret values.

## Official SRD synchronization

Poppler's `pdftotext` is required only when regenerating official source catalogs.

```bash
npm run sync:srd
npm run verify:srd
```

The synchronization pipeline downloads configured official PDFs, extracts page ranges, normalizes typography, parses edition-specific records, validates attribution and data quality, and writes deterministic JSON into `src/generated`.

## Storage and publishing boundaries

- Anonymous browsing, card use, homebrew, and printing remain available.
- Local browser storage remains the default for personal cards, homebrew, and temporary workspaces.
- Optional Supabase accounts support private Character Vault saves when configured.
- Row Level Security restricts saved-character rows to their owner.
- Browser builds may use only Supabase publishable or legacy anon keys; secret and service-role keys are server-only.
- Official paid Call of Cthulhu catalogs, scenarios, artwork, logos, and proprietary text are excluded.
- Paid D&D subclasses, feats, spells, and other non-SRD content require private user-owned import or separate licensing.
- The current GitHub Pages route remains `/DungeonCards/` for compatibility while the visible product brand is DM Forge.

## Architecture rules

- Every persisted card, deck, workspace, encounter, builder draft, and campaign asset must carry or inherit exact game-system identity.
- Reusable library definitions and independently tracked runtime instances remain separate.
- Generated catalogs remain separate from handwritten rules logic and UI.
- Keep handwritten source files under 150 lines where practical; split state, validation, persistence, presentation, and styles before they become difficult to audit.
- Every PR must identify the product track, system/edition, source boundary, runtime state, print behavior, tests, and effect on the shared card platform.

## Attribution

See [`ATTRIBUTION.md`](ATTRIBUTION.md) for required SRD 5.1 and SRD 5.2.1 Creative Commons attribution statements.
