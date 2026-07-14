# Call of Cthulhu 7e Rules Accuracy Gate

Last updated: 2026-07-14

## Priority

Rules accuracy is the primary acceptance criterion for the Call of Cthulhu 7th Edition expansion.

Visual polish, atmosphere, animation, and content volume cannot compensate for an incorrect rule. No Call of Cthulhu card, calculator, creature action, weapon interaction, spell procedure, Sanity procedure, chase procedure, or encounter automation may be presented as rules-complete until it passes this gate.

## Shared UI, separate rules

Dungeon Cards should use one consistent product UI across supported game systems:

- the same system gateway;
- the same navigation hierarchy;
- the same card-library and personal-workspace concepts;
- the same card flip, pin, favorite, search, filter, history, builder, print, and accessibility patterns;
- the same responsive behavior and interaction quality.

The information and execution logic must remain system-specific:

- D&D uses its own d20, damage, saving throw, spell, and monster schemas;
- Call of Cthulhu uses its own percentile, success-level, Bonus/Penalty die, Sanity, weapon, spell, creature, and encounter schemas;
- presentation components may be shared, but rules calculations may not be generalized by silently treating one system like another;
- D&D and Call of Cthulhu persistence, history, workspaces, and runtime state must remain isolated.

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
- derived values versus values supplied by a creature, weapon, spell, or investigator record.

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
- spells and opposed rolls;
- wound, unconsciousness, dying, and defeat handling;
- any exception to standard combat rules.

Original prototype creatures may be used for interface development, but they must be labeled as original prototypes and must not be used as evidence that official creature implementation is accurate.

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

## Spell and ritual accuracy

Spell and ritual cards require verification of:

- casting requirements;
- casting time;
- Magic Point, Sanity, POW, Luck, or other costs;
- required and opposed rolls;
- range, target, duration, and maintenance;
- resistance and dismissal;
- success and failure consequences;
- combat timing;
- Keeper-only information separation.

Original prototype spells remain interface demonstrations and are not rules-source substitutes.

## Current preview status

The current preview demonstrates architecture and interaction. It contains:

- a tested percentile engine;
- original demonstration weapon, spell, and creature content;
- original short-form procedure summaries;
- no official creature or spell catalog.

It is not yet rules-certified. Before expanding the catalog, the project must complete a card-by-card audit against the current official Quick-Start Rules and Keeper Rulebook.

## Release blockers

The Call of Cthulhu expansion cannot be marked release-ready until:

- every included rule has a completed source record;
- every executable rule has boundary tests;
- every included card has passed two-review verification;
- optional rules are labeled and isolated;
- all known disputes are resolved or the affected card is removed;
- a full session is run using the cards while a reviewer checks each ruling against the rulebook;
- the licensing path permits the intended distribution.
