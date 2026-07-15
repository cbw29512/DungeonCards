# Dungeon Cards

Dungeon Cards is a React and TypeScript tabletop card engine that now combines the Player/DM rules-card system with the Monster Card Forge print-first monster system.

The unified product keeps SRD 5.1 (2014), SRD 5.2.1 (2024), and Homebrew content explicit and separate. Rules cards use uniform 5:7 poker-card layouts. Monster cards use the same 2.5 × 3.5 inch target while allowing complex creatures to expand into readable six-panel folios.

## Unified Play Experience

A user can:

1. Open separate Player, DM, and Monster workspaces.
2. Use **My Table** for Player/DM cards and **My Encounter** for selected monsters.
3. Open the matching Library to add or remove cards without deleting source data.
4. Pin and reorder active cards or monsters.
5. Restore Player, DM, and Monster selections independently after refresh.
6. Use separate Attack Roll, Saving Throw, Ability Check, Weapon Damage, Spell Damage, and Spell Healing cards.
7. Add optional Quick Roll cards that show an attack and potential damage as separate results.
8. Search monsters by name, CR, ruleset, and creature type.
9. Open standard monster references or expanded boss folios.
10. Print only the selected monster at exact card dimensions.
11. Build a Homebrew monster from a guided example with a live printable preview.

The current workspace owner is an anonymous local profile. Persistence is behind a `WorkspaceRepository` interface so authenticated cloud storage can replace local storage without rewriting the card UI.

## Split Roll Card Model

Dungeon Cards deliberately separates different roll types:

- **Attack Roll:** d20 attack only, including attack-only natural 20 and natural 1 handling.
- **Saving Throw:** one of six abilities, with optional Advantage or Disadvantage and no automatic natural outcome.
- **Ability Check:** one of six abilities using the complete selected modifier.
- **Weapon Damage:** normal and critical damage without a hidden attack roll.
- **Spell Damage or Healing:** scalable effect without a hidden attack roll.
- **Quick Roll:** attack and potential damage together as two independent results. Damage applies only when the attack hits.

Multi-attack spells such as Scorching Ray and Eldritch Blast remain split because one attack roll must not be presented as resolving every ray or beam.

## Current Rules Catalog

### Player cards

- Complete SRD 5.1 weapon table: 37 weapons.
- Complete SRD 5.2.1 weapon table: 38 weapons.
- 2014-only Net and 2024-only Musket and Pistol remain ruleset-specific.
- Damaging weapons provide separate Attack, Damage, and optional Quick Roll cards.
- Twenty-two audited spell families.
- Spell attacks and spell effects are separate cards.
- Eligible single-attack spells also provide optional Quick Roll cards.
- Blink, Chill Touch, Poison Spray, and other changed rules remain edition-specific.

### DM cards

- Standalone Saving Throw and Ability Check cards.
- 2014 trap damage severity.
- 2024 Hidden Pit and Poisoned Darts scaling.
- Sentient-item generators and crafting-material availability.
- Wand of Wonder, wand recharge, and last-charge checks.
- Armor of Resistance, Bag of Tricks, and Bag of Beans random tables.

Weapon coverage is complete for both selected SRDs. Spells and DM tools are expanded in audited batches rather than bulk-imported without verification.

## Monster Card Forge Integration

The private `cbw29512/monstercardforge` prototype remains intact as source history. Its reusable product ideas were ported into Dungeon Cards as native React/TypeScript features.

### Imported monster catalog

- Goblin — standard card
- Adult Black Dragon — boss folio
- Lich — spellcasting boss folio

All three imported catalog monsters are explicitly labeled as 2014 SRD samples. No 2024 monster stat blocks were invented merely to fill the filter.

### Monster workspace

- **My Encounter** contains only the monsters selected for current play.
- **Monster Library** retains the full imported catalog.
- Add/remove, pin, ordering, reset, and local persistence use the same workspace architecture as Player and DM cards.
- Filters include search, ruleset, and creature type.

### Monster layouts

- Simple creatures use compact poker-size reference cards.
- Complex, legendary, lair, and spellcasting creatures open into six-panel folios.
- Folios preserve defenses, awareness, traits, actions, bonus actions, reactions, legendary actions, lair actions, spells, source, and ruleset.
- Information expands into more panels instead of shrinking into unreadable text or being removed.

### Monster printing

- Printing a monster hides the rest of the application.
- Each panel prints at exactly 2.5 × 3.5 inches.
- Boss folios print as a 3 × 2 six-panel layout on letter-size paper.
- Print colors are preserved where supported by the browser and printer.

### Guided monster builder

- Starts from the complete Frost Troll example.
- Provides helper text and examples for identity, combat summary, ability scores, and primary attack fields.
- Updates the printable folio preview live.
- Saves the draft locally and restores it after refresh.
- Shows completeness warnings and supports reset-to-example.

## Core Schemas

```ts
type CardWorkspace = {
  schemaVersion: 1;
  id: string;
  ownerKey: string;
  name: string;
  role: "player" | "dm" | "monster";
  activeCardIds: string[];
  pinnedCardIds: string[];
  cardOrder: string[];
  updatedAt: string;
};
```

```ts
type MonsterCardData = {
  id: string;
  ruleset: "srd-5.1-2014" | "srd-5.2.1-2024" | "homebrew";
  source: string;
  name: string;
  cr: string;
  type: string;
  size: string;
  ac: string;
  hp: string;
  speed: string;
  abilities: Record<"str" | "dex" | "con" | "int" | "wis" | "cha", number>;
  traits: MonsterItem[];
  actions: MonsterItem[];
  legendaryActions: MonsterItem[];
  spellcasting: MonsterSpellcasting | null;
};
```

Workspaces store IDs rather than copies of official catalog data. Removing an item changes only workspace visibility.

## Guardrails

- SRD variants are source-referenced, read-only application data.
- Player, DM, and Monster workspaces are stored independently.
- Homebrew remains separate from SRD content.
- Natural 20 and natural 1 handling remains attack-only.
- Damage cards contain no hidden attack mode.
- Quick Roll damage remains labeled as potential and separate from the attack total.
- Critical damage doubles dice, not static modifiers.
- Complex monsters expand instead of dropping combat information.
- 2014 and 2024 content must never silently mix.

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
- Only one local Player, DM, and Monster workspace exists for each role.
- Card-specific selected modes and modifiers are not yet restored across sessions.
- The imported monster catalog currently contains the three audited 2014 samples from Monster Card Forge.
- The Monster Builder currently saves one active draft rather than a library of named Homebrew monsters.
- There is no deck import/export yet.
- The shared roll log resets when its page unmounts or the browser reloads.

## Next Expansion

1. Merge the split-card PR, then merge the Monster Card Forge integration PR.
2. Add multiple named characters, campaigns, encounters, and one-shots.
3. Select a production authentication and cloud-storage provider.
4. Add audited 2024 monster samples and expand both monster rulesets in verified batches.
5. Save multiple Homebrew monsters and move them into My Encounter.
6. Persist card selections, spell slots, modifiers, and encounter state per workspace.

## Attribution

See [ATTRIBUTION.md](ATTRIBUTION.md) for required SRD 5.1 and SRD 5.2.1 Creative Commons attribution statements.

## Architecture Rule

Keep handwritten source files under 150 lines where practical. Split components, data, styling, persistence, and rules logic before they become difficult to audit.