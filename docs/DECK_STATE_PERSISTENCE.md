# Exact-System Deck State Persistence

DM Forge separates reusable card definitions from table-specific runtime state.

## Exact system identities

Persisted deck state always uses one Card Platform identity:

- `dnd-2014`
- `dnd-2024`
- `coc-7e`

A browser key must include the exact system identity. D&D editions may appear together in a visible table, but their persisted history remains separated.

## Dice-card deck state

Dice-card favorites and roll history use:

`dungeon-cards.dice-deck-state.v1.<gameSystemId>.<deckId>`

The v1 envelope stores:

- schema version;
- exact game-system identity;
- stable deck ID;
- favorite card IDs;
- at most 25 validated roll-history entries;
- update timestamp.

The current D&D homebrew deck uses the stable logical deck ID `homebrew`. The exact system in the key keeps its 2014 and 2024 state independent.

The repository contract also supports `coc-7e` so future CoC card decks can use the same validated storage boundary.

## Rule-card history

Player and DM rule-card tables may legitimately contain both D&D editions. Each roll therefore carries both:

- its SRD ruleset;
- its exact Card Platform system identity.

History uses one envelope per role and edition:

`dungeon-cards.rule-roll-history.v1.<role>.<gameSystemId>`

The visible table log merges those envelopes chronologically, but storage never combines the editions.

## Persistent versus temporary state

Persistent:

- favorite card IDs;
- Dice-card roll history;
- rule-card roll history.

Temporary UI state:

- which card is currently flipped;
- the animated result shown on a card back;
- reset timers.

A refresh intentionally resets temporary presentation state while retaining useful table history and favorites.

## Validation

Repositories reject:

- mixed-system rows;
- ruleset and system mismatches;
- unsafe IDs;
- duplicate favorite IDs;
- invalid timestamps;
- malformed roll results;
- oversized histories;
- envelope, role, deck, or key mismatches.

Invalid stored data falls back to an empty system-scoped state rather than entering the application.

## Universal card-size rule

Favorite, delete, and history controls are workspace controls. They render outside the card face and cannot redefine the universal card footprint:

- 250 × 350 pixels on screen;
- 2.5 × 3.5 inches in print;
- 5:7 aspect ratio.

Changing card dimensions still requires a deliberate product-wide migration.
