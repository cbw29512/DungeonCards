# DM Forge Card Size Standard

Status: required design-system contract  
Master epic: #67  
Reviewed: 2026-07-27

## Core size

Every element presented to users as a **card** uses one physical footprint:

- screen width: `250px`;
- screen height: `350px`;
- aspect ratio: `5 / 7`;
- print width: `2.5in`;
- print height: `3.5in`;
- default screen radius: `0.9rem`.

The dimensions are defined once as shared CSS custom properties. Individual card families may change color, border, typography, art, and internal layout, but may not redefine width, height, or aspect ratio.

## Card versus folio or panel

A component too large for the standard card must not stretch the card.

Use one of these patterns instead:

1. split the information into linked cards;
2. use a front/back card;
3. use a card stack or guided sequence;
4. open an expandable folio;
5. use a clearly named workspace panel or tracker that is not presented as a card.

Interactive controls may scroll inside the fixed digital card when necessary, but the preferred solution is a short card face linked to a focused procedure panel or sequence.

## Grid behavior

- card grids use the shared card width as their column size;
- grids center incomplete rows;
- cards do not stretch to fill leftover horizontal space;
- narrow screens retain the same aspect ratio and may scale down only when the viewport is narrower than the standard card plus page padding;
- neighboring cards in a row align to the same top and bottom edges.

## Print behavior

- standard cards print at exactly `2.5in × 3.5in`;
- letter paper may place three cards across in a `7.5in` content area;
- folio pages may combine standard card panels but each panel retains the card footprint;
- print output must not silently scale one card family differently from another;
- clipping is a release failure and must be solved by layout/content changes, not by changing card dimensions.

## Enforcement

CI must verify:

- the shared tokens retain the approved values;
- Rule, Dice, Monster, portrait, homebrew, D&D, and Call of Cthulhu card shells consume the shared tokens;
- competing hard-coded core card dimensions are rejected;
- standard print selectors consume the shared print tokens;
- intentional folios and workspace panels use names that do not imply the standard card footprint.

Any requested size change is a product-wide design-system migration, not a one-off component edit.
