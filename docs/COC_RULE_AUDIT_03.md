# Call of Cthulhu 7e Rules Audit 03

Date: 2026-07-14

## Scope

This audit uses the official Chaosium Call of Cthulhu RPG Wiki combat page to implement:

- readied-firearm initiative;
- handgun multiple-shot penalties;
- point-blank range and Bonus die;
- successful dive-for-cover effects;
- ordinary weapon damage;
- Extreme blunt damage;
- Extreme impaling damage.

The official source is:

- `https://cthulhuwiki.chaosium.com/rules/combat.html`

## Firearm procedure

The source-backed firearm card now calculates:

- a readied firearm's initiative as DEX + 50;
- point-blank distance as within one-fifth DEX in feet;
- one Bonus die at point blank;
- one Penalty die on every shot when a handgun fires two or three times in one round;
- one Penalty die when the target successfully dives for cover;
- loss of the target's next attack after choosing to dive for cover;
- cancellation of Bonus and Penalty dice before each shot;
- a separate percentile roll for every selected shot;
- ammunition consumption for the selected number of shots.

Tests cover:

- the exact point-blank boundary;
- the first value outside point blank;
- two and three shots;
- successful dive for cover;
- two simultaneous Penalty sources;
- point-blank cancellation against one or two Penalty sources.

## Structured damage engine

The damage engine no longer treats every successful attack as an ordinary formula roll.

It supports:

### Ordinary damage

Roll weapon damage and damage bonus normally and add them.

### Extreme blunt damage

Use maximum weapon damage plus maximum damage bonus.

### Extreme impaling damage

Use maximum weapon damage plus maximum damage bonus plus one additional roll of the weapon's damage formula.

The original handgun prototype now uses the Extreme impaling procedure for an Extreme success. Critical damage remains blocked because its exact rule has not passed the source gate.

Tests cover:

- maximum values for simple and compound formulas;
- ordinary weapon and damage-bonus rolls;
- the official-style blunt example;
- the official handgun impaling pattern;
- impaling formulas that contain multiple dice and a fixed modifier.

## Data-boundary decision

The firearm procedure and the weapon catalog remain separate:

- the procedure card contains source-backed rules and scene conditions;
- the sample weapon card contains original prototype equipment data;
- a future licensed or private user-entered weapon catalog can supply damage, capacity, malfunction, range, and impaling data without changing the firearm procedure engine.

## Deliberate exclusions

The following remain blocked or incomplete:

- Critical damage;
- full firearm range bands beyond the reviewed point-blank rule;
- reload timing by weapon;
- complete malfunction consequences;
- automatic-fire and burst rules;
- shotgun range changes beyond the starter example;
- armor interaction;
- creature attacks without structured blunt/impaling metadata.

## Review status

The official Chaosium wiki has received a direct implementation review. Independent second review remains required, so the firearm and Extreme damage records remain `needs-review` rather than `verified`.
