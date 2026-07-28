# Unified Exact-System Card Catalog

The Card Catalog is DM Forge's primary searchable card index. It combines compatible built-in and private Card Platform definitions while preserving every specialized rules, encounter, character, builder, and private-library workspace.

## Exact-system boundary

A catalog contains exactly one of:

- `dnd-2014`;
- `dnd-2024`;
- `coc-7e`.

The D&D route requires an explicit edition selection. The percentile-horror route is permanently scoped to `coc-7e`. Definitions whose `gameSystemId` does not match the active catalog are rejected and reported as source-health warnings.

## D&D source groups

Each D&D catalog assembles:

- built-in exact-edition rule cards;
- edition-separated condition cards projected from the existing Conditions & Exhaustion records;
- generated SRD spell cards;
- generated SRD monster cards;
- Character Vault action, feature, spell, resource, equipment, and magic-item cards;
- exact-edition homebrew dice cards;
- homebrew monsters projected into the selected edition;
- definitions from the selected exact-system private library.

Condition cards retain their canonical ordered effects as one executable procedure. Adding the same condition repeatedly creates independent runtime copies through the normal playable-deck library; it does not mutate the immutable condition record.

The catalog does not copy or replace the source databases. It builds deterministic Card Platform projections from their current immutable records.

## Percentile-horror source groups

The public `coc-7e` catalog assembles exactly:

- nine verified free-rule quick-reference procedure cards;
- 24 original public-safe weapon cards;
- 24 original public-safe ritual cards;
- 24 original public-safe creature and NPC dossier cards;
- 12 original public-safe premade Investigator cards.

That is **93 public definitions** before any private import. The separate occupation directory contains 24 original occupation packages used by the Investigator builder; occupations are not currently projected as standalone Card Platform definitions.

Verified procedures retain source records and review dates. Original records retain public-safe source metadata and do not reproduce official paid catalogs, scenarios, protected statistics, artwork, or substantial rulebook prose.

Definitions from the exact-system `coc-7e` private library may be added locally without publishing their contents.

## Validation and source health

Every definition passes `validateCardDefinition` before admission. One malformed record cannot stop another source or the entire catalog.

The source-health panel reports:

- adapter exceptions;
- invalid definitions;
- wrong-system definitions;
- stable-ID conflicts;
- corrupt private-library storage.

Warnings are visible to the user, while valid definitions remain searchable.

## Stable-ID and equivalence handling

Built-in definitions are immutable inside the catalog. A private import with the same ID cannot replace built-in content.

When multiple private sources provide the same private ID, the later private definition may replace the earlier private definition. No cross-system replacement is possible.

Cards are not discarded merely because their family, title, and subtitle look alike. Mechanically different actions, formulas, resources, links, source records, and level-scaled payloads remain separate. Only fully canonical-equivalent reusable definitions may coalesce.

## Search and filters

Search indexes:

- title, subtitle, summary, and detail;
- tags;
- action labels, procedures, and roll formulas;
- source title, section, edition, and license;
- system, family, visibility, and review status;
- source-group label.

Filters cover source group, family, visibility, and review status. Sorting supports title, family, source, and review state.

## Performance boundary

The full exact-system catalog may be indexed in memory, but the DOM renders no more than 36 card definitions at once. Search or filter changes return to page one. Pagination never changes card data.

This boundary keeps large D&D catalogs usable without pretending that thousands of cards can be mounted safely in one browser view.

## Rendering and printing

All definitions use `CardPlatformDefinitionCard` and the universal standard:

- 250 × 350 pixels on screen;
- 2.5 × 3.5 inches in print;
- 5:7 aspect ratio.

Search, filters, source counts, source-health warnings, origin labels, private-import badges, and pagination remain outside the card shell.

Print mode prints only the currently filtered page. Temporary flip state does not create another card size.

## Relationship to other workspaces

The Card Catalog complements the corresponding specialized workspaces:

- D&D Rules, Conditions & Exhaustion, Compendium, Monster Encounter, Character Vault, Homebrew, and Private Library;
- percentile-horror Rules, Equipment, Spells & Rituals, Creatures & NPCs, Investigators, and Private Library.

Source summaries are count-only to avoid duplicating the primary navigation. The Card Catalog is an index and operating surface, not a replacement for the deeper tools.

## Publishing boundary

Only SRD, verified free-rule summaries, original content, licensed material, and private user-owned imports may enter their appropriate catalog sources. The catalog does not introduce a paid-book or proprietary public content pipeline.