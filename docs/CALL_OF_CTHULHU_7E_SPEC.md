# Call of Cthulhu 7th Edition System Specification

Status: Design proposal  
Linked epic: #7  
Design branch: `design/call-of-cthulhu-7e-spec`  
Last updated: 2026-07-14

## 1. Vision

Add a complete Call of Cthulhu 7th Edition play environment to Dungeon Cards.

The system must do more than summarize rules. It must help Investigators and Keepers run actual sessions through interactive percentile rolls, rule cards, combat-ready creature and NPC cards, weapon cards, spell and ritual cards, encounter tracking, private campaign content, and printable table references.

The Call of Cthulhu experience must feel clearly different from the Dungeons & Dragons experience:

- darker;
- more sinister;
- more investigative;
- more fragile and dangerous;
- more focused on uncertainty, consequences, Sanity, and incomplete knowledge.

The goal is not to replace the official books. The goal is to reduce rulebook interruption during play by turning frequently used procedures into concise, source-traceable, original cards and guided interactions.

## 2. Product Principles

1. **Combat ready, not merely readable.** Creature, NPC, weapon, and spell cards must support actual play from the card.
2. **System isolation.** D&D and Call of Cthulhu rules, history, workspaces, persistence, and visual effects must not leak into each other.
3. **Original summaries.** Public cards must use original concise language rather than reproducing protected rulebook text.
4. **Source traceability.** Every rules implementation must record the official source used for verification.
5. **Keeper control.** Keeper-only information must remain private and clearly separated from player-safe information.
6. **Card-first design.** Small procedures belong on cards; longer procedures become linked card sequences, guided flows, or expandable folios.
7. **State-first architecture.** Rules data, card data, runtime encounter state, and presentation must remain separate.
8. **Accessible dread.** The visual experience may be disturbing and atmospheric without relying on inaccessible flashing, illegible text, or excessive motion.
9. **Local-first privacy.** Custom scenarios, clues, NPCs, monsters, spells, and notes remain local unless the user explicitly exports them.
10. **Testable randomness.** All percentile and damage rolls must accept deterministic random sources for automated tests.

## 3. Scope

### Included

- top-level game-system selection;
- Call of Cthulhu Investigator workspace;
- Call of Cthulhu Keeper workspace;
- percentile dice engine;
- success-level resolution;
- Bonus and Penalty dice;
- Pushed rolls;
- Luck rolls and permitted Luck spending support;
- combat procedures;
- Sanity procedures;
- healing and injury procedures;
- chase procedures;
- character-development procedures;
- combat-ready creature and NPC cards;
- weapon cards;
- spell, ritual, and Mythos-power cards;
- Keeper encounter workspace;
- builders for private custom content;
- print-ready cards and encounter sheets;
- source and licensing metadata;
- original visual identity.

### Not included in the initial implementation

- reproducing official scenarios;
- reproducing official artwork or logos;
- reproducing full official spell descriptions;
- reproducing full official creature statistics without permission;
- reproducing official insanity-result tables;
- cloud accounts or shared online campaigns;
- automated rules adjudication for every narrative edge case;
- replacing Keeper judgment;
- mixing Call of Cthulhu cards into D&D workspaces.

## 4. Definition of Done

### 4.1 Phase 1 — Playable Quick-Start Deck

Phase 1 is complete when:

- [ ] A top-level system selector switches between D&D and Call of Cthulhu.
- [ ] Call of Cthulhu has independent Investigator and Keeper workspaces.
- [ ] The percentile engine supports ordinary, Bonus-die, and Penalty-die rolls.
- [ ] The engine resolves Critical, Extreme, Hard, Regular, Failure, and Fumble outcomes from structured rules data.
- [ ] Difficulty selection can compare the rolled success level with the required success level.
- [ ] Pushed-roll guidance and consequence acknowledgement work.
- [ ] Luck rolls and the supported Luck-spending flow work.
- [ ] Basic combat, damage, healing, and Sanity procedures have interactive cards.
- [ ] At least one custom weapon card and one custom creature card can be created and used.
- [ ] All Call of Cthulhu local-storage keys are namespaced separately from D&D.
- [ ] Unit tests cover percentile boundaries and Bonus/Penalty dice.
- [ ] Desktop, narrow viewport, keyboard, screen-reader, and reduced-motion checks pass.
- [ ] Public content passes an initial licensing and trademark review.

### 4.2 Phase 2 — Complete Combat-Ready System

Phase 2 is complete when:

- [ ] Weapons are a first-class searchable catalog.
- [ ] Weapon cards resolve attacks, success levels, damage, impaling, range, ammunition, reloads, and malfunctions.
- [ ] Compact creature cards support ordinary NPCs and simple threats.
- [ ] Expanded creature cards support several attacks, powers, or defenses.
- [ ] Keeper folios support complex Mythos entities, villains, and spellcasters.
- [ ] Creature cards expose all commonly needed combat values without opening another screen.
- [ ] Keeper encounters support multiple independent instances of the same library entry.
- [ ] Encounters track HP, Magic Points, ammunition, conditions, temporary modifiers, and defeated state.
- [ ] Attacks, damage, Dodge, opposed actions, Sanity loss, and powers can be rolled from an encounter.
- [ ] Creature, NPC, and weapon builders validate required values and formulas.
- [ ] Encounter state survives refresh and remains isolated from D&D encounters.
- [ ] Printable creature cards, folios, weapons, and encounter sheets pass print-preview acceptance.

### 4.3 Phase 3 — Complete Core Reference

Phase 3 is complete when:

- [ ] Complete Sanity and insanity procedures are represented through cards or guided sequences.
- [ ] Major Wounds, unconsciousness, dying, First Aid, Medicine, and recovery are covered.
- [ ] Chase procedures are covered through linked cards or a guided chase workspace.
- [ ] Character-development and skill-improvement procedures are covered.
- [ ] Spell, ritual, and Mythos-power cards are first-class interactive entities.
- [ ] Spell casting can track costs, required rolls, opposed rolls, duration, and active effects.
- [ ] Keeper-only and player-safe spell information are separated.
- [ ] Full regression tests cover Sanity formulas, spell costs, chases, and recovery state.

### 4.4 Phase 4 — Campaign Tools

Phase 4 is complete when:

- [ ] Investigator profiles can generate personal skill-action cards.
- [ ] Private custom weapon, spell, ritual, creature, NPC, clue, handout, and location builders exist.
- [ ] Scenario-specific decks can be created and favorited.
- [ ] Private Keeper notes and player-safe handouts are separated.
- [ ] Data can be exported and imported using a versioned format.
- [ ] Print-ready campaign decks pass browser and print acceptance.

## 5. Information Architecture

The application should expose a system-first hierarchy.

```text
Dungeon Cards
├── Dungeons & Dragons 5e
│   ├── Player
│   ├── DM
│   ├── Monsters
│   └── Builders
└── Call of Cthulhu 7e
    ├── Investigator
    ├── Keeper
    ├── Rules
    ├── Weapons
    ├── Spells & Rituals
    ├── Creatures & NPCs
    ├── Encounters
    └── Builders
```

### 5.1 Investigator workspace

The Investigator workspace contains:

- personal skill cards;
- characteristic-roll cards;
- equipped weapon cards;
- learned or accessible spell cards where appropriate;
- Sanity and Luck tracking;
- Hit Points and Magic Points;
- current conditions and temporary effects;
- roll history;
- favorites;
- player-safe rules references.

### 5.2 Keeper workspace

The Keeper workspace contains:

- Keeper rules cards;
- hidden rules notes;
- creatures and NPCs;
- encounters;
- private spells and rituals;
- scenario cards;
- clue and handout management;
- custom tables;
- hidden roll and consequence tools;
- printable references.

## 6. Core Domain Boundaries

### 6.1 Game-system identity

```ts
export type GameSystemId =
  | "dnd-5e"
  | "call-of-cthulhu-7e";
```

Every persisted workspace, card, roll-history entry, builder draft, and encounter must include or be namespaced by `gameSystemId`.

### 6.2 Content source

```ts
export type ContentSourceKind =
  | "public-original-summary"
  | "user-created-private"
  | "licensed"
  | "reference-only";

export type SourceReference = {
  kind: ContentSourceKind;
  title: string;
  edition?: string;
  section?: string;
  page?: number;
  publicDistributionAllowed: boolean;
  notes?: string;
};
```

`page` and `section` are internal verification metadata. They are not a license to reproduce protected text.

## 7. Percentile Engine

The percentile engine must be independent from the D&D dice engine.

### 7.1 Physical percentile representation

A percentile roll uses:

- one units die;
- one or more tens dice;
- a normalized result from 1 through 100;
- Bonus or Penalty selection rules;
- the same units die for every candidate tens die.

```ts
export type PercentileMode =
  | "normal"
  | "bonus-1"
  | "bonus-2"
  | "penalty-1"
  | "penalty-2";

export type PercentileDice = {
  units: number;
  tensCandidates: number[];
  selectedTens: number;
  normalizedResult: number;
};
```

### 7.2 Success levels

```ts
export type CocSuccessLevel =
  | "critical"
  | "extreme"
  | "hard"
  | "regular"
  | "failure"
  | "fumble";

export type CocDifficulty =
  | "regular"
  | "hard"
  | "extreme";
```

The exact Critical and Fumble boundaries must be represented by verified rules functions rather than scattered component conditions.

```ts
export type CocSkillThresholds = {
  full: number;
  half: number;
  fifth: number;
};

export type CocPercentileRollResult = {
  skillValue: number;
  difficulty: CocDifficulty;
  mode: PercentileMode;
  dice: PercentileDice;
  thresholds: CocSkillThresholds;
  successLevel: CocSuccessLevel;
  meetsDifficulty: boolean;
  canBePushed: boolean;
  luckSpendNeeded?: number;
};
```

### 7.3 Engine rules

- A roll must never silently clamp an invalid skill value.
- Invalid values produce a logged, user-safe error.
- Bonus and Penalty dice must use one shared units die.
- The engine must expose every tens candidate for transparency.
- Randomness must be injectable for deterministic tests.
- Success-level calculations must be centralized.
- Attack, skill, Sanity, Luck, opposed, and improvement rolls must use explicit roll contexts.

```ts
export type CocRollContext =
  | "skill"
  | "characteristic"
  | "attack"
  | "dodge"
  | "sanity"
  | "luck"
  | "improvement"
  | "opposed";
```

## 8. Rules-Card Schema

```ts
export type CocRuleCardKind =
  | "skill-roll"
  | "difficulty"
  | "bonus-penalty"
  | "pushed-roll"
  | "opposed-roll"
  | "luck"
  | "combat"
  | "injury"
  | "healing"
  | "sanity"
  | "insanity"
  | "chase"
  | "development"
  | "keeper-guidance";

export type CocRuleCard = {
  id: string;
  gameSystemId: "call-of-cthulhu-7e";
  kind: CocRuleCardKind;
  title: string;
  summary: string;
  steps?: string[];
  reminders?: string[];
  warnings?: string[];
  source: SourceReference;
  audience: "investigator" | "keeper" | "both";
  tags: string[];
};
```

Long procedures should reference linked cards rather than shrinking the text until it becomes unreadable.

## 9. Combat-Ready Creature and NPC Schema

### 9.1 Library entity

```ts
export type CocCharacteristicId =
  | "str"
  | "con"
  | "siz"
  | "dex"
  | "int"
  | "pow"
  | "app"
  | "edu";

export type CocCharacteristics = Partial<Record<CocCharacteristicId, number>>;

export type CocDerivedStats = {
  hitPoints: number;
  magicPoints?: number;
  sanity?: number;
  move: number;
  build: number;
  damageBonus: string;
  armor?: string;
};

export type CocCreatureCategory =
  | "human"
  | "cultist"
  | "animal"
  | "mythos-creature"
  | "mythos-entity"
  | "undead"
  | "construct"
  | "other";

export type CocCreatureCardData = {
  id: string;
  gameSystemId: "call-of-cthulhu-7e";
  name: string;
  category: CocCreatureCategory;
  era?: string;
  source: SourceReference;
  layout: "compact" | "expanded" | "folio" | "auto";
  characteristics: CocCharacteristics;
  derived: CocDerivedStats;
  skills: CocSkillReference[];
  attacks: CocAttack[];
  traits: CocFeature[];
  powers: CocPower[];
  spells: CocSpellReference[];
  sanityLoss?: CocSanityLoss;
  vulnerabilities: string[];
  resistances: string[];
  immunities: string[];
  keeperNotes?: string;
  tactics?: string[];
  tags: string[];
};
```

### 9.2 Skills

```ts
export type CocSkillReference = {
  id: string;
  name: string;
  percentage: number;
  category?: "combat" | "perception" | "social" | "movement" | "other";
};
```

### 9.3 Attacks

```ts
export type CocAttack = {
  id: string;
  name: string;
  skillName: string;
  skillPercentage: number;
  damageFormula: string;
  addsDamageBonus: boolean;
  impaling: boolean;
  attacksPerRound?: number;
  range?: string;
  ammunition?: CocAmmunitionProfile;
  malfunction?: number;
  canFightBack?: boolean;
  canBeDodged?: boolean;
  specialProcedure?: string[];
  notes?: string;
};
```

### 9.4 Features and powers

```ts
export type CocFeature = {
  id: string;
  name: string;
  summary: string;
  trigger?: string;
  mechanicalEffect?: string;
};

export type CocPower = {
  id: string;
  name: string;
  summary: string;
  activation?: string;
  cost?: CocResourceCost[];
  roll?: CocRollRequirement;
  duration?: string;
  target?: string;
  tracking?: "none" | "duration" | "concentration" | "recurring-cost";
};
```

### 9.5 Sanity-loss profile

```ts
export type CocSanityLoss = {
  successFormula: string;
  failureFormula: string;
  trigger: string;
};
```

## 10. Creature Card Layouts

### 10.1 Compact card

Use for:

- ordinary people;
- cultists;
- animals;
- simple threats;
- minor creatures with few actions.

Required visible information:

- name and category;
- HP, Move, Build, armor;
- Dodge;
- main attacks;
- damage;
- Sanity loss where applicable;
- one or two essential traits.

### 10.2 Expanded combat card

Use for:

- several attacks;
- multiple defenses;
- regeneration;
- environmental effects;
- several powers;
- complicated damage procedures.

### 10.3 Keeper folio

Use for:

- major villains;
- Mythos entities;
- spellcasters;
- creatures with many powers;
- multi-stage encounters.

Suggested panels:

1. Identity and defenses
2. Characteristics and skills
3. Attacks and damage
4. Powers and traits
5. Spells, costs, and opposed rolls
6. Sanity effects, tactics, and tracked resources

## 11. Encounter Runtime Schema

Library data must remain immutable during play. Encounters create runtime instances.

```ts
export type CocEncounterInstance = {
  id: string;
  sourceCardId: string;
  displayName: string;
  currentHitPoints: number;
  currentMagicPoints?: number;
  ammunition: Record<string, number>;
  conditions: CocConditionInstance[];
  temporaryModifiers: CocTemporaryModifier[];
  notes: string;
  pinned: boolean;
  defeated: boolean;
  sortOrder: number;
};

export type CocEncounter = {
  id: string;
  gameSystemId: "call-of-cthulhu-7e";
  name: string;
  createdAt: string;
  updatedAt: string;
  instances: CocEncounterInstance[];
  keeperNotes: string;
};
```

### 11.1 Encounter requirements

- The same creature can appear several times with separate HP and conditions.
- Renaming an instance must not alter the library entry.
- Removing an instance must not delete the library entry.
- Attack and damage history should identify the acting instance.
- Resource changes must be explicit and reversible where practical.
- Persistence failures must be logged and surfaced safely.
- Encounter storage must be versioned.

## 12. Weapon Schema

```ts
export type CocWeaponCategory =
  | "unarmed"
  | "melee"
  | "handgun"
  | "rifle"
  | "shotgun"
  | "submachine-gun"
  | "machine-gun"
  | "explosive"
  | "other";

export type CocAmmunitionProfile = {
  capacity: number;
  reloadUnits?: number;
  ammunitionType?: string;
};

export type CocWeaponCardData = {
  id: string;
  gameSystemId: "call-of-cthulhu-7e";
  name: string;
  category: CocWeaponCategory;
  source: SourceReference;
  skillName: string;
  damageFormula: string;
  addsDamageBonus: boolean;
  impaling: boolean;
  baseRange?: string;
  attacksPerRound?: number | string;
  ammunition?: CocAmmunitionProfile;
  malfunction?: number;
  automaticFire?: CocAutomaticFireProfile;
  concealment?: string;
  era?: string;
  availability?: string;
  cost?: string;
  notes?: string[];
};
```

### 12.1 Weapon interaction requirements

- supply or select the acting skill percentage;
- select ordinary, Bonus, or Penalty roll;
- show all percentile dice candidates;
- resolve success level;
- identify whether malfunction occurred;
- roll ordinary damage;
- resolve verified Extreme and impaling damage rules;
- apply Damage Bonus only when allowed;
- decrement ammunition only through an explicit action;
- prevent negative ammunition;
- prompt for reload when required;
- keep catalog definitions separate from equipped runtime instances.

## 13. Spell, Ritual, and Mythos-Power Schema

```ts
export type CocResourceKind =
  | "magic-points"
  | "sanity"
  | "luck"
  | "hit-points"
  | "pow"
  | "other";

export type CocResourceCost = {
  kind: CocResourceKind;
  formula?: string;
  fixedAmount?: number;
  timing: "on-cast" | "on-success" | "recurring" | "other";
};

export type CocRollRequirement = {
  type: "skill" | "characteristic" | "opposed" | "none";
  name?: string;
  difficulty?: CocDifficulty;
  notes?: string;
};

export type CocSpellCardData = {
  id: string;
  gameSystemId: "call-of-cthulhu-7e";
  name: string;
  source: SourceReference;
  visibility: "investigator-safe" | "keeper-only" | "split";
  summary: string;
  castingTime: string;
  costs: CocResourceCost[];
  roll: CocRollRequirement;
  range?: string;
  duration?: string;
  target?: string;
  area?: string;
  resistance?: string;
  maintenance?: string;
  playerText?: string;
  keeperText?: string;
  tracking?: "none" | "duration" | "concentration" | "recurring-cost";
  tags: string[];
};
```

### 13.1 Spell interaction requirements

- show player-safe information without exposing Keeper-only consequences;
- guide casting in explicit steps;
- confirm resource spending before mutation;
- support opposed characteristic rolls;
- track duration and recurring costs;
- record active effects;
- allow custom private spells and rituals;
- never ship protected official spell wording without permission.

## 14. Investigator Schema

```ts
export type CocInvestigator = {
  id: string;
  gameSystemId: "call-of-cthulhu-7e";
  name: string;
  occupation?: string;
  era?: string;
  characteristics: CocCharacteristics;
  skills: CocSkillReference[];
  maximumHitPoints: number;
  currentHitPoints: number;
  maximumMagicPoints: number;
  currentMagicPoints: number;
  currentSanity: number;
  currentLuck: number;
  damageBonus: string;
  build: number;
  move: number;
  equippedWeaponIds: string[];
  spellIds: string[];
  conditions: CocConditionInstance[];
  notes: string;
};
```

Derived values must come from centralized, tested rule functions rather than duplicated form logic.

## 15. Conditions and Temporary Effects

```ts
export type CocConditionKind =
  | "major-wound"
  | "unconscious"
  | "dying"
  | "temporary-insanity"
  | "indefinite-insanity"
  | "bout-of-madness"
  | "restrained"
  | "prone"
  | "custom";

export type CocConditionInstance = {
  id: string;
  kind: CocConditionKind;
  label: string;
  startedAt: string;
  duration?: string;
  notes?: string;
};

export type CocTemporaryModifier = {
  id: string;
  label: string;
  bonusDice: number;
  penaltyDice: number;
  appliesTo?: string[];
  expiresAfter?: string;
};
```

## 16. Persistence Boundaries

Suggested storage namespaces:

```text
dungeon-cards.system-selection.v1
dungeon-cards.coc7e.investigator-workspace.v1
dungeon-cards.coc7e.keeper-workspace.v1
dungeon-cards.coc7e.roll-history.v1
dungeon-cards.coc7e.custom-weapons.v1
dungeon-cards.coc7e.custom-spells.v1
dungeon-cards.coc7e.custom-creatures.v1
dungeon-cards.coc7e.custom-npcs.v1
dungeon-cards.coc7e.encounters.v1
dungeon-cards.coc7e.builder-drafts.v1
```

Requirements:

- strict schema validation on load;
- bounded collection sizes;
- unique IDs;
- safe fallback on malformed JSON;
- initialization errors must not be immediately overwritten;
- migrations for future schema versions;
- explicit export format version;
- no Call of Cthulhu data in D&D storage keys.

## 17. Visual System

### 17.1 Tone

The Call of Cthulhu interface must be darker and more sinister than the D&D interface.

It should feel like:

- a classified investigation;
- a damaged police file;
- an evidence board assembled too late;
- an occult manuscript that should not have been opened;
- field notes written by someone becoming increasingly unreliable.

It must not feel like:

- heroic fantasy;
- a Halloween novelty;
- a modern neon horror game;
- a direct imitation of Chaosium trade dress;
- unreadable decorative clutter.

### 17.2 Color roles

Suggested semantic palette:

- **Void charcoal:** primary background
- **Aged bone:** readable card paper
- **Sickly green:** revelation, Mythos influence, Critical success
- **Dried blood:** danger, Fumble, injury, Sanity crisis
- **Tarnished brass:** controls, borders, evidence labels
- **Ink black:** Keeper-only information, redaction, hidden content
- **Bruised violet:** occult effects and active spells

Exact color values must pass contrast testing.

### 17.3 Surface language

Permitted motifs:

- torn paper edges;
- ink bleed;
- fingerprints;
- evidence stamps;
- redaction bars;
- typewritten headings;
- handwritten annotations;
- faded diagrams;
- paper clips and case labels;
- subtle stains and abrasion.

These motifs should be generated with CSS or original assets, not copied artwork.

### 17.4 Card identities

- **Investigator rules:** aged case notes and pocket references.
- **Keeper rules:** darker classified files with redacted regions.
- **Weapons:** evidence tags, armory records, or period catalog cards.
- **Spells:** damaged ritual fragments or annotated occult manuscripts.
- **Creatures:** forbidden field reports and classified biological dossiers.
- **NPCs:** police files, witness statements, or surveillance reports.
- **Encounters:** evidence-board or operation-folder workspace.

### 17.5 Outcome effects

#### Critical success

- uncanny green-gold illumination;
- precise, unnaturally clear typography;
- brief revelation motif;
- optional eye, geometry, or evidence-line motif using original abstract graphics;
- no heroic explosion styling.

#### Fumble

- ink-black spread;
- dried-blood red impact;
- subtle card distortion or misregistration;
- omen-like typography;
- no automatic invented narrative punishment.

#### Sanity loss

- subtle vignette and focus narrowing;
- paper edges shifting slightly;
- temporary text misalignment or redaction movement;
- restrained audio-ready architecture without shipping audio initially;
- must respect `prefers-reduced-motion`;
- no rapid flashes.

### 17.6 Accessibility

- text remains readable over every texture;
- decorative distress never obscures essential numbers;
- outcome meaning is conveyed with text and icons, not color alone;
- all motion has a reduced-motion version;
- full-screen effects are transient and non-interactive;
- Keeper-only data must not be exposed through accessible labels on player views;
- focus order remains logical in cards and folios.

## 18. Card Interaction Patterns

### 18.1 Single-action card

Used for:

- skill roll;
- Luck roll;
- Dodge;
- weapon attack;
- damage;
- Sanity check.

### 18.2 Guided procedure card

Used for:

- Pushed rolls;
- First Aid and Medicine;
- Major Wounds;
- spell casting;
- automatic fire;
- opposed rolls.

### 18.3 Linked card sequence

Used for:

- chases;
- bouts of madness;
- dying and stabilization;
- long rituals;
- development phase.

### 18.4 Folio

Used when the content cannot remain readable on one card:

- complex creatures;
- major villains;
- Mythos entities;
- spellcasters;
- complicated Keeper procedures.

## 19. Initial Card Inventory

The exact wording and thresholds require source audit before implementation.

### 19.1 Core Investigator cards

- Make a Skill Roll
- Regular, Hard, and Extreme Difficulty
- Critical Success and Fumble
- Bonus and Penalty Dice
- Push a Roll
- Luck Roll
- Spend Luck
- Opposed Roll
- Characteristic Roll
- Combined Roll
- Group Roll
- Improvement Check

### 19.2 Core combat cards

- Combat Round Order
- Attack
- Fighting Back
- Dodge
- Outnumbered
- Combat Maneuver
- Damage Bonus and Build
- Extreme Damage
- Impaling Damage
- Point-Blank Firearm Attack
- Firearm Range Bands
- Multiple Shots
- Reload
- Malfunction
- Cover
- Major Wound
- Unconscious and Dying
- First Aid
- Medicine
- Natural Healing

### 19.3 Sanity cards

- Make a Sanity Check
- Apply Sanity Loss
- Temporary Insanity
- Indefinite Insanity
- Bout of Madness
- Underlying Insanity
- Later Sanity Loss
- Treatment and Recovery

Official random-result tables should be represented only as user-created private tables or generic prompts unless distribution permission is confirmed.

### 19.4 Chase cards

- Start a Chase
- Determine Participants
- Movement Order
- Movement Actions
- Locations and Distance
- Barrier
- Hazard
- Close Distance
- Escape
- Vehicle Chase Differences

### 19.5 Keeper cards

- When Not to Roll
- Choose Difficulty
- Award Bonus or Penalty Dice
- State a Pushed-Roll Consequence
- Resolve Opposed Ties
- Keep Hidden Information Fair
- Create a Custom Consequence
- Run a Sanity Episode
- Run a Combat Encounter
- Run a Chase

## 20. Builders

### 20.1 Creature builder

Required sections:

- identity;
- category and era;
- characteristics;
- derived values;
- skills;
- attacks;
- armor and defenses;
- traits;
- powers;
- spells;
- Sanity loss;
- tactics;
- Keeper notes;
- print layout.

### 20.2 NPC builder

Additional support:

- occupation;
- social and investigative skills;
- public description;
- private motivation;
- secrets;
- relationships;
- combat behavior.

### 20.3 Weapon builder

Required validation:

- skill;
- damage formula;
- Damage Bonus behavior;
- impaling;
- range;
- attacks per round;
- capacity;
- malfunction;
- automatic-fire mode where applicable.

### 20.4 Spell and ritual builder

Required validation:

- player-safe summary;
- Keeper-only details;
- costs;
- required rolls;
- opposed rolls;
- duration;
- active-effect tracking;
- source and distribution status.

## 21. Licensing and Source Gate

No public rules-card implementation is complete until this gate passes.

### Required review

1. Verify the rule against an official source.
2. Record source title, edition, section, and page where applicable.
3. Write an original concise summary.
4. Confirm the summary does not reproduce substantial protected wording.
5. Confirm official tables, spell text, creature statistics, scenario text, logos, and artwork are not being reproduced without permission.
6. Determine whether the content is:
   - permitted public original summary;
   - private user-entered content;
   - licensed content;
   - reference-only and excluded from distribution.
7. Review the current Chaosium fan-use, licensing, and trademark guidance before release.

### Public repository rule

The public repository may contain:

- original application code;
- original visual assets;
- original concise rule summaries approved by the licensing review;
- generic schemas;
- custom-content builders;
- fictional original sample creatures, spells, weapons, and NPCs;
- tests using original fictional data.

The public repository must not contain protected official content unless permission clearly allows it.

## 22. Testing Strategy

### 22.1 Percentile engine

Test:

- 1 and 100 boundaries;
- exact full, half, and fifth thresholds;
- verified Critical and Fumble boundaries;
- odd skill values;
- zero values where permitted;
- Bonus-die candidate selection;
- Penalty-die candidate selection;
- shared units die;
- 00 tens and 0 units normalization;
- deterministic injected randomness;
- invalid values and safe errors.

### 22.2 Combat

Test:

- attack success levels;
- Dodge and Fighting Back comparisons;
- opposed outcomes and ties;
- ordinary damage;
- Damage Bonus application;
- Extreme and impaling damage;
- malfunction thresholds;
- ammunition decrement and reload;
- prevention of negative ammunition;
- multiple creature instances;
- current HP and defeated state.

### 22.3 Sanity

Test:

- success and failure loss formulas;
- fixed and dice-based loss;
- current Sanity updates;
- trigger detection for guided procedures;
- no automatic use of protected random-result tables;
- safe interruption and resumption of guided procedures.

### 22.4 Persistence

Test:

- isolated namespaces;
- malformed JSON;
- malformed nested entities;
- duplicate IDs;
- collection limits;
- schema migrations;
- independent encounter instances;
- no D&D/Call of Cthulhu leakage.

### 22.5 Accessibility and visual acceptance

Test:

- keyboard operation;
- screen-reader labels;
- focus restoration after overlays;
- reduced motion;
- contrast;
- mobile card readability;
- full-screen outcome effects;
- Keeper-only information boundaries;
- print output without background graphics.

## 23. Delivery Plan

### Foundation PR

- introduce `GameSystemId`;
- add system selection;
- namespace persistence;
- separate visual theme loading;
- no Call of Cthulhu rules content yet.

### Percentile Engine PR

- physical percentile model;
- Bonus and Penalty dice;
- success-level resolver;
- deterministic tests;
- basic roll-result component.

### Quick-Start Rules PR

- Investigator and Keeper workspaces;
- core roll cards;
- basic combat, Sanity, injury, and healing cards;
- original source-traceable summaries.

### Combat Assets PR

- weapon schema and cards;
- creature/NPC schema and cards;
- custom builders;
- compact and folio layouts.

### Encounter PR

- Keeper encounter workspace;
- runtime instances;
- HP, Magic Points, ammunition, conditions, and notes;
- direct rolls from encounter cards.

### Spells and Sanity PR

- spell/ritual schema;
- guided casting;
- active effects;
- complete Sanity procedures.

### Chases and Campaign Tools PR

- chase flow;
- investigator profiles;
- clues, handouts, locations, and scenario decks;
- import/export;
- print acceptance.

## 24. Risks and Mitigations

### Copyright and trademark risk

Mitigation:

- source metadata;
- original summaries;
- public/private content distinction;
- licensing review before release;
- original sample data only.

### Rules complexity

Mitigation:

- centralized rule functions;
- guided procedures;
- linked cards;
- extensive boundary tests;
- Keeper override where judgment is required.

### UI overcrowding

Mitigation:

- compact/expanded/folio layouts;
- progressive disclosure;
- role-specific views;
- card-size acceptance tests.

### Data corruption

Mitigation:

- strict validators;
- versioned storage;
- safe fallback;
- export backups;
- bounded input fields.

### Atmosphere harming usability

Mitigation:

- semantic design tokens;
- contrast testing;
- original subtle textures;
- reduced-motion mode;
- essential numbers always clean and readable.

## 25. Initial Acceptance Checklist

### System boundary

- [ ] System selector works.
- [ ] D&D and Call of Cthulhu workspaces are isolated.
- [ ] Persistence keys are isolated.
- [ ] Roll histories are isolated.
- [ ] Theme assets are isolated.

### Percentile engine

- [ ] Physical dice representation works.
- [ ] Bonus dice work.
- [ ] Penalty dice work.
- [ ] Success levels are verified and tested.
- [ ] Difficulty comparison works.
- [ ] Invalid values fail safely.

### Rules cards

- [ ] Every card has source metadata.
- [ ] Every public summary is original.
- [ ] Long procedures remain readable.
- [ ] Investigator and Keeper audiences are separated.

### Creature and NPC cards

- [ ] Compact card is combat ready.
- [ ] Expanded card is combat ready.
- [ ] Keeper folio is combat ready.
- [ ] Attacks and damage roll from the card.
- [ ] Dodge and opposed actions roll from the card.
- [ ] Sanity loss rolls from the card.
- [ ] HP and Magic Points can be tracked.

### Weapons

- [ ] Attack roll works.
- [ ] Damage roll works.
- [ ] Extreme and impaling behavior is verified.
- [ ] Ammunition works.
- [ ] Reload works.
- [ ] Malfunction works.

### Spells and rituals

- [ ] Player-safe and Keeper-only text are separated.
- [ ] Costs are tracked.
- [ ] Required and opposed rolls work.
- [ ] Duration and active effects work.

### Encounter workspace

- [ ] Multiple independent instances work.
- [ ] Reordering and pinning work.
- [ ] Current resources persist.
- [ ] Defeated state works.
- [ ] Encounter print output works.

### Visual and accessibility

- [ ] The system feels darker and more sinister than D&D.
- [ ] The theme does not imitate protected trade dress.
- [ ] Text remains readable.
- [ ] Critical, Fumble, and Sanity effects respect reduced motion.
- [ ] Keyboard and screen-reader acceptance pass.
- [ ] Mobile acceptance passes.

### Release gate

- [ ] Licensing review passes.
- [ ] Automated tests pass.
- [ ] Production build passes.
- [ ] Browser acceptance passes.
- [ ] Print-preview acceptance passes.
- [ ] Documentation matches implementation.

## 26. Immediate Next Action

1. Finish browser and print acceptance for PR #6.
2. Merge PR #6 into `main`.
3. Rebase this design branch onto the updated `main` if necessary.
4. Review and approve this specification.
5. Open the Foundation PR for `GameSystemId`, system selection, persistence namespaces, and theme boundaries.
6. Audit official Quick-Start material before writing the first public Call of Cthulhu rules summaries.

A Call of Cthulhu implementation is not considered complete merely because the cards look atmospheric. It is complete only when a Keeper can run the common procedures, weapons, creatures, NPCs, spells, Sanity effects, and encounters directly from accurate, usable, combat-ready cards.