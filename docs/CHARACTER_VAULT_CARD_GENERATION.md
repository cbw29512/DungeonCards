# Character Vault Card Generation

Character Vault builds remain the immutable source of truth. Card Platform definitions are generated deterministically from those verified profiles rather than stored as a second copy of character rules data.

## Public API

- `generateDndCharacterCardBundle(profile)` generates one validated character deck.
- `getDndVaultCardBundleByBuildId(buildId)` generates one bundle by immutable Vault build ID.
- `generateDndVaultCardLibrary()` lazily generates bundles for all current Vault Ready builds.
- `countGeneratedDndVaultCards()` reports the current generated definition count.

## Bundle contract

Each bundle contains:

- schema version;
- immutable source build ID;
- exact `dnd-2014` or `dnd-2024` identity;
- validated Card Platform definitions;
- one `character` deck containing every generated definition ID.

Generation fails rather than returning a partial bundle when:

- card IDs collide;
- a card crosses editions;
- a generated card fails Card Platform validation;
- the generated deck fails deck validation.

## Attack cards

Attack cards calculate the d20 attack formula from:

- the attack ability score;
- the character level's proficiency bonus;
- whether the attack is proficient.

Damage formulas, damage type, range or reach, and existing build notes remain attached to the generated card.

## Resource cards

Every Character Vault class resource becomes an independent runtime resource with its existing:

- maximum;
- refresh cadence;
- notes;
- stable source ID.

Unlimited resources use the Card Platform unlimited-resource convention and begin with a tracked value of zero.

## Spell cards

Selected cantrips and spells are matched against the generated SRD catalog using both exact edition and spell name.

Matched spells carry:

- casting time;
- range;
- components;
- duration;
- SRD description;
- higher-level text;
- source page;
- exact SRD PDF source;
- CC BY 4.0 attribution metadata.

A selected spell missing from the public catalog remains a source-linked reference card. DM Forge does not invent spell rules text.

Spell-slot totals become separate long-rest resource cards so saved character state can track each slot level independently.

## Feature and tactics cards

Generated feature cards include:

- class features;
- subclass features;
- advancement choices and feats;
- one build-tactics procedure card.

Richer advancement records retain level, prerequisite, synergy, and source information.

## Item cards

Starting equipment becomes item reference cards.

Magic items preserve:

- category and rarity;
- effect summary and build synergy;
- attunement requirements;
- recharge procedure;
- charges or consumable uses as independent runtime resources;
- source and privacy boundaries.

## Immutability and determinism

Generation does not mutate a Vault profile. Repeating generation for the same immutable build produces the same definitions and deck.

The current regression suite generates cards for all 120 Vault Ready builds and enforces global definition-ID uniqueness.

## Card dimensions

Every generated definition uses the universal card print contract:

- 250 × 350 pixels on screen;
- 2.5 × 3.5 inches in print;
- 5:7 aspect ratio.

Character sheets, editors, and print packets remain workspace/document layouts. They do not redefine card dimensions.
