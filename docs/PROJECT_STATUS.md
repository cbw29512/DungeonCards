# Dungeon Cards Project Status

Last updated: 2026-07-15

This file is the current implementation source of truth. Detailed catalog coverage is tracked in [`CATALOG_COMPLETENESS.md`](./CATALOG_COMPLETENESS.md).

## Product goal

Build a polished tabletop card application that:

- runs accurate D&D SRD 5.1 and SRD 5.2.1 procedures;
- keeps editions explicitly separated;
- gives Player, DM, and Monster workspaces independent saved state;
- supports multiple individually named copies of the same card;
- turns configured cards into fast click-to-roll table tools;
- provides plain-language rules guides before source-audit details;
- supports original homebrew cards and monsters;
- prints readable poker-size monster cards and ordered boss folios;
- maintains a separate Call of Cthulhu percentile-system prototype without copying protected catalogs.

## Main branch state

Merged into `main`:

- split Attack, Save, Check, Damage, Healing, and Quick Roll card families;
- Monster Card Forge integration;
- Call of Cthulhu 7e playable preview;
- automatic GitHub Pages deployment;
- click-the-result-card-to-reroll interaction;
- ordered equal-size monster folio viewer;
- Call of Cthulhu design specification.

## Current branch

Branch: `agent/roll-side-advantage-core-cards`

Current work:

- move Normal, Advantage, and Disadvantage controls to the result side;
- keep the three roll modes mutually exclusive;
- preserve **Change** as the only settings-reopen control;
- replace one-card-per-catalog-ID workspaces with independent card instances;
- allow unlimited copies of the same Player or DM card;
- give every copy its own stable instance ID, pin state, position, and optional name;
- migrate existing Player and DM tables into the new instance format;
- add tests for duplicate creation, rename, pin, movement, removal, normalization, and migration;
- add eighteen individual skill-check cards;
- add six individual ability-saving-throw cards;
- add a plain-language D&D rules guide;
- add a plain-language Call of Cthulhu rules guide;
- rename the Call of Cthulhu developer-facing audit navigation to **Sources**;
- define the complete SRD catalog target and ordered import plan.

## Current D&D catalog coverage

Complete:

- SRD 5.1 weapon table: 37 weapons;
- SRD 5.2.1 weapon table: 38 weapons;
- separate weapon Attack, Damage, and eligible Quick Roll cards;
- generic Attack, Saving Throw, and Ability Check cards;
- eighteen individual skill cards;
- six individual ability-save cards.

Partial:

- 22 audited spell effect families;
- selected traps, magic items, and random tables;
- three audited 2014 monster samples;
- core rules guide.

Required for complete SRD coverage:

- every spell and monster in SRD 5.1 and SRD 5.2.1;
- complete conditions and core procedure references;
- complete armor, gear, tools, mounts, vehicles, and services;
- complete SRD feats, classes, subclasses, species, and backgrounds;
- complete SRD magic items, traps, and hazards;
- source manifests and automated expected-count tests for every family.

## Call of Cthulhu boundary

The prototype may include original/custom creatures, weapons, spells, rituals, builders, and concise source-linked procedure summaries.

It may not include copied official creature statistics, spell text, weapon tables, scenarios, artwork, logos, or protected prose without an appropriate Chaosium software license. The user-facing Rules Guide explains playable procedures; the Sources area preserves verification and audit details.

## Current acceptance checklist

### Card interaction

- [x] Configured result cards reroll when clicked or activated by keyboard.
- [x] **Change** reopens settings.
- [x] Roll-side Normal, Advantage, and Disadvantage controls are mutually exclusive.
- [ ] Browser-test switching roll mode repeatedly without reopening settings.
- [ ] Confirm natural 20 and natural 1 effects use the kept d20 after roll-mode changes.

### Duplicate card instances

- [x] Multiple copies of one catalog card receive unique instance IDs.
- [x] Copies can be renamed, pinned, moved, and removed independently.
- [x] Existing one-copy workspaces migrate to the instance schema.
- [x] Duplicate and migration unit tests exist.
- [ ] Browser-test multiple copies with different settings and names.
- [ ] Persist each copy's selected ruleset, mode, modifiers, scaling, and roll mode across refresh.

### Rules guides

- [x] D&D guide explains core table procedures in plain language.
- [x] Call of Cthulhu guide explains current playable procedures before source details.
- [ ] Complete D&D conditions and action-economy reference sections.
- [ ] Browser-test desktop and narrow layouts.

### Catalog

- [x] Individual skill and save cards added.
- [x] Catalog-completeness definition documented.
- [ ] Full source manifests generated from the official SRDs.
- [ ] Full spell import complete.
- [ ] Full monster import complete.
- [ ] Remaining SRD families complete.

### Quality gate

- [ ] Pull request opened.
- [ ] Dependency installation passes.
- [ ] High-severity dependency audit passes.
- [ ] All tests pass.
- [ ] Strict TypeScript compilation passes.
- [ ] Production Vite build passes.
- [ ] Changes merge into `main` only after the automated gate succeeds.

## Next ordered work

1. Pass CI and merge the current interaction/rules/core-card branch.
2. Persist per-instance card settings.
3. Build machine-readable SRD source manifests and expected-count tests.
4. Import the complete SRD 5.1 spell and monster catalogs.
5. Import the complete SRD 5.2.1 spell and monster catalogs without edition blending.
6. Add the remaining equipment, conditions, rules, feats, classes, species, backgrounds, magic items, traps, and hazards.
7. Complete manual browser, accessibility, rules, and print acceptance.
