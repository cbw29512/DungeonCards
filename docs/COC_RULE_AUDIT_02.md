# Call of Cthulhu 7e Rules Audit 02

Date: 2026-07-14

## Scope

This audit uses the official Chaosium-hosted Call of Cthulhu RPG Wiki to review and implement:

- D100 reading;
- Regular, Hard, and Extreme difficulty;
- pushed rolls;
- generic opposed rolls and equal-level ties;
- Bonus and Penalty dice;
- basic Sanity checks and the 5-point temporary-insanity trigger;
- Dodge and Fight Back tie rules;
- Extreme damage boundaries;
- Hit Points, Major Wounds, unconsciousness, dying, and instant death.

## Authority and release status

Chaosium's main Getting Started page links directly to the Call of Cthulhu RPG Wiki. The wiki states that it contains the basic rules needed to play Starter Set scenarios.

This constitutes a direct primary-source implementation review for the included basic mechanics. It does not satisfy the project's independent second-review rule. All reviewed records therefore remain `needs-review`, not `verified`.

Critical and Fumble boundaries are not fully described by the reviewed wiki pages and remain pending direct Quick-Start PDF or Keeper Rulebook comparison.

## Source pages

- `https://cthulhuwiki.chaosium.com/rules/game-system.html`
- `https://cthulhuwiki.chaosium.com/rules/sanity.html`
- `https://cthulhuwiki.chaosium.com/rules/combat.html`
- `https://cthulhuwiki.chaosium.com/rules/hit-points-wounds-and-healing.html`

## Findings and implementation

### D100 and difficulty

The official wiki confirms:

- 00 tens plus 0 units is 100;
- 00 tens plus a nonzero unit is a result below 10;
- Regular succeeds at or below the full skill;
- Hard succeeds at or below one-half;
- Extreme succeeds at or below one-fifth.

Existing engine behavior and boundary tests match these rules.

### Pushed rolls

The official wiki confirms that a player justifies a renewed attempt after a failed roll, the stakes rise, and the Keeper may foreshadow the consequence before the player chooses whether to roll again. The combat page confirms that combat rolls cannot be pushed.

The quick-reference card was updated to include the combat exclusion. A full eligibility matrix remains pending core-rulebook review.

### Generic opposed rolls

A dedicated resolver now:

1. compares success levels;
2. awards an equal success level to the side with the higher skill;
3. requires a separate D100 tie-break when skill values also match;
4. awards the tie-break to the lower roll;
5. requests another tie-break if the tie-break dice are equal;
6. returns no winner when neither side achieves a success.

Generic opposed rules are not reused for close combat because combat has response-specific tie handling.

### Dodge and Fight Back

A dedicated close-combat resolver now enforces:

- the attacker must achieve a higher success level than Dodge;
- therefore Dodge wins equal success levels;
- a defender Fighting Back must achieve a higher success level than the attacker;
- therefore the initiating attacker wins equal levels against Fight Back;
- two failed combat rolls inflict no damage;
- a successful Fight Back outcome is identified separately from an attacker hit.

Damage from Fight Back remains capped and handled by the future verified damage engine.

### Sanity

A source-backed Sanity card now:

- allows current Sanity from 0 to 100;
- rolls directly against current Sanity rather than forcing Sanity through a 1–100 skill validator;
- applies the listed success or failure loss formula;
- never reduces Sanity below zero;
- prompts for a Keeper-determined momentary involuntary action after any positive loss;
- prompts for an INT roll when 5 or more Sanity is lost from one check;
- on a successful INT roll, generates the official 1D10-hour temporary-insanity duration and a 1D10-round immediate bout duration;
- does not reproduce the copyrighted bout table.

Indefinite insanity remains outside this starter-rule slice.

### Hit Points and Major Wounds

A dedicated injury resolver now applies one blow at a time and enforces:

- HP never falls below zero;
- a blow dealing at least half maximum HP causes a Major Wound;
- odd maximum-HP thresholds round upward because damage is a whole number;
- a new Major Wound requires a CON roll to remain conscious;
- a blow equal to or above maximum HP causes instant death;
- zero HP with a Major Wound means dying;
- zero HP without a Major Wound means unconscious but not dying.

The procedure card identifies later dying checks and First Aid requirements without attempting to control round timing.

### Extreme damage

The official wiki confirms distinct formulas for blunt and impaling attacks. The existing weapon and creature prototypes intentionally continue to block automatic Extreme and Critical damage because their data schemas do not yet distinguish all required weapon-damage and damage-bonus terms.

The correct next step is a structured damage model, not another string formula shortcut.

## Automated coverage

New tests cover:

- opposed success-level ranking;
- equal-level higher-skill tie resolution;
- separate D100 tie-breaks;
- Dodge ties;
- Fight Back ties;
- two failed combat rolls;
- Major Wound values immediately below and on the threshold;
- odd maximum-HP thresholds;
- instant death;
- zero HP with and without a Major Wound;
- Sanity success at an equal roll;
- zero, positive, four-point, and five-point Sanity losses;
- Sanity floors at zero.

## Remaining release blockers

- independent second review;
- exact Critical and Fumble source review;
- complete extreme/critical/impaling damage schema;
- firearm catalog and malfunction review;
- indefinite insanity and treatment;
- complete dying/healing workflow;
- Keeper Rulebook comparison for rules beyond the official wiki's starter scope;
- licensing approval for a public software release.
