# Dungeon Cards Project Status

Last updated: 2026-07-14

This file is the single source of truth for the current Dungeon Cards work. Every meaningful code change must update this document before the work is considered complete.

## Product Goal

Build a polished, rules-aware tabletop card application that lets players and Dungeon Masters:

- keep focused personal card workspaces;
- roll accurate D&D 5e formulas;
- separate 2014 and 2024 rules content;
- create homebrew cards without altering official catalog data;
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

Current automated verification: Passing at commit `73b2483`.

Completed in this branch:

- Monsters and Monster Builder navigation;
- independent Monster Encounter workspace;
- My Encounter and Monster Library views;
- search, ruleset, and creature-type filters;
- local persistence for monster selection, pinning, and order;
- Goblin, Adult Black Dragon, and Lich sample data;
- compact monster cards and six-panel boss folios;
- selected-monster printing;
- guided Frost Troll homebrew draft with live preview;
- monster utility and workspace regression tests.

## Immediate Work Queue

Work must be completed in this order unless this file is updated with a reason for changing priorities.

1. Audit PR #6 in a real browser at desktop and narrow viewport sizes.
2. Verify navigation, workspace persistence, filtering, pinning, ordering, expansion, and empty states.
3. Verify print preview for both a compact monster and a six-panel boss folio.
4. Record and fix visual, accessibility, and usability defects found during manual testing.
5. Confirm whether a completed homebrew monster can be saved into a reusable personal Monster Library; the current implementation saves the draft but does not yet document a completed-library workflow.
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
- [ ] Corrupted local storage fails safely.
- [ ] Search works by name, creature type, and challenge rating.
- [ ] Ruleset and creature-type filters work together.
- [ ] Empty and zero-result states are clear.

### Monster Cards and Folios

- [ ] Compact cards remain readable without clipped text.
- [ ] Boss and spellcaster folios include all required sections.
- [ ] Open and close controls communicate their current state.
- [ ] Long names and long action text do not break the layout.
- [ ] Source and ruleset labels remain visible.

### Printing

- [ ] Printing a compact monster hides unrelated application content.
- [ ] Compact card output is 2.5 × 3.5 inches.
- [ ] Boss folio prints as six 2.5 × 3.5 inch panels in a 3 × 2 layout.
- [ ] Print preview does not include workspace buttons or navigation.
- [ ] Print state resets correctly after printing or canceling.
- [ ] Print output remains readable in browsers that suppress background colors.

### Monster Builder

- [ ] Frost Troll example loads correctly.
- [ ] Ability modifiers update correctly.
- [ ] Required-field warnings are understandable.
- [ ] Draft state survives a refresh.
- [ ] Reset restores the example safely.
- [ ] Live preview matches the final monster card renderer.
- [ ] Completed homebrew monster save workflow is defined and tested.

### Quality Gate

- [x] Dependency installation passes.
- [x] High-severity dependency audit passes for commit `73b2483`.
- [x] Unit and catalog tests pass for commit `73b2483`.
- [x] Strict TypeScript compilation passes for commit `73b2483`.
- [x] Production build passes for commit `73b2483`.
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

## Required Update Format

For every future work session, add an entry containing:

- date;
- files or feature area changed;
- reason for the change;
- tests or manual checks completed;
- known limitations or next action.

A code change is not considered finished until this status file and the relevant pull-request description agree with the implementation.
