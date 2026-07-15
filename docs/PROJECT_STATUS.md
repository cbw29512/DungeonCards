# Dungeon Cards Project Status

Last updated: 2026-07-14

This file is the single source of truth for the current Dungeon Cards work. Every meaningful code change must update this document before the work is considered complete.

## Product Goal

Build a polished, rules-aware tabletop card application that lets players and Dungeon Masters:

- keep focused personal card workspaces;
- roll accurate D&D 5e formulas;
- make major combat moments feel exciting without changing the rules;
- separate 2014 and 2024 rules content;
- create homebrew cards and monsters without altering official catalog data;
- prepare and print readable monster reference cards and boss folios.

## Current Release Target

**Unified Dungeon Cards MVP**

The MVP combines the existing rules-card application with the Monster Card Forge concepts in one React and TypeScript application.

## Current GitHub Work

### Pull Request #5

**Split attack, save, check, and damage card families**

Status: Merged into `main` on 2026-07-14.

Merge commit: `5a9d4a9`.

Delivered:

- separate attack rolls, saving throws, ability checks, weapon damage, spell damage, and healing;
- optional Quick Roll cards;
- attack-only natural 20 and natural 1 behavior;
- regression coverage preventing attack outcomes from leaking into checks, saves, or damage.

### Pull Request #6

**Integrate Monster Card Forge into Dungeon Cards**

Status: Open draft

Base: `main`

Branch: `feature/integrate-monster-card-forge`

Latest fully passing automated verification: commit `f73c375`, workflow run `29342152233`.

The current implementation includes the Monster Card Forge integration, persistent homebrew monsters, corrected compact-versus-folio printing, and dramatic attack-only Natural 20 and Natural 1 effects.

Completed in this branch:

- Monsters and Monster Builder navigation;
- independent Monster Encounter workspace;
- My Encounter and Monster Library views;
- search, ruleset, and creature-type filters;
- local persistence for monster selection, pinning, and order;
- Goblin, Adult Black Dragon, and Lich sample data;
- compact monster cards and six-panel boss folios;
- distinct compact-card and boss-folio print modes;
- guided Frost Troll homebrew draft with live preview;
- strict nested Monster Builder draft validation;
- bounded Monster Builder text and ability-score inputs;
- shared monster completeness validation;
- persistent saved homebrew-monster collection with unique IDs;
- Save to Monster Library and homebrew-only deletion controls;
- Homebrew ruleset filtering inside the Monster Library;
- attack-only Natural 20 and Natural 1 visual impact system;
- full-screen Natural 20 critical-hit burst with gold card lighting;
- full-screen Natural 1 automatic-miss impact with red card lighting;
- persistent card-back outcome styling after the transient flash;
- reduced-motion compatibility through the global accessibility rules;
- monster, workspace, print, storage, completeness, and roll-impact regression tests.

## Immediate Work Queue

Work must be completed in this order unless this file is updated with a reason for changing priorities.

1. Pull PR #6 locally and run the application in a real browser.
2. Verify Natural 20 and Natural 1 effects on normal, Advantage, Disadvantage, and Quick Roll attacks.
3. Verify saves, ability checks, initiative-style rolls, damage, and healing never trigger the effects.
4. Decide whether the duration, brightness, wording, and card lighting feel exciting enough at an actual table.
5. Audit desktop and narrow viewport layout, including the full-screen impact text.
6. Verify Monster workspace persistence, filtering, pinning, ordering, homebrew save, and homebrew deletion.
7. Verify print preview for a compact monster and a six-panel boss folio.
8. Record and fix visual, accessibility, and usability defects found during manual testing.
9. Complete final browser and print acceptance.
10. Mark PR #6 ready for review and merge it.

## PR #6 Acceptance Checklist

### Navigation and Layout

- [ ] Home page loads without overflow or broken controls.
- [ ] Player, DM, Monsters, Card Builder, and Monster Builder navigation works.
- [ ] Navigation remains usable on a narrow viewport.
- [ ] Page headings and landmarks are accessible.

### Attack Roll Impact

- [x] Natural 20 maps to `Critical Hit` visual impact state.
- [x] Natural 1 maps to `Automatic Miss` visual impact state.
- [x] Ordinary rolls map to no visual impact.
- [x] Every new critical or miss receives a unique transient effect instance.
- [x] The full-screen flash is portaled to `document.body` so card perspective cannot trap it.
- [x] The rolled card keeps an illuminated result theme after the transient flash ends.
- [x] Existing dice-engine tests prove non-attack d20 rolls do not receive critical or failure flags.
- [x] Natural-roll impact tests pass in GitHub Actions.
- [x] Strict TypeScript and the production build pass with the portal and timed cleanup.
- [ ] Natural 20 full-screen burst and card glow pass browser acceptance.
- [ ] Natural 1 full-screen impact and card lighting pass browser acceptance.
- [ ] Consecutive Natural 20s and consecutive Natural 1s replay the animation correctly.
- [ ] Advantage and Disadvantage use only the kept d20 for the visual outcome.
- [ ] Quick Roll celebrates the attack result without treating potential damage as a separate critical event.
- [ ] Reduced-motion behavior remains understandable without prolonged animation.

### Monster Workspace

- [ ] My Encounter and Monster Library switch correctly.
- [ ] Adding and removing monsters works.
- [ ] Pinned monsters remain grouped predictably.
- [ ] Reordering works only where allowed.
- [ ] Workspace state survives a page refresh.
- [x] Malformed nested Monster Builder local storage is rejected and falls back safely.
- [x] Saved homebrew-monster collections reject malformed data, duplicate IDs, and incomplete monsters.
- [x] Homebrew monsters receive unique IDs and remain separate from official catalog records.
- [x] Homebrew ruleset filtering is implemented.
- [ ] Search works by name, creature type, and challenge rating in the browser.
- [ ] Ruleset and creature-type filters work together in the browser.
- [ ] Empty and zero-result states are clear.
- [ ] Saved homebrew monsters survive refresh, can be added to My Encounter, and can be deleted from the Library.

### Monster Cards and Folios

- [ ] Compact cards remain readable without clipped text.
- [ ] Boss and spellcaster folios include all required sections.
- [x] Open and close controls expose their expanded state to assistive technology.
- [ ] Long names and long action text do not break the layout.
- [ ] Source and ruleset labels remain visible.

### Printing

- [x] Print-mode logic selects one compact card for simple monsters and a folio for complex monsters.
- [x] Print-mode selection has regression coverage.
- [ ] Printing a compact monster hides unrelated application content.
- [ ] Compact card output is 2.5 × 3.5 inches.
- [ ] Boss folio prints as six 2.5 × 3.5 inch panels in a 3 × 2 layout.
- [ ] Print preview does not include workspace buttons or navigation.
- [ ] Print state resets correctly after printing or canceling.
- [ ] Print output remains readable in browsers that suppress background colors.

### Monster Builder

- [ ] Frost Troll example loads correctly in the browser.
- [x] Ability-score state rejects non-integers and values outside 1–30.
- [x] Required-field warnings cover identity, defenses, movement, and named actions.
- [x] Valid drafts round-trip through the strict storage boundary.
- [x] Invalid JSON, malformed arrays, and invalid ability scores are rejected by tests.
- [x] Completed drafts can be converted into independent saved library monsters.
- [x] Saved library monsters are validated for completeness and unique IDs.
- [ ] Save success, save failure, reset, and deletion behavior pass browser acceptance.
- [ ] Live preview matches the final monster card renderer.

### Quality Gate

- [x] PR #5 passed CI and was merged into `main`.
- [x] Workflow run `29339941945` passed locked installation, dependency audit, all tests, strict TypeScript compilation, and the production Vite build at commit `8725c14`.
- [x] Natural-roll impact state has dedicated regression tests.
- [x] Existing dice-engine regression tests keep attack outcomes off checks and other ordinary d20 rolls.
- [x] Workflow run `29342152233` passed locked installation, dependency audit, all tests, strict TypeScript compilation, and the production Vite build at commit `f73c375`.
- [ ] Manual browser acceptance passes.
- [ ] Manual print-preview acceptance passes.
- [ ] Documentation reflects the final behavior after manual acceptance.

## Change Log

### 2026-07-14

- Established this project-status document as the repository tracking source.
- Added the manual browser, print, accessibility, persistence, and homebrew acceptance checklist.
- Corrected monster printing so simple monsters use one poker card and complex monsters use six-panel folios.
- Added strict Monster Builder draft validation and saved homebrew-monster library validation.
- Added unique client IDs, Save to Monster Library, Homebrew filtering, status/error messaging, and homebrew-only deletion.
- Added regression tests for draft storage, saved collections, duplicate IDs, incomplete monsters, and print selection.
- GitHub Actions exposed and then verified the TypeScript 7 assertion-function correction.
- Workflow run `29339941945` passed installation, dependency audit, all tests, strict compilation, and production build at commit `8725c14`.
- Updated PR #5 verification, marked it ready, and merged it into `main` as commit `5a9d4a9`.
- Retargeted PR #6 from the stacked feature branch to `main`.
- Added a typed `AttackRollImpact` state model with `critical-hit` and `automatic-miss` outcomes.
- Added a full-screen Natural 20 gold burst with `Critical Hit` messaging and animated card glow.
- Added a full-screen Natural 1 red impact with rules-accurate `Automatic Miss` messaging and animated card lighting.
- Added persistent critical-hit and automatic-miss styling to the revealed card back.
- Used a React portal so the full-screen effect is not constrained by the card-flip perspective container.
- Added unique effect instances and timed cleanup so consecutive identical outcomes replay correctly without leaving invisible overlays mounted.
- Added roll-impact regression tests and retained the attack-only dice-engine guardrails.
- Workflow run `29342152233` passed installation, dependency audit, all tests, strict TypeScript compilation, and the production build for the new visual effects at commit `f73c375`.

## Required Update Format

For every future work session, add an entry containing:

- date;
- files or feature area changed;
- reason for the change;
- tests or manual checks completed;
- known limitations or next action.

A code change is not considered finished until this status file and the relevant pull-request description agree with the implementation.
