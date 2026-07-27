# Saved Character Play Mode

Status: implementation review  
Parent issues: #70, #59, #67  
Reviewed: 2026-07-27

## Purpose

Saved Character Play Mode overlays private current-game state on an immutable verified Character Vault build. The saved row does not duplicate static rules data.

## Tracked state

- display name;
- current and Temporary Hit Points;
- Inspiration;
- Death Save successes and failures;
- finite class-resource uses;
- spell slots by level;
- magic-item charges;
- attuned magic-item IDs, capped at three;
- custom notes;
- archive and timestamps.

## Identity and safety

- `baseBuildId` resolves through the exact Vault Ready profile registry;
- missing build references fail visibly and never open a substitute;
- saved edition and level must match the immutable build;
- repository actions verify the signed-in owner;
- Supabase Row Level Security remains the final database boundary;
- validation runs before create and update operations.

## Rendering and print

The existing Character Vault sheet receives optional saved state. Screen tabs and the complete print packet therefore render the same current HP, resources, slots, charges, attunement, name, and notes.

Editor controls are workspace panels, not card-platform cards. They do not create a competing card size and are hidden from print output.

## Operations

- Save a verified profile and immediately open it;
- Open the latest owner-scoped saved row;
- Rename and update tracked state;
- Duplicate into a new independent saved row;
- Archive or permanently delete;
- Close Play Mode without replacing the saved build.

## Release gates

- immutable profile lookup tests;
- complete saved-state validation tests;
- Play Mode and current print-packet rendering tests;
- all handwritten modules under the practical 150-line boundary;
- dependency audit, unit tests, TypeScript compilation, production build, and security scan must pass.
