# Call of Cthulhu 7e Rules Audit 01

Date: 2026-07-14

## Scope

This audit covers the first playable preview only:

- percentile success levels;
- Regular, Hard, and Extreme difficulty;
- Fumble thresholds;
- Bonus and Penalty dice;
- pushed-roll reference text;
- Sanity-check reference text;
- Fight Back/Dodge reference text;
- prototype weapon, spell, and creature interactions.

## Source position

The official Chaosium Quick-Start landing page was located and confirms that the downloadable Quick-Start Rules are intended to teach the base rules.

The PDF download endpoint did not render through the available web inspection environment during this audit. Therefore:

- no rule was marked `verified`;
- page numbers were not invented;
- current core records remain `needs-review`;
- a direct page-level comparison is still required;
- an independent second review is still required.

The audit also identified a licensed supplemental scenario source using simplified Call of Cthulhu rules. It was useful for identifying questions and familiar terminology, but it was not treated as authority for certifying the standard 7th Edition implementation.

## Findings and changes

### 1. Percentile success engine

The existing implementation already separated Critical, Extreme, Hard, Regular, Failure, and Fumble outcomes and used floored half and fifth values.

Additional tests were added for:

- odd skill values;
- values immediately around half and fifth thresholds;
- the skill-value boundary at 49/50 for Fumble handling;
- 01 and 100.

Status: `needs-review` pending page-level source comparison and independent review.

### 2. Bonus and Penalty dice

The first preview supported only one Bonus or Penalty die.

The engine now supports the full prototype range of:

- two Penalty dice;
- one Penalty die;
- normal;
- one Bonus die;
- two Bonus dice.

A cancellation helper resolves opposing Bonus and Penalty dice before the roll. Tests cover cancellation, three candidate results, and double-zero combinations such as 100 versus 10.

Status: `needs-review` pending page-level source comparison and independent review.

### 3. Major Wound presentation

The creature dossier previously labeled a creature at or below half current HP as “Severely wounded.” That could be mistaken for automatic Major Wound logic.

The labels are now neutral:

- Full HP;
- HP reduced;
- Half HP or less;
- 0 HP.

The interface explicitly states that it is not automating a Major Wound ruling.

Status: corrected presentation; full wound rules still unaudited.

### 4. Extreme and Critical damage

The first preview rolled ordinary listed damage automatically after every successful attack. That could incorrectly flatten special damage outcomes into ordinary damage.

The preview now:

- rolls listed base damage only as an explicitly labeled prototype action;
- blocks automatic Extreme and Critical damage;
- displays a warning that special damage requires the certified combat damage resolver;
- avoids claiming that an ordinary base-damage roll resolves impaling or other special damage.

Status: unsafe automation removed; complete damage rules still unaudited.

### 5. Fight Back and Dodge

The preview previously described the choice but did not implement an opposed resolver. It still does not automate tie handling.

The reference now explicitly says that the response-specific tie rule is required. The creature Dodge result warns that it must be compared against an attack by a future verified opposed-combat resolver.

Status: `needs-review`; automation blocked.

### 6. Sanity and spells

The creature and ritual examples are original prototypes. Their formulas and procedures are not treated as official catalog content.

The interface now identifies them as prototypes in expandable source records. Complete Sanity, insanity, and official spell procedures remain outside the certified slice.

Status: `prototype`.

## Source-registry enforcement

A machine-readable source registry now requires:

- unique rule IDs;
- system and edition;
- source title and URL;
- chapter or section;
- original implementation summary;
- status;
- review notes.

Automated tests ensure that any future `verified` record includes:

- a primary reviewer;
- an independent reviewer;
- a verification date.

## Release decision

This audit does not certify the Call of Cthulhu rules implementation.

The preview remains suitable for UI and interaction testing with original content. It is not ready to be represented as a complete or authoritative 7th Edition rules reference.

## Next audit

Audit 02 should use the exact Quick-Start PDF revision and cover:

1. percentile outcome thresholds;
2. one and two Bonus/Penalty dice and cancellation;
3. pushed-roll eligibility and exclusions;
4. opposed-roll ranking and ties;
5. Fight Back versus Dodge.

No record should move to `verified` until the two-review rule is satisfied.
