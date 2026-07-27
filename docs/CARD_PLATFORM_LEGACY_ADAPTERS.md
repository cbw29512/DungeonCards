# Card Platform v2 Legacy Adapters

DM Forge keeps current components and catalogs operational while projecting their data into the shared Card Platform v2 contracts.

The public registry is:

`src/utils/cardPlatformLegacyAdapters.ts`

## Existing adapters

- legacy Dice cards → `roll-action` cards;
- D&D rule cards → exact-edition rule or roll-action cards;
- encounter monsters → exact-edition creature cards;
- Call of Cthulhu weapons → weapon cards;
- Call of Cthulhu rituals → ritual cards;
- Call of Cthulhu creatures → creature cards;
- Call of Cthulhu quick references → verified procedure cards.

## Monster rules

SRD monster identity is inferred from the existing ruleset:

- `srd-5.1-2014` → `dnd-2014`;
- `srd-5.2.1-2024` → `dnd-2024`.

Homebrew monsters are edition-neutral in the legacy library. Their adapter therefore requires an explicit `homebrewGameSystemId`. A homebrew monster cannot silently enter either D&D edition.

SRD monsters retain an SRD source boundary and default to `game-master-only` visibility. Homebrew monsters default to private, user-owned source metadata.

The adapter projects:

- title, size, type, and challenge rating;
- armor, HP, and speed summary;
- HP as independently tracked runtime state;
- formatted actions, bonus actions, reactions, and legendary actions;
- usable damage formulas as executable rolls;
- unparsed reference sections as explicit procedures.

## Call of Cthulhu rules

Every CoC adapter emits `gameSystemId: "coc-7e"`.

The existing source ledger controls review metadata:

- verified source records become verified cards with review dates;
- needs-review records become rules-reviewed cards;
- original demonstrations and disputed records remain draft cards.

Weapon adapters create:

- percentile attack actions;
- damage actions;
- firearm procedure steps;
- ammunition as tracked runtime state.

Ritual adapters create:

- percentile casting actions;
- Sanity-cost rolls;
- explicit casting procedure steps.

Creature adapters create:

- percentile attack actions;
- damage rolls;
- Dodge and Sanity-loss actions;
- HP and Magic Points as independent tracked resources.

Quick-reference adapters require the card's `sourceId` to match the supplied source record. Mismatched source attribution is rejected.

## Compatibility boundary

Adapters do not replace current UI components, generated catalogs, builders, or print renderers. They provide deterministic Card Platform definitions for later:

- versioned import/export;
- shared libraries and search;
- deck creation;
- campaign and encounter runtime instances;
- Character Vault card generation.

## Card dimensions

Every adapted standard card uses the universal format:

- 250 × 350 pixels on screen;
- 2.5 × 3.5 inches in print;
- 5:7 aspect ratio.

Large monster and dossier interfaces may remain folios or workspace panels, but they cannot redefine the standard card footprint.
