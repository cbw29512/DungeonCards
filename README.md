# Dungeon Cards

Dungeon Cards is an MVP for a tabletop action-card platform.

The first goal is simple: flip a beautiful card and get an accurate randomized dice result.

## MVP Definition of Done

A player can:

1. Open the React website.
2. View a hero page explaining the product.
3. See a starter player deck.
4. Click a card.
5. Watch the card flip.
6. Receive a randomized dice result from the card formula.
7. Re-click the card to roll it again.

## Current Card Schema

Each card has:

- `id`
- `name`
- `category`
- `formula`
- `description`
- `imageEmoji`
- optional `critOn`
- optional `failOn`
- `isFavorite`

## Current Dice Engine

Supported examples:

- `1d20+8`
- `1d12+5`
- `1d12+7`
- `10d6`
- `2d8+4`

Unsupported text is rejected so bad homebrew formulas do not silently break combat.

## Local Setup

```bash
npm install
npm run dev
```

## Tests

```bash
npm test
```

## Next Build Steps

1. Add a Homebrew Builder page.
2. Add local saving for custom cards.
3. Add deck folders: Player Deck, DM Deck, Monster Deck, Favorites.
4. Add advantage and disadvantage rules.
5. Add spell upcast controls.
6. Add import/export for decks.
7. Add backend auth and database after the front-end MVP feels right.

## Architecture Rule

Keep files under 150 lines where practical. Split components, data, and rules logic before files become hard to follow.
