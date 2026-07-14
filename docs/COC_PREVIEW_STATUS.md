# Call of Cthulhu 7e Preview Status

Last updated: 2026-07-14

## Purpose

This branch contains a playable, unofficial private-development preview of a Call of Cthulhu 7th Edition card experience inside Dungeon Cards.

The preview uses original demonstration content only for weapon, spell, and creature catalog entries. It does not include official logos, artwork, scenarios, spell text, copied tables, or official creature statistics.

## Product rule: same UI, different system logic

The D&D and Call of Cthulhu sides should feel like one Dungeon Cards product. They share navigation structure, card-library patterns, personal workspaces, search and filters, pinning and favorites, builders, history, printing, responsive behavior, accessibility, and interaction quality.

They do not share rules assumptions. Call of Cthulhu has its own percentile, success-level, Bonus/Penalty, Sanity, combat, wound, firearm, damage, weapon, spell, creature, and encounter engines.

## Primary quality gate

Rules accuracy is the highest priority. Visual polish cannot compensate for an incorrect rule.

The complete verification process is maintained in [`docs/COC_RULES_ACCURACY.md`](./COC_RULES_ACCURACY.md). The current preview has received a primary source review for the included official-wiki mechanics, but it is not rules-certified until an independent second review is complete.

## Branch and dependency

- Branch: `feature/call-of-cthulhu-7e-preview`
- Based on: `feature/integrate-monster-card-forge`
- Design epic: GitHub issue #7
- Design specification: draft PR #8
- Accuracy gate: `docs/COC_RULES_ACCURACY.md`
- First audit report: `docs/COC_RULE_AUDIT_01.md`
- Official wiki audit: `docs/COC_RULE_AUDIT_02.md`
- Firearm and Extreme damage audit: `docs/COC_RULE_AUDIT_03.md`

This preview should not merge to `main` before the Monster Card Forge integration is completed, all included rules pass independent review, and the licensing route is resolved.

## Implemented

### Shared product foundation

- [x] Top-level D&D 5e / Call of Cthulhu 7e gateway.
- [x] Separate CoC runtime and dark themed shell.
- [x] Investigator, Keeper, Creatures, Weapons, Spells, and Rules Audit areas.
- [x] Source status displayed directly on executable and reference cards.
- [x] Source records link directly to the reviewed official page or the prototype project record.
- [x] Machine-readable source registry with `prototype`, `needs-review`, `verified`, and `disputed` states.
- [x] Registry tests block future verified records without two reviewers and a verification date.

### Percentile engine

- [x] Independent D100 engine.
- [x] Regular, Hard, and Extreme thresholds.
- [x] Critical, Extreme, Hard, Regular, Failure, and Fumble result states.
- [x] Half and fifth values use floor rounding.
- [x] Double-zero handling.
- [x] Zero, one, or two net Bonus or Penalty dice.
- [x] Shared units die and multiple tens dice.
- [x] Bonus/Penalty cancellation helper.
- [x] Boundary tests around odd skill values and the skill 49/50 Fumble boundary.

Critical and Fumble boundaries remain pending direct Quick-Start PDF or Keeper Rulebook comparison.

### Source-backed Investigator procedures

- [x] Basic Sanity check with success/failure loss formulas.
- [x] Sanity supports a current value of 0.
- [x] Sanity cannot fall below zero.
- [x] Any positive loss prompts a Keeper-determined involuntary action.
- [x] Losing 5 or more from one check prompts an INT roll.
- [x] Successful INT roll generates the 1D10-hour temporary-insanity duration and a 1D10-round bout duration.
- [x] Official bout table is not copied into the app.
- [x] Damage is applied one blow at a time.
- [x] Major Wound threshold uses at least half maximum HP from one blow.
- [x] Odd maximum-HP thresholds round upward.
- [x] Major Wound prompts a CON roll rather than automatic unconsciousness.
- [x] One blow equal to or above maximum HP triggers instant death.
- [x] Zero HP with a Major Wound means dying.
- [x] Zero HP without a Major Wound means unconscious but not dying.

### Source-backed Keeper procedures

- [x] Generic opposed resolver compares success levels.
- [x] Equal generic success levels use the higher skill value.
- [x] Equal skills require separate D100 tie-break rolls, with lower winning.
- [x] Equal tie-break dice request another tie-break.
- [x] Generic opposed rolls remain separate from combat response rules.
- [x] Dodge wins equal success levels.
- [x] Initiating attacker wins equal success levels against Fight Back.
- [x] Successful higher-level Fight Back is identified separately.
- [x] Two failed close-combat rolls inflict no damage.

### Source-backed firearm procedures

- [x] Readied firearm initiative uses DEX + 50.
- [x] Point-blank range is calculated as one-fifth DEX in feet.
- [x] Point blank grants one Bonus die.
- [x] Two or three handgun shots apply one Penalty die to every shot.
- [x] A successful dive for cover applies one Penalty die.
- [x] A successful dive for cover costs the target its next attack.
- [x] Firearm Bonus and Penalty dice cancel before rolling.
- [x] Every selected handgun shot rolls independently.
- [x] Ammunition is consumed for the selected number of shots.

### Structured damage engine

- [x] Ordinary weapon damage rolls weapon damage and Damage Bonus normally.
- [x] Extreme blunt damage uses maximum weapon damage plus maximum Damage Bonus.
- [x] Extreme impaling damage uses maximum weapon damage plus maximum Damage Bonus plus another weapon-damage roll.
- [x] Maximum-damage calculations support compound formulas and fixed modifiers.
- [x] The original handgun prototype uses the source-backed Extreme impaling resolver.
- [x] Critical damage remains blocked pending direct and independent rule review.
- [x] Creature special damage remains blocked until creature attacks carry structured blunt/impaling metadata.

### Prototype catalog content

- [x] Original weapon card with ammunition, reload, malfunction, attacks, ordinary damage, and source-backed Extreme impaling behavior.
- [x] Original spell card with casting, MP, SAN cost, duration, and reset.
- [x] Original creature dossier with attacks, HP, MP, armor, Dodge, prototype SAN loss, and Keeper cues.
- [x] Prototype warnings remain visible and distinguish catalog demonstrations from source-backed procedures.

## Current audit status

Primary official-wiki review completed; independent review remains pending:

- D100 reading and Regular/Hard/Extreme difficulty: `needs-review`.
- Bonus/Penalty procedure and cancellation: `needs-review`.
- Pushed-roll basics and combat exclusion: `needs-review`.
- Generic opposed rolls: `needs-review`.
- Sanity check and temporary-insanity trigger: `needs-review`.
- Fight Back/Dodge tie rules: `needs-review`.
- Major Wounds, dying, and instant death: `needs-review`.
- Ordinary and Extreme blunt/impaling damage: `needs-review`.
- Readied initiative, point blank, multiple handgun shots, and successful dive for cover: `needs-review`.
- Sample weapon, spell, and creature entries: `prototype`.

## Rules-certification checklist

- [ ] Obtain and record the exact Quick-Start PDF revision.
- [ ] Record the exact Keeper Rulebook printing or PDF revision used for the complete audit.
- [x] Create source records for every implemented procedure and executable card.
- [x] Complete primary official-wiki review for D100 reading and Regular/Hard/Extreme thresholds.
- [ ] Verify Critical and Fumble boundaries against the PDF or Keeper Rulebook.
- [x] Complete primary official-wiki review for Bonus/Penalty selection and cancellation.
- [ ] Confirm the maximum number of net Bonus/Penalty dice against the PDF or Keeper Rulebook.
- [x] Complete primary official-wiki review for pushed-roll basics and combat exclusion.
- [x] Complete primary official-wiki review for generic opposed ties.
- [x] Complete primary official-wiki review for Dodge and Fight Back tie rules.
- [x] Complete primary official-wiki review for basic Sanity and temporary-insanity trigger.
- [x] Complete primary official-wiki review for Major Wounds, dying, and instant death.
- [x] Build and complete primary review of the structured ordinary/Extreme blunt/Extreme impaling damage engine.
- [x] Complete primary official-wiki review for readied initiative, point blank, multiple handgun shots, and successful dive for cover.
- [ ] Verify complete firearm range bands, reload timing, weapon-specific attacks per round, malfunction consequences, cover, and automatic fire.
- [ ] Verify Critical damage.
- [ ] Verify indefinite insanity, treatment, and recovery.
- [ ] Verify complete healing and dying-round workflow.
- [ ] Verify spell and ritual procedures.
- [ ] Verify chase procedures.
- [ ] Add independent second-review signoff to every included rule.
- [ ] Run a complete session with a reviewer checking card rulings against the books.

## Manual acceptance checklist

- [ ] System gateway works at desktop and narrow widths.
- [ ] Switching between D&D and CoC works.
- [ ] CoC navigation and Rules Audit work.
- [ ] Source links open the intended official page.
- [ ] Percentile and one/two Bonus/Penalty controls remain readable.
- [ ] Generic opposed roll winner, higher-skill tie, and separate tie-break work.
- [ ] Dodge tie favors defender.
- [ ] Fight Back tie favors initiating attacker.
- [ ] Sanity 0 always fails the check without validation errors.
- [ ] Success/failure SAN formulas and current SAN update correctly.
- [ ] 5+ SAN loss reveals the INT follow-up.
- [ ] Major Wound threshold works for even and odd maximum HP.
- [ ] Major Wound CON prompt does not imply automatic unconsciousness.
- [ ] Zero-HP dying distinction is clear.
- [ ] Firearm card calculates readied initiative and point-blank range correctly.
- [ ] Two and three handgun shots apply the correct Penalty die to every shot.
- [ ] Successful dive for cover applies its Penalty die and next-attack reminder.
- [ ] Point-blank Bonus cancels the expected Penalty sources.
- [ ] Firearm card rolls and consumes the selected number of rounds.
- [ ] Ordinary and Extreme impaling weapon damage show a readable breakdown.
- [ ] Critical damage remains visibly blocked.
- [ ] Weapon, spell, and creature prototype warnings remain visible.
- [ ] Keyboard focus remains visible.
- [ ] Reduced-motion mode remains usable.
- [ ] D&D and CoC state remain isolated.

## Licensing gate

Chaosium's current Fan Material Policy excludes apps, downloadable software, and virtual tabletops. Public software release requires a licensing decision. Development may continue with original catalog content and concise source-linked rule implementations while protected prose, official stat blocks, official spells, artwork, logos, scenarios, and copied tables remain out of the repository.

Official references reviewed:

- https://www.chaosium.com/call-of-cthulhu-getting-started/
- https://cthulhuwiki.chaosium.com/rules/game-system.html
- https://cthulhuwiki.chaosium.com/rules/sanity.html
- https://cthulhuwiki.chaosium.com/rules/combat.html
- https://cthulhuwiki.chaosium.com/rules/hit-points-wounds-and-healing.html
- https://www.chaosium.com/cthulhu-quickstart/
- https://www.chaosium.com/fan-use-and-licensing/
- https://www.chaosium.com/fan-material-policy/

## Next actions

1. Perform independent review of the source-backed cards and engines.
2. Obtain the exact Quick-Start PDF revision for Critical, Fumble, and maximum Bonus/Penalty confirmation.
3. Audit full firearm range bands, reload, weapon-specific attacks per round, malfunction consequences, cover, and automatic fire.
4. Add structured creature attack metadata so the verified damage engine can be safely reused by combat-ready creature cards.
5. Complete browser acceptance for the new Investigator, Keeper, firearm, damage, and Rules Audit cards.
6. Add persistence namespaces only after the game-system boundary is accepted.
7. Resolve the licensing route before public release.
