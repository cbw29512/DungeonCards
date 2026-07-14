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
- First audit report: `docs/COC_RULE_AUDIT_01.md`

This preview should not merge to `main` before the Monster Card Forge integration branch is completed, the rules audit is complete for included content, and the licensing path is resolved.

## Implemented

- [x] Top-level D&D 5e / Call of Cthulhu 7e system gateway.
- [x] Separate dark CoC application shell and navigation.
- [x] Investigator, Keeper, Creatures, Weapons, Spells, and Rules Audit areas.
- [x] Independent percentile engine.
- [x] Critical, Extreme, Hard, Regular, Failure, and Fumble outcomes.
- [x] Skill-derived half and fifth thresholds.
- [x] Regular, Hard, and Extreme difficulty comparison.
- [x] Zero, one, or two net Bonus or Penalty dice using one shared units die and alternative tens dice.
- [x] Bonus/Penalty cancellation helper and boundary tests.
- [x] Interactive original weapon card with skill, ammunition, reload, malfunction, attack, and gated base damage.
- [x] Interactive original spell card with casting roll, Magic Point cost, Sanity cost, duration, and resource reset.
- [x] Combat-ready original creature dossier with characteristics, HP, MP, armor, Dodge, attacks, gated base damage, Sanity loss, traits, and Keeper cues.
- [x] Neutral HP state labels that do not falsely automate Major Wounds.
- [x] Extreme and Critical weapon/creature damage blocked until the damage audit is certified.
- [x] Original quick-reference cards for pushed rolls, Bonus/Penalty dice, Sanity checks, and close combat responses.
- [x] Machine-readable source registry with `prototype`, `needs-review`, `verified`, and `disputed` states.
- [x] Expandable source status shown directly on rules, weapon, spell, and creature cards.
- [x] Visible Rules Audit workspace summarizing every current source record.
- [x] Dark dossier, evidence-locker, occult-memorandum, ink, brass, blood, and sickly-green visual language.
- [x] Responsive layouts and compatibility with the existing reduced-motion stylesheet.
- [x] Unit tests for percentile boundaries, Fumble thresholds, one/two Bonus and Penalty dice, cancellation, double-zero handling, and difficulty comparison.
- [x] Registry tests requiring unique IDs, required metadata, valid quick-reference links, and two-review metadata for any future verified record.
- [x] Formal accuracy gate requiring source records, two-review verification, and boundary tests.

## Current audit status

The current rules records are intentionally not marked verified.

- Percentile checks: `needs-review`.
- Bonus/Penalty dice: `needs-review`.
- Pushed rolls: `needs-review`.
- Sanity checks: `needs-review`.
- Fight Back/Dodge: `needs-review`.
- Sample weapon, spell, and creature: `prototype`.

The official Quick-Start source has been located. Page-level review and independent second review remain required before any rule moves to `verified`.

## Rules-certification checklist

- [ ] Obtain and record the exact Quick-Start Rules revision used for Phase 1.
- [ ] Record the exact Keeper Rulebook printing or PDF revision used for the complete audit.
- [x] Create a source record for every currently implemented procedure and executable card.
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
- [ ] Rules Audit navigation and expandable records work.
- [ ] Percentile results and threshold labels are readable.
- [ ] One and two Bonus dice show all candidates and select the lowest result.
- [ ] One and two Penalty dice show all candidates and select the highest result.
- [ ] Investigator page works.
- [ ] Keeper page works.
- [ ] Weapon ammunition, empty-state error, reload, malfunction, base damage gate, and special-damage warning work.
- [ ] Spell MP, Sanity, casting, duration, reset, and prototype warning work.
- [ ] Creature attack, base-damage gate, Dodge, Sanity loss, HP, MP, neutral HP state, defeated state, reset, and prototype warning work.
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

1. Complete page-level review of percentile checks and Bonus/Penalty dice against the exact Quick-Start revision.
2. Add reviewer identities and verification dates only after direct and independent review.
3. Build a verified opposed-roll resolver before automating Fight Back/Dodge outcomes.
4. Build a verified damage resolver before enabling Extreme, Critical, impaling, or Major Wound automation.
5. Perform desktop and narrow-browser acceptance of the Rules Audit and updated dice controls.
6. Add persistence namespaces only after the game-system boundary is accepted.
7. Expand creatures, weapons, spells, Sanity, and combat only after each rule family passes its accuracy gate.
8. Resolve the licensing route before replacing original prototype content with any licensed catalog.
