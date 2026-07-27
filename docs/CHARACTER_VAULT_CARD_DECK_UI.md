# Character Vault Generated Card Deck UI

Character Vault sheets expose generated Card Platform definitions through a first-class `Cards` tab.

The sheet remains one subsystem inside the larger card-centered DM Forge product. The new tab does not replace the existing Actions, Spells, Features, Inventory, Notes, Build Guide, Saved Play Mode, or print packet.

## Data source

The workspace resolves the deterministic card bundle using the immutable Vault build ID.

It does not copy or edit the source character profile. Changing saved HP, resources, slots, notes, charges, or attunement in Play Mode does not mutate library card definitions.

## Card categories

Generated cards are classified into:

- attacks;
- resources;
- spells;
- features;
- items.

The workspace displays total and category counts and supports free-text search across title, subtitle, summary, family, tags, actions, and source title.

## Universal renderer

`CardPlatformDefinitionCard` renders all generated definitions in the shared standard shell.

The front shows:

- family;
- title and subtitle;
- summary;
- key tags.

The back shows:

- exact game system and edition;
- review status;
- action labels and formulas/procedure counts;
- tracked resources;
- source title.

Clicking or activating the card flips it without changing its dimensions.

## Archive download

`Download card deck` creates a validated `dm-forge-card-platform` JSON archive containing:

- all definitions generated for the selected immutable build;
- one character deck definition;
- no fabricated runtime instances;
- no deck runtime state.

D&D 2014 and D&D 2024 downloads remain isolated. The filename contains the exact system and stable build ID.

## Accessibility

- Cards is part of the existing ARIA tablist.
- Arrow Left and Arrow Right move through tabs.
- Home and End move to the first and last tab.
- Card flip state uses `aria-pressed` and explicit labels.
- Search results and download status use a polite live region.
- Reduced-motion preferences disable flip animation.

## Card dimensions

The renderer contains no local width or height values. It is included in the universal card-size contract:

- 250 × 350 pixels on screen;
- 2.5 × 3.5 inches in print;
- 5:7 aspect ratio.

Search, filters, counts, export, and status are workspace controls outside the card.

## Printing

The Character Vault print packet includes generated cards on their own panel pages. The card grid uses the shared physical print width and height. Screen flip state is ignored during print so card fronts remain stable and repeatable.
