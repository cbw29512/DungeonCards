# System-Safe Private Card Libraries

DM Forge provides one local-first private Card Platform library for each exact game system:

- `dnd-2014`;
- `dnd-2024`;
- `coc-7e`.

Built-in SRD, verified, original demonstration, Character Vault, rule, and monster catalogs remain separate. Importing a private archive never replaces built-in content.

## Routes

D&D and Call of Cthulhu each expose a first-class Private Card Library route.

The D&D route requires the user to choose D&D 2014 or D&D 2024 before selecting a file. The CoC route is permanently scoped to Call of Cthulhu 7e.

## Validation before persistence

Selecting a file performs only validation and preview. It does not write to storage.

The preview displays:

- archive filename;
- exact system and schema version;
- export timestamp;
- definition, instance, deck, and deck-state counts;
- private definition and rebound-instance counts;
- visibility distribution;
- review-status distribution;
- deck names and member counts;
- ID conflicts with the currently saved exact-system library.

The secure Card Platform archive parser continues to enforce the 5 MB file limit, JSON safety, shape validation, collection limits, exact-system identity, source and card validation, and complete graph references.

## Ownership boundary

Archived owner IDs are never trusted.

DM Forge creates one stable anonymous local owner ID in the browser. During validation, public and player-safe instances have archived ownership removed. Private instances are rebound to the local owner through `prepareCardPlatformImport`.

The local owner ID identifies private browser state. It is not authentication and is not shared with advertisers, publishers, or other users.

## Replacement behavior

Each exact system stores one canonical archive. DM Forge does not silently merge archive graphs.

When the selected exact-system library is empty, the validated archive may be imported directly.

When a library already exists, the preview requires an explicit checkbox confirming that the entire selected library will be replaced. Cancel leaves the current library unchanged.

No automatic conflict renaming occurs. Conflicting IDs are shown before the replacement decision.

## Transactional storage

Storage keys are:

`dungeon-cards.private-card-library.v1.<gameSystemId>`

The archive is fully serialized and validated before `localStorage.setItem` runs. If serialization, validation, or the browser write fails, the hook does not update in-memory state and reports that the previous library was not changed.

Clearing removes only the selected exact-system key after browser confirmation.

## Browsing and export

Saved private cards can be searched across title, subtitle, summary, details, family, tags, action labels, review state, visibility, source title, and source edition.

Filters cover:

- card family;
- visibility;
- review status.

Imported decks show kind, name, member count, and missing-reference count. The archive validator should keep missing references at zero; the visible count makes that invariant auditable.

The selected exact-system library can be exported through the same deterministic, validated Card Platform archive format.

## Card dimensions

Imported definitions render through `CardPlatformDefinitionCard` and remain locked to:

- 250 × 350 pixels on screen;
- 2.5 × 3.5 inches in print;
- 5:7 aspect ratio.

Upload, validation, conflict, search, filter, deck, export, and clear controls are workspace panels outside the card.

## Privacy and synchronization

Anonymous local import, browsing, printing, clearing, and export are available without an account.

This implementation does not synchronize private libraries to Supabase or any other cloud store. Account-backed synchronization requires a separate persistence design, ownership policy, row-level security migration, conflict protocol, and opt-in user interface.
