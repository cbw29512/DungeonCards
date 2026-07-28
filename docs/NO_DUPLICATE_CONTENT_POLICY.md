# No-Duplicate Content Policy

Status: enforced by automated tests  
Applies to: D&D and percentile-horror application shells, routed pages, public catalogs, and private imports

## User-facing rule

A page must not present the same destination, full record, procedure card, or visibly identical catalog card more than once.

This does not prohibit a compact index from selecting one detailed record. The index and selected detail serve different functions. It also does not collapse cards that share a generic title when their visible subtitles identify different characters, editions, or contexts.

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

Every accepted card must have:

1. a unique storage ID; and
2. a unique visible identity inside its family.

Visible identity is normalized as:

- card family;
- title;
- subtitle.

Normalization handles Unicode compatibility, curly apostrophes, case differences, and repeated whitespace. Therefore visually identical cards cannot appear twice merely because their IDs or punctuation differ.

Cards with the same generic title remain separate when their subtitles visibly distinguish their context, such as two character-specific records.

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
- unique IDs in every exact-system Card Catalog;
- unique normalized family/title/subtitle identities;
- rejection of duplicate IDs and duplicate visible cards;
- preservation of context-distinct cards that share a generic title.

Duplicate immutable public content is excluded. Later private imports may replace earlier private records with the same ID or visible identity, but cannot override or duplicate immutable public content.
