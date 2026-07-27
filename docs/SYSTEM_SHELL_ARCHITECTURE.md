# DM Forge System Shell Architecture

## Purpose

DM Forge is one card-centered product with independent tabletop-system shells. The top-level application chooses a system; each shell owns its routes, navigation, workspace composition, and system-specific state boundaries.

## Top-level gateway

`src/App.tsx` is limited to:

- reading the selected system from the URL;
- rendering `GameSystemGateway` when no system is selected;
- rendering `DndAppShell` or `CocAppShell`;
- clearing the route when the user switches systems.

It does not import individual rules tools, builders, cards, encounters, or persistence hooks.

## D&D shell

`src/components/dndShell/` contains:

- `DndAppShell.tsx` — D&D route state, local libraries, navigation state, and focus restoration;
- `DndNavigation.tsx` — responsive D&D navigation;
- `DndPageContent.tsx` — the complete D&D workspace dispatcher;
- `DndHome.tsx` — card-centered D&D home page;
- `dndPageRegistry.ts` — labels, navigation order, and home-card definitions.

All existing D&D workspaces remain available. Exact D&D 2014/2024 identity continues to live in the workspaces and storage contracts that require it.

## Call of Cthulhu shell

`src/components/cocShell/` contains:

- `CocAppShell.tsx` — CoC route state, navigation state, footer, and focus restoration;
- `CocNavigation.tsx` — responsive Keeper-toolkit navigation;
- `CocPageContent.tsx` — routed CoC workspace dispatcher;
- `CocHome.tsx` — card-centered case-desk home page;
- `CocReferenceGrid.tsx` — reusable procedure and quick-reference rendering;
- `cocPageRegistry.ts` — labels, route order, and home-card definitions.

The routed CoC areas are:

- Investigator;
- Keeper;
- Rules;
- Equipment;
- Spells & Rituals;
- Creatures & NPCs;
- Encounters;
- Builders;
- Sources & Licensing.

The former monolithic `CocPreview` remains only as a compatibility export of `CocAppShell`.

## Run-sheet data

Investigation, Keeper, and combat run sheets live under `src/data/`. Their shared contract lives in `src/types/cocShell.ts`, keeping data independent from React components.

## Routes

`src/integration/dmForgeRoute.ts` owns exact page parsing and deterministic links for D&D and CoC. Unknown pages fall back to the selected shell home page. Switching systems clears the previous system route rather than carrying a page name across systems.

## Styling

`src/styles/application.css` is the single application stylesheet entry point loaded by `src/main.tsx`. Feature components may continue to load their own narrowly scoped styles.

The universal card contract remains unchanged:

- 250 × 350 pixels on screen;
- 2.5 × 3.5 inches in print;
- 5:7 aspect ratio.

Shell workspaces and panels are not permitted to redefine card dimensions.

## Accessibility

Both shells preserve:

- skip links;
- keyboard-focus restoration after navigation;
- reduced-motion scrolling;
- responsive navigation controls;
- print cleanup;
- stable main-content targets.

## Persistence boundaries

This refactor does not replace persistence. Existing exact-system storage remains isolated:

- D&D 2014;
- D&D 2024;
- Call of Cthulhu 7e;
- optional owner-only Character Vault storage.

## Release gates

Changes to system shells require:

- unit and source-contract tests;
- route tests for both systems;
- strict TypeScript compilation;
- production exports and build;
- universal-card checks;
- security scanning;
- shell, route, navigation, and registry modules below the practical 150-line boundary.
