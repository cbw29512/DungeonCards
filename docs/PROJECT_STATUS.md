# Dungeon Cards Project Status

Last updated: 2026-07-14

This file is the single source of truth for the current Dungeon Cards work. Every meaningful code change must update this document before the work is considered complete.

## Product Goal

Build a polished, rules-aware tabletop card application that lets players and Dungeon Masters:

- keep focused personal card workspaces;
- roll accurate D&D 5e formulas;
- separate 2014 and 2024 rules content;
- create homebrew cards and monsters without altering official catalog data;
- prepare and print readable monster reference cards and boss folios.

## Current Release Target

**Unified Dungeon Cards MVP**

The MVP combines the existing rules-card application with the Monster Card Forge concepts in one React and TypeScript application.

## Current GitHub Work

### Pull Request #5

**Split attack, save, check, and damage card families**

Status: Open draft

Purpose:

- separate attack rolls, saving throws, ability checks, weapon damage, spell damage, and healing;
- preserve optional Quick Roll cards;
- prevent attack-only natural 20 and natural 1 behavior from leaking into checks, saves, or damage cards.

Dependency note: Pull Request #6 is currently based on this branch. PR #5 must be completed before PR #6 can be cleanly merged into `main`.

### Pull Request #6

**Integrate Monster Card Forge into Dungeon Cards**

Status: Open draft

Branch: `feature/integrate-monster-card-forge`

Last fully passing automated verification: code commit `73b2483`.

Current head includes project tracking, compact-versus-folio print correction, strict Monster Builder draft validation, and a persistent personal Homebrew Monster Library. A replacement GitHub Actions run must pass before merge.

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
- monster utility, workspace, print-selection, draft-storage, and library-storage regression tests.

## Immediate Work Queue

Work must be completed in this order unless this file is updated with a reason for changing priorities.

1. Confirm the current branch passes GitHub Actions after the TypeScript assertion fix.
2. Audit PR #6 in a real browser at desktop and narrow viewport sizes.
3. Verify navigation, workspace persistence, filtering, pinning, ordering, expansion, empty states, homebrew save, and homebrew deletion.
4. Verify print preview for both a compact monster and a six-panel boss folio.
5. Record and fix visual, accessibility, and usability defects found during manual testing.
6. Finish and merge PR #5.
7. Rebase or retarget PR #6 onto the updated `main` branch.
8. Run the full CI suite again.
9. Complete final browser and print acceptance.
10. Mark PR #6 ready for review and merge it.

## PR #6 Acceptance Checklist

### Navigation and Layout

- [ ] Home page loads without overflow or broken controls.
- [ ] Player, DM, Monsters, Card Builder, and Monster Builder navigation works.
- [ ] Navigation remains usable on a narrow viewport.
- [ ] Page headings and landmarks are accessible.

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

- [x] Dependency installation passes at code commit `73b2483`.
- [x] High-severity dependency audit passes at code commit `73b2483`.
- [x] Unit and catalog tests pass at code commit `73b2483`.
- [x] Strict TypeScript compilation passes at code commit `73b2483`.
- [x] Production build passes at code commit `73b2483`.
- [x] Unit tests passed in workflow run `29339703179` after the new homebrew library work.
- [x] Workflow run `29339703179` identified TypeScript assertion errors in `homebrewMonsterStorage.ts` instead of hiding the failure.
- [x] The TypeScript 7 assertion function now has the required explicit function-type annotation.
- [ ] Current branch head passes the full GitHub Actions workflow.
- [ ] Manual browser acceptance passes.
- [ ] Manual print-preview acceptance passes.
- [ ] Documentation reflects the final behavior.

## Change Log

### 2026-07-14

- Established this project-status document as the repository tracking source.
- Confirmed PR #6 is the active Monster Card Forge integration branch.
- Confirmed PR #6 CI passed at commit `73b2483`.
- Recorded the dependency relationship between PR #5 and PR #6.
- Added the manual browser, print, accessibility, persistence, and homebrew acceptance checklist.
- Audited monster printing and found that every monster was forced into the six-panel folio.
- Added explicit `card` versus `folio` print selection based on the existing monster layout decision.
- Updated print CSS so simple monsters target one 2.5 × 3.5-inch card while complex monsters retain the six-panel layout.
- Added `aria-expanded` to the folio toggle and changed print labels to `Print card` or `Print folio`.
- Added regression assertions for Goblin compact printing and Adult Black Dragon/Lich folio printing.
- Audited Monster Builder persistence and found that only three top-level fields were checked before trusting saved nested data.
- Added a dedicated `monsterHomebrewStorage` module with complete schema validation for text fields, ability scores, arrays, actions, spellcasting, layout, and ruleset.
- Refactored the Monster Builder hook to use the storage boundary, preserve initialization errors, log failures, and reject invalid ability-score updates.
- Added field-length limits, stronger completeness warnings, and a two-frame print-preview render guard.
- Added regression tests for valid draft round trips, malformed JSON, malformed nested arrays, invalid ability scores, and invalid action data.
- Centralized required monster fields in `getMonsterCompletenessWarnings` so the builder and saved library enforce the same rules.
- Added `homebrewMonsterStorage` and `useHomebrewMonsters` for a separate validated personal monster collection.
- Added unique client IDs, Save to Monster Library, Homebrew filtering, save status/error messaging, and homebrew-only deletion.
- Added regression tests for saved collection round trips, empty storage, duplicate IDs, incomplete monsters, and completeness warnings.
- GitHub Actions run `29339703179` passed installation, audit, and all tests, then failed production compilation on TypeScript assertion-function rules.
- Downloaded and inspected the uploaded build log rather than guessing from the workflow summary.
- Added the explicit assertion-function type annotation required by TypeScript 7.
- Automated verification for the corrected current branch head is pending.

## Required Update Format

For every future work session, add an entry containing:

- date;
- files or feature area changed;
- reason for the change;
- tests or manual checks completed;
- known limitations or next action.

A code change is not considered finished until this status file and the relevant pull-request description agree with the implementation.
