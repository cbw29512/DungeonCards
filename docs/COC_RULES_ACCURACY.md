# Call of Cthulhu 7e-Compatible Rules Accuracy Gate

Last updated: 2026-07-28

## Priority

Rules accuracy is the primary acceptance criterion for the `coc-7e` percentile-horror expansion.

Visual polish, atmosphere, animation, and content volume cannot compensate for an incorrect rule. No card, calculator, creature action, weapon interaction, ritual procedure, Sanity procedure, chase procedure, or encounter automation may be presented as rules-complete until it passes this gate.

## Shared UI, separate rules

DM Forge uses one consistent product UI across supported game systems:

- the same system gateway;
- the same navigation hierarchy;
- the same card-library and personal-workspace concepts;
- the same card flip, pin, favorite, search, filter, history, builder, print, and accessibility patterns;
- the same responsive behavior and interaction quality.

The information and execution logic must remain system-specific:

- D&D uses its own d20, damage, saving throw, spell, and monster schemas;
- `coc-7e` uses its own percentile, success-level, Bonus/Penalty die, Sanity, weapon, ritual, creature, and encounter schemas;
- presentation components may be shared, but rules calculations may not be generalized by silently treating one system like another;
- D&D and `coc-7e` persistence, history, workspaces, and runtime state must remain isolated.

## Authoritative source order

Rules are verified in this order:

1. Current Call of Cthulhu 7th Edition Keeper Rulebook.
2. Current official Call of Cthulhu 7th Edition Quick-Start Rules for mechanics included there.
3. Current official Chaosium errata, clarifications, and published updates.
4. Current official Investigator Handbook when it contains relevant player-facing options or equipment guidance.

Community wikis, forum answers, videos, actual-play rulings, blogs, and memory may identify questions but are not sufficient authority for approving a rule implementation.

## Required source record

Every implemented rules object must have a source record before release:

- stable internal rule ID;
- system and edition;
- rule name;
- source title;
- chapter or section;
- page number when available;
- rulebook printing or document revision when relevant;
- concise original implementation summary;
- reviewer;
- verification date;
- status: `prototype`, `needs-review`, `verified`, or `disputed`;
- tests covering normal and boundary behavior;
- notes explaining any optional rule, Keeper discretion, or implementation limitation.

Protected rulebook text must not be copied into the repository. Source records contain citations and original summaries only.

## Two-review rule

A rule is not marked `verified` until:

1. one implementation review compares the code and card text directly with the authoritative source; and
2. one independent review checks the result without relying on the first reviewer’s interpretation.

Any disagreement changes the status to `disputed` and blocks release of that rule until resolved.

## Test requirements

Each calculation or guided procedure must include tests for:

- minimum and maximum supported inputs;
- values immediately below, on, and above every threshold;
- 01 and 100 percentile results where relevant;
- all success levels;
- both sides of the skill-value boundary used for Fumble handling;
- Bonus and Penalty dice, including double-zero interpretation;
- ties and success-level comparison where relevant;
- insufficient resources such as ammunition, Magic Points, Luck, or Sanity;
- optional-rule behavior kept separate from core-rule behavior;
- invalid persisted data and cross-system contamination.

## Card-content rules

Each card must clearly distinguish:

- automatic rules;
- choices made by the player;
- rulings made by the Keeper;
- optional rules;
- reminders that are descriptive rather than executable;
- derived values versus values supplied by a creature, weapon, ritual, or Investigator record.

A card must not imply that a Keeper-discretion rule is automatic. A card must not invent a consequence, modifier, damage value, range, cost, or threshold to fill missing information.

## Creature and NPC accuracy

Combat-ready creature and NPC cards require verification of:

- characteristics and derived values;
- attack percentages and attacks per round;
- damage and Damage Bonus application;
- armor and damage reduction;
- Dodge and combat-response behavior;
- special powers and resource costs;
- Sanity loss;
- rituals and opposed rolls;
- wound, unconsciousness, dying, and defeat handling;
- any exception to standard combat rules.

Original creatures may be used as public playable content when their statistics and prose are original, their source metadata says so, and their executable mechanics pass repository validation. They must not be presented as official Chaosium creatures or used as evidence that an official creature catalog has been implemented.

## Weapon accuracy

Weapon cards require verification of:

- skill used;
- damage formula and Damage Bonus interaction;
- range bands;
- attacks per round;
- capacity and reload behavior;
- malfunction threshold;
- impaling behavior;
- point-blank, multiple-shot, automatic-fire, and burst behavior when implemented;
- era-specific or optional data clearly labeled.

Original weapons may be public playable records when their mechanics use reviewed procedures and their data does not reproduce a protected official table.

## Ritual accuracy

Ritual cards require verification of:

- casting requirements;
- casting time;
- Magic Point, Sanity, POW, Luck, or other costs;
- required and opposed rolls;
- range, target, duration, and maintenance;
- resistance and dismissal;
- success and failure consequences;
- combat timing;
- Keeper-only information separation.

Original rituals are playable original content, not substitutes for or reproductions of an official spell catalog. Their own invented effects must remain distinguishable from source-backed generic casting procedures.

## Current implementation status

The current public `coc-7e` Card Catalog contains:

- 9 verified procedure cards;
- 24 original weapon cards;
- 24 original ritual cards;
- 24 original creature/NPC cards;
- 12 original premade Investigator cards.

That is **93 public Card Platform definitions**.

The Investigator builder additionally offers 24 original occupation packages. Current browser-local Investigator state tracks HP, Sanity, Magic Points, Luck, and Mythos with correct maximum-Sanity handling.

This content depth does not mean every Call of Cthulhu rule is certified or that official catalogs are included. Each source-backed rule retains its own review status. Original records are validated as original product content and remain subject to mechanical tests, source-boundary tests, and playtesting.

## Release blockers

The `coc-7e` expansion cannot be marked fully release-ready until:

- every included source-backed rule has a completed source record;
- every executable rule has boundary tests;
- every rule claimed as verified has passed the required review gate;
- optional rules are labeled and isolated;
- all known disputes are resolved or the affected automation is removed;
- a complete session is run while a reviewer checks each rules claim against the applicable source;
- persistent Keeper case and encounter state are implemented and tested;
- structured private owned-content builders preserve the publishing boundary;
- the licensing path permits the intended distribution and branding.

Original library records may ship incrementally when they are accurately labeled, mechanically validated, and do not overstate official rules or catalog coverage.