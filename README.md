# Dungeon Cards

Dungeon Cards is a React and TypeScript MVP for fast tabletop action cards. A user can flip a card, receive a validated randomized dice result, review recent rolls, and create reusable homebrew cards that are saved in the browser.

## Current MVP Definition of Done

A player can:

1. Open the responsive React website.
2. Choose a Player, DM, or Homebrew deck.
3. Flip a card and receive a randomized result.
4. See the individual dice, modifier, and final total.
5. Review the latest 25 rolls in the session log.
6. Create a custom card with a name, formula, icon, and description.
7. Receive a clear validation error for unsupported formulas.
8. Save custom cards in browser localStorage.
9. Refresh the page without losing saved custom cards.
10. Delete a saved custom card.

## Card Data Schema

```ts
type DiceCard = {
  id: string;
  name: string;
  category: CardCategory;
  formula: string;
  description: string;
  imageEmoji: string;
  critOn?: number;
  failOn?: number;
  isFavorite: boolean;
};
```

`HomebrewCardDraft` is the same structure without `id` or `category`. The application adds those values only after validation.

## State Ownership

- `App` owns the active page.
- `useHomebrewCards` owns custom-card state and localStorage persistence.
- `DeckGrid` owns active-card state, roll results, reset timing, and the session roll history.
- `rollDice.ts` owns formula parsing, limits, random rolling, and natural-roll evaluation.
- `homebrewStorage.ts` owns persisted-data validation and serialization.

## Dice Engine

Supported examples include:

- `1d20+8`
- `1d12+5`
- `10d6`
- `2d8+4`
- `2d6-1`

The parser rejects unsupported text, unsafe integers, more than 100 total dice, more than 100 dice in one term, dice larger than d1000, and formulas longer than 60 characters.

Natural 20 and natural 1 markers are opt-in card rules. They are enabled on attack cards and are not automatically applied to initiative, damage rolls, or arbitrary d20 checks.

## Rules Accuracy Guardrails

Starter player cards are examples and state their assumptions. DM cards are labeled as configurable prompts instead of official encounter, CR, monster, trap, or treasure rules.

Before adding a production library of official game actions, the schema must add an explicit ruleset field so 2014 and 2024 material cannot be mixed accidentally. Content should also record its source or be clearly labeled as homebrew.

## Local Setup

Node.js 22.12 or newer is required.

```bash
npm ci
npm run dev
```

## Verification

```bash
npm test
npm run build
npm run check
```

GitHub Actions runs the tests and production build for feature branches, pull requests, and `main`.

## Current Limitations

- Homebrew cards are stored only in the current browser and device.
- There is no account, backend, cloud synchronization, or import/export yet.
- Advantage, disadvantage, spell upcasting controls, favorites, and deck folders are not implemented yet.
- The session roll history resets when its deck page unmounts or the browser reloads.

## Next Build Steps

1. Add explicit 2014 and 2024 ruleset metadata.
2. Add deck folders: Player Deck, DM Deck, Monster Deck, and Favorites.
3. Add advantage and disadvantage rules.
4. Add spell upcast controls.
5. Add deck import and export.
6. Add component-level interaction tests.
7. Add backend authentication and database storage only after the browser MVP is validated.

## Architecture Rule

Keep source files under 150 lines where practical. Split components, data, styling, persistence, and rules logic before files become difficult to review.
