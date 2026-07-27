# Playable Exact-System Card Catalog Decks

Playable decks turn immutable Card Catalog definitions into independently tracked table state.

## Exact-system boundary

Deck data is stored separately for:

- `dnd-2014`;
- `dnd-2024`;
- `coc-7e`.

The storage key is:

`dungeon-cards.card-deck-library.v2.<gameSystemId>`

Definitions, instances, deck definitions, deck runtime states, active-deck identity, and archive state must all agree with the selected exact system. No automatic edition or system conversion occurs.

## Immutable definitions and runtime copies

`CardDefinition` remains immutable library data. Adding a catalog card creates a new `CardRuntimeInstance` with:

- a unique instance ID;
- independent resource state initialized from the definition;
- optional local ownership for private content;
- custom name;
- runtime notes;
- conditions;
- archive and timestamp state.

The same definition may be added repeatedly. Each copy tracks resources and notes independently.

`DeckDefinition.cardDefinitionIds` records unique definition membership. Ordered duplicate copies live in `DeckRuntimeState.cardInstanceIds`.

## Deck lifecycle

Users can:

- create multiple decks;
- choose personal, game-master, encounter, character, investigator, campaign, print, or favorites kinds;
- select one active deck per exact system;
- rename decks;
- duplicate decks with cloned but independent instances;
- archive and restore decks;
- delete decks after confirmation;
- reorder and remove individual runtime copies.

Deleting a deck removes instances that no other deck state references. Removing the final copy of one definition removes that definition's membership from the deck without mutating the stored definition snapshot.

## Resources and refresh

Bounded resources are clamped between zero and their maximum. Unlimited resources retain the Card Platform zero-value convention.

Users can:

- increment or decrement a resource;
- reset one resource;
- reset every resource on one card;
- refresh all matching resources in the active deck for short rest, long rest, daily, session, or manual cadence.

Refresh uses the immutable resource definition's initial value and cadence.

## Persistence and recovery

Saved data uses strict JSON shape validation plus semantic graph inspection.

Structural corruption produces an empty usable exact-system library and a visible warning. Partial but structurally valid graphs retain visible diagnostics for:

- missing definitions;
- missing runtime instances;
- missing decks or deck states;
- wrong-system objects;
- invalid resources or timestamps;
- duplicate IDs.

No invalid data is silently deleted.

Writes are transactional from the application's perspective: state changes enter React only after canonical serialization and `localStorage.setItem` succeed. A quota or browser-storage failure leaves both the previous persisted library and current in-memory state intact.

## Private ownership

Archived or imported owner IDs are not used to create deck copies. Adding a private definition binds its instance to DM Forge's stable anonymous local owner identity.

This owner is a browser-local identity, not authentication. Account synchronization remains a separate future feature.

## Export

The active deck exports through the validated `dm-forge-card-platform` archive contract. The archive contains only:

- definitions referenced by the selected deck;
- runtime instances ordered by the deck state;
- the selected deck definition;
- the selected deck runtime state.

Private definitions retain private visibility and valid instance ownership. Decks with missing references cannot be exported.

## Rendering and printing

Cards continue to use the universal shell:

- 250 × 350 pixels on screen;
- 2.5 × 3.5 inches in print;
- 5:7 aspect ratio.

Add-to-deck controls, copy labels, resource controls, notes, ordering, lifecycle controls, source metadata, warnings, and refresh actions remain outside the card dimensions.

Catalog printing and active-deck printing use separate body-scoped modes. Active-deck printing hides runtime editors and prints only the deck's universal card faces.

## Relationship to specialized workspaces

Playable catalog decks do not replace Character Vault Play Mode, D&D encounters, player/DM workspaces, or CoC Investigator/Keeper tools. They provide a shared exact-system card runtime for custom table decks assembled from the unified catalog.
