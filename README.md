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

- Complete SRD 5.1 weapon table: 37 weapons.
- Complete SRD 5.2.1 weapon table: 38 weapons.
- 2014-only Net and 2024-only Musket and Pistol remain ruleset-specific.
- Attack, damage, critical, versatile, and fixed-damage weapon behavior is modeled explicitly.
- Twenty-two audited spell families: Fireball, Cure Wounds, Healing Word, Fire Bolt, Magic Missile, Scorching Ray, Burning Hands, Thunderwave, Shatter, Lightning Bolt, Cone of Cold, Call Lightning, Moonbeam, Blight, Guiding Bolt, Hellish Rebuke, Blink, Chill Touch, Poison Spray, Ray of Frost, Sacred Flame, and Eldritch Blast.
- Spell slots, character level, attack bonus, and relevant alternate modes are selected on the card.
- Blink preserves its edition-specific random check: 2014 uses 1d20 and 2024 uses 1d6.
- Chill Touch preserves its 2014 ranged d8 version and 2024 Touch d10 version.
- Poison Spray preserves its 2014 Constitution-save version and 2024 ranged-attack version.
- Eldritch Blast provides separate attack and per-beam damage controls plus a convenience total when all beams hit.

### DM cards

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

- SRD variants are source-referenced, read-only application data.
- Homebrew cards are stored separately in browser localStorage.
- Natural 20 and natural 1 outcomes are limited to valid attack-roll formulas.
- Initiative, checks, damage, healing, and random tables do not gain attack-roll outcomes.
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

The parser rejects unsupported text, unsafe integers, more than 100 total dice, more than 100 dice in one term, dice larger than d1000, invalid keep rules, and formulas longer than 60 characters.

## State Ownership

- `App` owns navigation.
- `RulesDeck` owns search and shared rules-card history.
- `useRuleCardState` owns each card's ruleset, mode, choice, scaling, modifiers, Advantage state, and latest result.
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

- Non-weapon SRD content is expanded in audited batches rather than bulk-imported without verification.
- Homebrew still uses the original single-formula builder and has not adopted every multi-mode control.
- Homebrew remains local to the current browser and device.
- There is no account, cloud synchronization, deck import/export, or print-sheet generator yet.
- The table log resets when its page unmounts or the browser reloads.

## Next Audited Expansion

1. Add multi-target spells and spells whose scaling changes target count instead of dice.
2. Add more SRD random magic items, recharge tables, traps, and encounter-facing tools.
3. Migrate Homebrew to the multi-mode schema with explicit ruleset and source badges.
4. Add component-level interaction and visual-regression tests.
5. Add print sheets sized for 2.5 × 3.5 inch poker cards.

## Attribution

See [ATTRIBUTION.md](ATTRIBUTION.md) for the required SRD 5.1 and SRD 5.2.1 Creative Commons attribution statements.

## Architecture Rule

Keep handwritten source files under 150 lines where practical. Split components, data, styling, persistence, and rules logic before they become difficult to audit.