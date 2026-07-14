# Call of Cthulhu 7e Preview Status

Last updated: 2026-07-14

## Purpose

This branch contains a playable, unofficial private-development preview of a Call of Cthulhu 7th Edition card experience inside Dungeon Cards.

The preview uses original demonstration content only. It does not include official logos, artwork, scenarios, spells, tables, or creature statistics.

## Product rule: same UI, different system logic

The D&D and Call of Cthulhu sides should feel like one Dungeon Cards product. They should share the same navigation structure, card-library patterns, personal workspaces, search and filters, pinning and favorites, builders, history, printing, responsive behavior, accessibility, and interaction quality.

They must not share rules assumptions. Call of Cthulhu requires its own percentile engine, success levels, Bonus/Penalty dice, Sanity procedures, weapons, spells, creatures, and encounter state. D&D logic must not be reused where the rules differ.

## Primary quality gate

Rules accuracy is the highest priority. Visual polish cannot compensate for an incorrect rule.

The complete verification process is maintained in [`docs/COC_RULES_ACCURACY.md`](./COC_RULES_ACCURACY.md). The current preview is playable but is not yet rules-certified.

## Branch and dependency

- Branch: `feature/call-of-cthulhu-7e-preview`
- Based on: `feature/integrate-monster-card-forge`
- Design epic: GitHub issue #7
- Design specification: draft PR #8
- Accuracy gate: `docs/COC_RULES_ACCURACY.md`

This preview should not merge to `main` before the Monster Card Forge integration branch is completed, the rules audit is complete for included content, and the licensing path is resolved.

## Implemented

- [x] Top-level D&D 5e / Call of Cthulhu 7e system gateway.
- [x] Separate dark CoC application shell and navigation.
- [x] Investigator, Keeper, Creatures, Weapons, and Spells areas.
- [x] Independent percentile engine.
- [x] Critical, Extreme, Hard, Regular, Failure, and Fumble outcomes.
- [x] Skill-derived half and fifth thresholds.
- [x] Regular, Hard, and Extreme difficulty comparison.
- [x] Bonus and Penalty dice using shared units and alternative tens dice.
- [x] Interactive original weapon card with skill, ammunition, reload, malfunction, attack, and damage.
- [x] Interactive original spell card with casting roll, Magic Point cost, Sanity cost, duration, and resource reset.
- [x] Combat-ready original creature dossier with characteristics, HP, MP, armor, Dodge, attacks, damage, Sanity loss, traits, and Keeper cues.
- [x] Encounter controls for wounds, Magic Points, defeated state, and reset.
- [x] Original quick-reference cards for pushed rolls, Bonus/Penalty dice, Sanity checks, and close combat responses.
- [x] Dark dossier, evidence-locker, occult-memorandum, ink, brass, blood, and sickly-green visual language.
- [x] Responsive layouts and compatibility with the existing reduced-motion stylesheet.
- [x] Unit tests for percentile boundaries, fumble thresholds, Bonus/Penalty dice, double-zero handling, and difficulty comparison.
- [x] Formal accuracy gate requiring source records, two-review verification, and boundary tests.

## Rules-certification checklist

- [ ] Obtain and record the exact Quick-Start Rules revision used for Phase 1.
- [ ] Record the exact Keeper Rulebook printing or PDF revision used for the complete audit.
- [ ] Create a source record for every implemented procedure and executable card.
- [ ] Verify percentile success levels and Fumble boundaries directly against the official source.
- [ ] Verify Bonus and Penalty dice directly against the official source.
- [ ] Verify pushed-roll eligibility and consequence procedure.
- [ ] Verify opposed-roll and tie handling.
- [ ] Verify combat responses, damage, impaling, armor, wounds, dying, and healing.
- [ ] Verify firearm range, rate of fire, ammunition, reload, point-blank, and malfunction procedures.
- [ ] Verify Sanity loss, temporary insanity, indefinite insanity, bouts, treatment, and recovery.
- [ ] Verify spell and ritual costs, casting, opposed rolls, duration, maintenance, and failure behavior.
- [ ] Verify chase procedures.
- [ ] Add independent second-review signoff to every included rule.
- [ ] Run a complete session with a reviewer checking card rulings against the books.

## Manual acceptance checklist

- [ ] System gateway works at desktop width.
- [ ] System gateway works at narrow/mobile width.
- [ ] Switching from D&D to CoC and back works.
- [ ] CoC archive navigation works.
- [ ] Percentile results and threshold labels are readable.
- [ ] Bonus and Penalty dice show both candidates and select the correct result.
- [ ] Investigator page works.
- [ ] Keeper page works.
- [ ] Weapon ammunition, empty-state error, reload, malfunction, and damage work.
- [ ] Spell MP, Sanity, casting, duration, and reset controls work.
- [ ] Creature attack, damage, Dodge, Sanity loss, HP, MP, wound state, defeated state, and reset work.
- [ ] Keyboard focus remains visible.
- [ ] Reduced-motion mode remains usable.
- [ ] No D&D cards or persistence appear inside the CoC workspace.
- [ ] No CoC runtime state leaks into D&D workspaces.
- [ ] Shared UI patterns remain consistent between D&D and CoC without sharing incompatible rules logic.

## Licensing gate

Chaosium's current Fan Material Policy explicitly excludes apps, downloadable software, and virtual tabletops. The public product therefore requires a licensing decision before release. Development may continue using original placeholder content while the project avoids publishing protected rules text, official stat blocks, official spells, artwork, logos, scenarios, or copied tables.

Official references reviewed:

- https://www.chaosium.com/cthulhu-quickstart/
- https://www.chaosium.com/call-of-cthulhu-keeper-rulebook-hardcover/
- https://www.chaosium.com/fan-use-and-licensing/
- https://www.chaosium.com/fan-material-policy/

## Next actions

1. Keep the shared Dungeon Cards UI patterns consistent across both systems.
2. Complete the official Quick-Start rules audit before adding more rules cards.
3. Create the source-record schema and first verified rule inventory.
4. Perform desktop and narrow-browser acceptance.
5. Add persistence namespaces only after the game-system boundary is accepted.
6. Expand creatures, weapons, spells, Sanity, and combat only after each rule family passes its accuracy gate.
7. Resolve the licensing route before replacing original prototype content with any licensed catalog.
