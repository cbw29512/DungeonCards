# Dungeon Cards

Dungeon Cards is a React and TypeScript tabletop card engine. Player and DM cards use a uniform 5:7 poker-card shape, place their controls directly on the card, and keep SRD 5.1 (2014) and SRD 5.2.1 (2024) mechanics separate.

## Rules-First Definition of Done

A user can:

1. Open responsive Player, DM, and Homebrew decks.
2. Use compact cards with the same 5:7 aspect ratio.
3. Select 2014 or 2024 on a card when both variants exist.
4. Select attack, damage, critical, spell, trap, or table modes on the card.
5. Adjust attack bonuses, damage modifiers, spell slots, and character level on the card.
6. Roll normally, with Advantage, or with Disadvantage when a d20 mode permits it.
7. Scale spells from their documented base level through level 9.
8. Resolve random tables and see the matching result on the flipped card.
9. Review recent results in a shared table log.
10. Create separately labeled Homebrew cards without modifying SRD data.

## Current Audited Catalog

### Player cards

- The complete SRD 5.1 weapon table: 37 weapons.
- The complete SRD 5.2.1 weapon table: 38 weapons.
- 2014-only Net behavior and 2024-only Musket and Pistol variants remain ruleset-specific.
- Weapon cards include attack, damage, and critical-damage modes when the weapon has a damage roll.
- Versatile weapons select one-handed or two-handed damage directly on the card.
- 2024 weapon variants display one of the eight SRD mastery properties; 2014 variants do not.
- Blowgun uses fixed damage plus the selected modifier instead of fake dice.
- Spells: Fireball, Cure Wounds, Healing Word, Fire Bolt, Magic Missile, and Scorching Ray.
- Slot-scaled spells calculate their formula from the selected spell-slot level.
- Cantrips calculate their formula from the selected character level.

### DM cards

- 2014 trap damage severity by party tier and severity.
- 2024 Hidden Pit and Poisoned Darts scaling.
- Sentient-item ability scores, alignment, communication, senses, and purpose.
- Magic-item raw-material availability.
- Wand recharge and last-charge destruction checks.
- The SRD 5.2.1 Wand of Wonder d100 effect table.

Weapon coverage is complete for both selected SRDs. Spells, traps, and magic items are still being expanded in audited batches so rule differences are verified rather than bulk-imported blindly.

## Rules Card Schema

```ts
type RuleCard = {
  id: string;
  name: string;
  kind: "weapon" | "spell" | "trap" | "magic-item" | "dm-table";
  imageEmoji: string;
  variants: Partial<Record<RulesetId, RuleCardVariant>>;
};

type RuleCardVariant = {
  ruleset: "srd-5.1-2014" | "srd-5.2.1-2024";
  source: "srd" | "homebrew";
  sourceReference: string;
  summary: string;
  detail: string;
  tags: string[];
  modes: RuleRollMode[];
};
```

Each card family can contain independent 2014 and 2024 variants. Selecting a ruleset loads that variant rather than mutating or blending SRD content.

## Rules Guardrails

- SRD variants are stored as source-referenced, read-only application data.
- Homebrew cards are stored separately in browser localStorage.
- Natural 20 and natural 1 outcomes are available only for a formula containing exactly one positive d20 plus an optional static modifier.
- Initiative, ability checks, damage, healing, and random tables do not automatically gain attack-roll outcomes.
- Critical-damage modes double weapon damage dice rather than doubling static modifiers.
- Fixed weapon damage remains fixed on a critical hit because there are no damage dice to double.
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

The parser rejects unsupported text, unsafe integers, more than 100 total dice, more than 100 dice in one term, dice larger than d1000, invalid keep rules, and formulas longer than 60 characters.

## State Ownership

- `App` owns navigation.
- `RulesDeck` owns search and the shared rules-card history.
- `useRuleCardState` owns one card's selected ruleset, mode, option, scaling, modifiers, Advantage state, and latest result.
- `ruleCardFormula.ts` owns spell scaling, formula choices, and table-range resolution.
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

- The non-weapon SRD catalog is intentionally being expanded in audited batches rather than bulk-imported without verification.
- Homebrew cards use the original single-formula builder and have not yet adopted every multi-mode rules-card control.
- Homebrew remains local to the current browser and device.
- There is no account, cloud synchronization, deck import/export, or print-sheet generator yet.
- The table log resets when its page unmounts or the browser reloads.

## Next Audited Expansion

1. Expand scalable spells by spell level, including save, attack, healing, and multi-projectile behaviors.
2. Add more SRD random magic items, recharge tables, traps, and encounter-facing tools.
3. Migrate Homebrew to the multi-mode card schema with explicit ruleset and source badges.
4. Add component-level interaction and visual-regression tests.
5. Add print sheets sized for 2.5 × 3.5 inch poker cards.

## Attribution

See [ATTRIBUTION.md](ATTRIBUTION.md) for the required SRD 5.1 and SRD 5.2.1 Creative Commons attribution statements.

## Architecture Rule

Keep handwritten source files under 150 lines where practical. Split components, data, styling, persistence, and rules logic before they become difficult to audit.