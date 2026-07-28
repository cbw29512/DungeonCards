# DM Forge — Card-Centered Tabletop Operating Library

DM Forge, developed in the `DungeonCards` repository, is a card-centered tabletop operating workspace for:

- Dungeons & Dragons 2014 / SRD 5.1;
- Dungeons & Dragons 2024 / SRD 5.2.1;
- Call of Cthulhu 7th Edition-compatible percentile-horror play.

The goal is to reduce rulebook interruption during play. Verified libraries, characters, creatures, encounters, equipment, clues, and campaign tools feed concise, source-traceable, printable, executable cards and linked card sequences.

Characters, compendiums, maps, and campaign tools are connected subsystems. **Cards, decks, and table-ready workspaces remain the product center.**

See master epic [#67](https://github.com/cbw29512/DungeonCards/issues/67) for the controlling roadmap and completion audit [#97](https://github.com/cbw29512/DungeonCards/issues/97) for the current table-ready baseline.

## Product standards

- **Card first:** frequently used rules and game entities should become executable cards when card form improves play.
- **Fast under pressure:** cards prioritize decisive numbers, procedures, actions, and tracked state over decorative prose.
- **Rules transparent:** verified summaries link to source, edition, review status, and licensing boundary.
- **System separated:** D&D 2014, D&D 2024, and Call of Cthulhu procedures and persistence never silently mix.
- **State first:** source data, card definitions, runtime instances, saved state, and presentation remain separate.
- **Local first:** public browsing, card use, homebrew, private imports, encounters, and printing work without login.
- **Optional private accounts:** signed-in players can save supported Character Vault copies across devices through owner-only database policies.
- **Accessible:** keyboard, screen-reader, focus, reduced-motion, responsive, and touch behavior are release gates.
- **Print ready:** cards, sheets, folios, and encounter references remove controls and avoid clipped content.
- **No fake completion:** structured validation and CI—not display text—determine release status.

## Current Card Platform v2

- exact `dnd-2014`, `dnd-2024`, and `coc-7e` identities;
- rule, procedure, roll/action, spell, ritual, weapon, item, condition, creature, NPC, clue, handout, location, scene, table, generator, character-action, and investigator-action families;
- immutable library definitions and independent runtime copies;
- public, player-safe, GM/Keeper-only, and private visibility;
- personal, GM/Keeper, encounter, character/investigator, campaign, print, favorites, and other deck kinds;
- executable dice, d20, percentile, procedure, and linked-card actions;
- tracked resources, refresh actions, atomic persistence, and exact-system history;
- searchable exact-system Card Catalogs and playable deck workspaces;
- secure versioned import/export and local-first private libraries;
- one universal 250×350px screen / 2.5×3.5in print card standard.

## Dungeons & Dragons workspaces

- Rules guide and executable roll cards
- Edition-separated conditions and Exhaustion
- Movement, jumping, cover, Grapple, Shove, Hide, Search, and Opportunity Attack tools
- HP, Temporary HP, Death Saves, stabilization, and concentration tracking
- Initiative, turns, movement, reactions, surprise, conditions, timed effects, positions, reach, and range
- Versioned browser-local D&D 2014 and D&D 2024 encounter-session saves
- Independent monster instances with editable HP, initiative, conditions, reactions, recharge, and legendary-action state
- Weapon Mastery, armor, carrying capacity, tools, mounts, containers, vehicles, and equipment procedures
- SRD 5.1 and SRD 5.2.1 spell and monster compendium
- Structured monster quick-combat cards with complete source folios
- Player, DM, encounter, print, and custom playable decks
- Homebrew card and monster builders
- Character Vault with optimized builds, complete print packets, generated card decks, optional accounts, and Saved Play Mode

### Current Character Vault baseline

The public matrix defines 12 class/subclass paths in each edition at levels 1–20: **480 planned builds**.

Vault Ready ladders currently include both editions at levels 1–20 for:

- Fighter / Champion
- Barbarian / Berserker
- Bard / College of Lore
- Cleric / Life Domain
- Paladin / Devotion
- Ranger / Hunter
- Rogue / Thief
- Wizard / Evocation

That is **320 verified printable builds**. Each includes legal advancement, tactics, class-specific magic items, attunement validation, a tabbed digital sheet, generated Card Platform deck, owner-scoped Saved Play Mode, and complete black-and-white print output.

The remaining **160 builds** cover Druid/Land, Monk/Open Hand, Sorcerer/Draconic, and Warlock/Fiend. They remain visible only as blocked blueprints until the same release gate passes. See [#99](https://github.com/cbw29512/DungeonCards/issues/99).

### D&D completion boundary

Core combat resolution and browser-local encounter persistence are strong. The full-session program still includes exploration/survival, social procedures, rests/downtime, remaining adventuring gear, encounter budgets, hazards, objects, treasure, terrain/cover/area templates, complete executable monster actions, and persistent campaign/map/card linking. See [#100](https://github.com/cbw29512/DungeonCards/issues/100).

## Percentile-horror / Call of Cthulhu-compatible workspaces

- Top-level isolated `coc-7e` shell and exact-system persistence
- Percentile, difficulty, opposed, Bonus/Penalty, Pushed, and Luck procedures
- Sanity loss, temporary insanity, bouts, campaign effects, and reality checks
- DEX order, close combat, Fighting Maneuvers, outnumbering, firearms, wounds, and healing
- Magic Points, casting procedures, and skill improvement
- Searchable library of 24 original public-safe occupations
- Twelve complete original premade Investigators split between 1920s and modern play
- Versioned browser-local Investigator HP, Sanity, Magic Point, Luck, and Mythos state
- Twenty-four original public-safe weapons across melee, thrown, handgun, long-gun, and shotgun families
- Twenty-four original public-safe rituals across six ritual families and four risk tiers
- Twenty-four original public-safe creatures and NPCs across human, animal, unnatural, and catastrophic groups
- Keeper investigation procedures and run sheets
- Routed Equipment, Spells & Rituals, Creatures & NPCs, Encounters, Builders, Sources, Catalog, and Private Library areas
- Playable exact-system decks, action history, and private Card Platform archives

The current public `coc-7e` Card Catalog contains **93 definitions**: nine verified procedure cards, 24 original weapons, 24 original rituals, 24 original creatures/NPCs, and 12 original premade Investigators. The occupation directory contains 24 additional original packages used by the Investigator builder. These are substantial original libraries, not reproductions of Chaosium's official catalogs.

Remaining complete-session work includes a persistent Keeper case board and encounter workspace, clue/location/handout libraries, broader mundane field gear and vehicles, original case frameworks, and structured private builders for user-owned material. See [#101](https://github.com/cbw29512/DungeonCards/issues/101).

Official paid Call of Cthulhu catalogs, scenarios, artwork, logos, and substantial proprietary text remain excluded unless permission is obtained.

## Branching one-shot direction

The shared card schema already supports scenes, clues, handouts, locations, visibility, linked cards, runtime copies, and campaign decks. Issue [#102](https://github.com/cbw29512/DungeonCards/issues/102) adds the missing adventure state machine: persistent player decisions, requirements, consequences, hidden GM/Keeper information, branching scenes, encounters, clues, multiple endings, save/resume, and separated print packets.

First-party one-shots must be original or separately licensed. D&D adventures may reference public SRD assets with attribution. CoC-compatible adventures must use original cases, creatures, rituals, clues, locations, and handouts rather than copying official scenarios.

## Source catalogs

| Ruleset | Spells | Monsters |
|---|---:|---:|
| SRD 5.1 — 2014 | 319 | 314 |
| SRD 5.2.1 — 2024 | 339 | 328 |
| **Combined** | **658** | **642** |

Generated records retain official PDF URLs, SHA-256 digests, source versions, source pages, and required CC BY 4.0 attribution. Validation checks exact reviewed counts, required fields, edition separation, duplicate IDs, extraction artifacts, complete monster source text, and deterministic output.

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

GitHub Actions blocks on high-severity dependency advisories, unit regressions, TypeScript errors, source-export failures, and production-build failures. A focused security workflow additionally scans tracked files and Git history for credential patterns without printing secret values. Pushes to `main` run the same check before GitHub Pages deployment.

## Official SRD synchronization

Poppler's `pdftotext` is required only when regenerating official source catalogs.

```bash
npm run sync:srd
npm run verify:srd
```

The synchronization pipeline downloads configured official PDFs, extracts page ranges, normalizes typography, parses edition-specific records, validates attribution and data quality, and writes deterministic JSON into `src/generated`.

## Storage and publishing boundaries

- Anonymous browsing, card use, homebrew, private archive import, encounter state, and printing remain available.
- Local browser storage is the default for personal cards, decks, history, homebrew, imports, monster encounters, full D&D encounter sessions, and Investigator play state.
- Optional Supabase accounts support private Character Vault saves when configured.
- Row Level Security restricts saved-character rows to their owner.
- Browser builds may use only Supabase publishable or legacy anon keys; secret and service-role keys are server-only.
- Official paid Call of Cthulhu catalogs, scenarios, artwork, logos, and proprietary text are excluded.
- Paid D&D subclasses, feats, spells, and other non-SRD content require private user-owned import or separate licensing.
- The current GitHub Pages route remains `/DungeonCards/` for compatibility while the visible product brand is DM Forge.

## Architecture rules

- Every persisted card, deck, workspace, encounter, builder draft, adventure session, and campaign asset must carry or inherit exact game-system identity.
- Reusable library definitions and independently tracked runtime instances remain separate.
- Generated catalogs remain separate from handwritten rules logic and UI.
- Keep handwritten source files under 150 lines where practical; split state, validation, persistence, presentation, and styles before they become difficult to audit.
- Every PR must identify the product track, system/edition, source boundary, runtime state, print behavior, tests, and effect on the shared card platform.

## Attribution

See [`ATTRIBUTION.md`](ATTRIBUTION.md) for required SRD 5.1 and SRD 5.2.1 Creative Commons attribution statements.