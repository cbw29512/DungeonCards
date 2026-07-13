# Dungeon Cards

Dungeon Cards is a React and TypeScript tabletop card engine. Player and DM cards use a uniform 5:7 poker-card shape, place their controls directly on the card, and keep SRD 5.1 (2014) and SRD 5.2.1 (2024) mechanics separate.

## Current Play Experience

A Player or DM can:

1. Open a separate Player or DM workspace.
2. Use **My Table** to see only the cards selected for current play.
3. Open **Library** to search every available card for that role.
4. Add or remove cards without deleting or changing official card data.
5. Pin and reorder cards within the active table.
6. Restore Player and DM selections independently after refreshing.
7. Use separate Attack Roll, Saving Throw, Ability Check, Weapon Damage, Spell Damage, and Spell Healing cards.
8. Add optional Quick Roll cards that show an attack and its potential damage as two separate results.
9. Select 2014 or 2024 rules, modifiers, spell slots, character levels, and Advantage directly on a card.
10. Resolve random tables and review recent results in the shared roll log.

The current workspace owner is an anonymous local profile. Workspace persistence is behind a `WorkspaceRepository` interface so authenticated cloud persistence can replace local storage without rewriting the card UI.

## Split Roll Card Model

Dungeon Cards deliberately separates different D&D roll types:

- **Attack Roll:** rolls the d20 attack only and applies attack-only natural 20 and natural 1 behavior.
- **Saving Throw:** chooses one of the six abilities, supports Advantage or Disadvantage, and never treats a natural 20 or 1 as automatic unless another rule says so.
- **Ability Check:** chooses one of the six abilities and accepts the full check modifier, including proficiency or Expertise.
- **Weapon Damage:** contains normal and critical damage without a hidden attack roll.
- **Spell Damage or Healing:** contains the scalable effect without a hidden attack roll.
- **Quick Roll:** rolls an attack and potential damage together but displays two independent results. Potential damage applies only if the attack hits.

Multi-attack spells such as Scorching Ray and Eldritch Blast remain split because one attack roll must not be presented as resolving every ray or beam.

## Current Audited Catalog

### Player cards

- Complete SRD 5.1 weapon table: 37 weapons.
- Complete SRD 5.2.1 weapon table: 38 weapons.
- 2014-only Net and 2024-only Musket and Pistol remain ruleset-specific.
- Damaging weapons provide separate Attack, Damage, and Quick Roll cards.
- Existing saved weapon IDs continue to point to Quick Roll cards so local tables remain usable.
- Twenty-two audited spell families: Fireball, Cure Wounds, Healing Word, Fire Bolt, Magic Missile, Scorching Ray, Burning Hands, Thunderwave, Shatter, Lightning Bolt, Cone of Cold, Call Lightning, Moonbeam, Blight, Guiding Bolt, Hellish Rebuke, Blink, Chill Touch, Poison Spray, Ray of Frost, Sacred Flame, and Eldritch Blast.
- Spell attacks and spell effects are separate cards.
- Eligible single-attack spells also provide an optional Quick Roll card.
- Blink preserves its edition-specific random check: 2014 uses 1d20 and 2024 uses 1d6.
- Chill Touch preserves its 2014 ranged d8 version and 2024 Touch d10 version.
- Poison Spray preserves its 2014 Constitution-save version and 2024 ranged-attack version.

### DM cards

- Standalone Saving Throw and Ability Check cards.
- 2014 trap damage severity by party tier and severity.
- 2024 Hidden Pit and Poisoned Darts scaling.
- Sentient-item ability scores, alignment, communication, senses, and purpose.
- Magic-item raw-material availability.
- Wand recharge and last-charge destruction checks.
- SRD 5.2.1 Wand of Wonder d100 effect table.
- Armor of Resistance random damage type for both SRDs.
- Bag of Tricks with selectable Gray, Rust, and Tan d8 creature tables.
- Bag of Beans with separate 2014 and 2024 d100 effects and dump-damage modes.

Weapon coverage is complete for both selected SRDs. The spell and DM sets are audited expansion batches, not a claim that every SRD spell, trap, or magic item has already been imported.

## Rules Card Schema

```ts
type RuleCard = {
  id: string;
  name: string;
  kind:
    | "attack"
    | "saving-throw"
    | "ability-check"
    | "weapon-damage"
    | "spell-damage"
    | "spell-healing"
    | "quick-roll"
    | "spell"
    | "trap"
    | "magic-item"
    | "dm-table";
  imageEmoji: string;
  variants: Partial<Record<RulesetId, RuleCardVariant>>;
};
```

A Quick Roll mode can contain a secondary roll definition. The engine resolves and records the primary attack and secondary potential damage independently.

## Workspace Schema

```ts
type CardWorkspace = {
  schemaVersion: 1;
  id: string;
  ownerKey: string;
  name: string;
  role: "player" | "dm";
  activeCardIds: string[];
  pinnedCardIds: string[];
  cardOrder: string[];
  updatedAt: string;
};
```

Workspaces store card IDs rather than copies of official cards. Removing a card from My Table changes only workspace visibility.

## Rules Guardrails

- SRD variants are source-referenced, read-only application data.
- Player and DM workspace selections are stored independently.
- Homebrew cards remain separate from SRD cards.
- Natural 20 and natural 1 outcomes are limited to valid attack-roll formulas.
- Saving throws, checks, damage, healing, and random tables do not gain attack-roll outcomes.
- Damage cards contain no hidden attack mode.
- Quick Roll damage is labeled as potential and remains separate from the attack total.
- Critical-damage modes double damage dice, not static modifiers.
- Fixed weapon damage stays fixed on a critical hit because there are no damage dice to double.
- Advantage and Disadvantage roll two d20s and keep the appropriate die.
- 2014 and 2024 variants are regression-tested for separation.

## Dice Engine

Supported examples include:

- `1d20+8`
- `10d6`
- `2d8+4`
- `2d6-1`
- `4d6kh3` — roll four d6 and keep the highest three
- `2d20kl1` — roll two d20 and keep the lowest one
- `1+3` — fixed damage plus a modifier

Production rolls use `crypto.getRandomValues` with rejection sampling. Tests inject deterministic integer sources so mechanics can be verified without weakening production randomness.

## State Ownership

- `App` owns top-level navigation.
- `RulesDeck` owns My Table/Library view, search, and shared roll history.
- `useCardWorkspace` owns active cards, pins, ordering, reset, and repository persistence.
- `WorkspaceRepository` is the boundary between the UI and local or future cloud storage.
- `useRuleCardState` owns each card's ruleset, mode, choices, scaling, primary and secondary modifiers, Advantage state, and latest result.
- `rollDice.ts` owns validated rolling, kept dice, fixed results, and attack-roll outcomes.
- `useHomebrewCards` owns separately persisted custom cards.

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

GitHub Actions runs dependency installation, a high-severity audit, unit and catalog regression tests, strict TypeScript compilation, and the Vite production build.

## Current Limitations

- There is no production login or cloud synchronization yet.
- Only one local Player workspace and one local DM workspace exist.
- Card-specific selected modes and modifiers are not yet restored across sessions.
- Non-weapon SRD content is expanded in audited batches rather than bulk-imported without verification.
- Homebrew still uses the original single-formula builder.
- There is no deck import/export or print-sheet generator yet.
- The roll log resets when its page unmounts or the browser reloads.

## Next Expansion

1. Add multiple named Player and DM workspaces.
2. Select a production authentication and cloud-storage provider.
3. Persist each card's selected ruleset, mode, slot, level, and modifiers per workspace.
4. Add more spells, random magic items, traps, and encounter-facing tools.
5. Add print sheets sized for 2.5 × 3.5 inch poker cards.

## Attribution

See [ATTRIBUTION.md](ATTRIBUTION.md) for the required SRD 5.1 and SRD 5.2.1 Creative Commons attribution statements.

## Architecture Rule

Keep handwritten source files under 150 lines where practical. Split components, data, styling, persistence, and rules logic before they become difficult to audit.