# No-Duplicate Content Policy

Status: enforced by automated tests  
Applies to: D&D and percentile-horror application shells, routed pages, public catalogs, and private imports

## User-facing rule

A page must not present the same destination, full record, procedure card, or exact-equivalent catalog card more than once.

This does not prohibit a compact index from selecting one detailed record. The index and selected detail serve different functions. It also does not collapse cards merely because their titles look alike when their rules, rolls, resources, levels, links, or sources differ.

## Navigation

- Each system has one canonical top navigation bar.
- Home pages do not repeat every destination as a second grid of buttons.
- Card Catalog source summaries display counts only; they do not duplicate workspace navigation.
- Navigation registries must contain unique page IDs and unique visible labels.

## Routed page composition

- A route wrapper must not repeat a procedure already owned by its library component.
- The Investigator page exposes one percentile roller.
- Full occupation-package details appear once in the occupation directory, not again inside the selected Investigator dossier.
- Equipment and ritual procedure cards are rendered by their owning libraries and not repeated by the route wrapper.

## Catalog identity

Every accepted card must have a unique storage ID and a clear visible identity.

Two definitions collapse into one reusable card only when their complete semantic payload is equivalent, including:

- game system and card family;
- visibility;
- normalized title, subtitle, summary, detail, and semantic tags;
- source and public-distribution boundary;
- executable actions and formulas;
- resources, initial values, maximums, and refresh rules;
- linked cards;
- print definition.

Character/build context tags do not make two otherwise identical equipment or reference cards different. This prevents repeated loadout cards such as the same unchanged tool from flooding the catalog.

Cards with the same visible title and subtitle remain separate when any mechanic or source payload differs. The catalog adds a readable character/level, source, or numbered variant label so users can tell those cards apart without exposing internal IDs.

Normalization handles Unicode compatibility, curly apostrophes, case differences, and repeated whitespace.

## Data libraries

Every public library separately gates unique IDs and names. Current protected libraries include:

- D&D exact-edition catalogs;
- percentile-horror creatures;
- percentile-horror weapons;
- percentile-horror rituals;
- percentile-horror occupations;
- percentile-horror premade Investigators.

## Enforcement

Automated tests verify:

- unique navigation destinations and labels;
- removal of duplicate home-page destination grids;
- count-only Card Catalog source summaries;
- single-instance procedure composition;
- unique IDs and final visible identities in every exact-system Card Catalog;
- exact-equivalent reusable-card collapse;
- preservation of level-scaled actions and resources;
- readable disambiguation of mechanically distinct cards;
- rejection of immutable ID conflicts;
- preservation of context-distinct cards that share a generic title.

Later private imports may replace earlier private records with the same identity. They cannot override immutable public content, and an exact private copy of immutable public content is excluded with a clear source-health message.