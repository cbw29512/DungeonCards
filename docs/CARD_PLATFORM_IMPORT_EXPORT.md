# Card Platform v2 Import and Export

DM Forge archives are self-contained, exact-system JSON documents.

## Format identity

Every archive must contain:

- `format: "dm-forge-card-platform"`;
- `schemaVersion: 2`;
- one exact `gameSystemId`;
- an ISO export timestamp;
- card definitions;
- card runtime instances;
- deck definitions;
- deck runtime states.

Supported system IDs are:

- `dnd-2014`;
- `dnd-2024`;
- `coc-7e`.

An archive cannot combine systems or D&D editions.

## Public API

- `buildCardPlatformArchive(input)` creates and validates an archive.
- `serializeCardPlatformArchive(archive)` returns deterministic, pretty-printed JSON.
- `parseCardPlatformArchive(text, expectedGameSystemId?)` safely parses and validates an archive.
- `prepareCardPlatformImport(archive, targetOwnerId?)` removes untrusted archived ownership and rebinds private instances.

## Deterministic serialization

Definitions, instances, decks, and deck states are sorted by stable ID before serialization. Semantically ordered arrays inside cards and decks retain their existing order.

With the same export timestamp and logical content, serialization produces the same text regardless of root collection insertion order.

## Safety limits

Archives are limited to:

- 5 MB of UTF-8 JSON;
- 5,000 card definitions;
- 10,000 runtime instances;
- 1,000 deck definitions;
- 1,000 deck runtime states;
- JSON nesting depth 32;
- 100,000 characters in any one string.

The parser rejects:

- invalid JSON;
- unsupported values;
- prototype-pollution keys;
- malformed Card Platform shapes;
- unsupported format or schema versions;
- invalid dates;
- duplicate IDs;
- cross-system objects;
- invalid cards, resources, instances, decks, or deck states;
- missing linked cards;
- missing action targets;
- orphaned instances;
- missing deck members;
- invalid active card references.

## Self-contained graph

All references must resolve inside the archive:

- card links and link actions must target exported definitions;
- runtime instances must reference exported definitions;
- decks must contain exported definitions;
- deck states must reference exported decks and instances.

Partial archives with dangling references are rejected rather than imported incompletely.

## Ownership trust boundary

Archived owner IDs are data, not authentication.

`prepareCardPlatformImport` always removes archived owner IDs. Public and player-safe instances become unowned portable instances. Private instances require a valid target owner ID supplied by the authenticated import flow and are rebound to that owner.

An archive cannot claim ownership of another user's private card state.

## Exact-system import

Callers should pass the shell's expected system to `parseCardPlatformArchive`.

Examples:

- the D&D 2014 shell accepts only `dnd-2014`;
- the D&D 2024 shell accepts only `dnd-2024`;
- the Call of Cthulhu shell accepts only `coc-7e`.

A valid archive for another system is still rejected at that boundary.

## Card consistency

Imported and exported standard cards remain subject to the universal format:

- 250 × 350 pixels on screen;
- 2.5 × 3.5 inches in print;
- 5:7 aspect ratio.

Card Platform validation rejects standard cards or folio panels that attempt to use another print size.

## Compatibility

The archive contract works with:

- legacy Dice and D&D rule adapters;
- D&D monster adapters;
- CoC weapon, ritual, creature, and procedure adapters;
- generated Character Vault character decks;
- Card Platform runtime instances and deck states.

This layer provides the validated transport contract. Individual D&D, CoC, Character Vault, campaign, and builder interfaces can add download/upload controls without defining new file formats.
