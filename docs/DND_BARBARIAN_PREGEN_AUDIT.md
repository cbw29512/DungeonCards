# Barbarian / Berserker Pregen Audit

## Scope

This release adds forty complete Barbarian / Berserker characters:

- 2014 / SRD 5.1 levels 1–20;
- 2024 / SRD 5.2.1 levels 1–20.

Every record uses the subclass-safe slot identity:

```text
ruleset × barbarian × path-berserker × level
```

## Release Gate

All forty records must pass the shared character validator before release. The gate covers:

- identity and subclass-safe build-slot matching;
- six valid ability scores;
- Hit Points, Armor Class, and Speed;
- saving throws, skills, tools, and languages;
- executable attacks;
- limited or unlimited resources;
- class and subclass progression;
- advancement choices;
- equipment and currency;
- source references;
- printable quick-play readiness.

The released-catalog test also requires unique character IDs and unique build-slot IDs across Fighter and Barbarian records.

## 2014 Build

**Character:** Thora Ashwalker  
**Species / background:** Human Outlander  
**Primary equipment:** Greataxe, handaxes, javelins, explorer's pack  
**Role:** durable melee striker

The 2014 ladder preserves:

- Long-Rest Rage recovery and unlimited Rage at level 20;
- Reckless Attack, Danger Sense, Extra Attack, Fast Movement, Feral Instinct, Brutal Critical, Relentless Rage, Persistent Rage, Indomitable Might, and Primal Champion;
- Frenzy's Bonus Action attack and post-Rage Exhaustion cost;
- Mindless Rage at level 6;
- Intimidating Presence at level 10, including its continuing Action and 24-hour immunity after success or expiration;
- Retaliation at level 14;
- the 2014 Strength and Constitution maximum of 24 at level 20.

## 2024 Build

**Character:** Dain Redstorm  
**Species / background:** Human Soldier  
**Primary equipment:** Greataxe, handaxes, explorer's pack  
**Role:** durable melee striker

The 2024 ladder preserves:

- one Rage use restored on a Short Rest and all uses on a Long Rest;
- Weapon Mastery, Tactical Rage duration behavior, Primal Knowledge, Instinctive Pounce, Brutal Strike, Relentless Rage, Persistent Rage, Indomitable Might, Epic Boon, and Primal Champion;
- Stealth proficiency from Primal Knowledge at level 3 and Acrobatics at level 10;
- revised Frenzy damage dice rather than a Bonus Action attack or Exhaustion;
- Mindless Rage at level 6;
- Retaliation at level 10;
- Intimidating Presence at level 14 with its tracked Long-Rest use and Rage-use recovery option;
- Improved Brutal Strike's 2d10 damage and two-effect choice at level 17;
- Tough's two Hit Points per level;
- the selected level-19 Epic Boon and its Dexterity increase;
- Strength and Constitution reaching 24 at level 20 under the selected progression.

## Resource Representation

The character schema now distinguishes limited resources from genuinely unlimited resources. A limited resource requires a positive maximum. An unlimited resource requires:

```text
unlimited: true
maximum: 0
```

The printable sheet renders the word `Unlimited` rather than creating a misleading number of tracker circles.

## Publishing Boundary

Public records use SRD / free-rules material and original character identities. Protected paid-book subclasses are not copied into the repository. Those require a future private user-owned import path or separate licensing.

## Catalog Result

After this release:

- 80 of 480 public slots are ready to play;
- Fighter / Champion and Barbarian / Berserker are complete in both editions at levels 1–20;
- 400 remaining slots stay visibly marked as Blueprints;
- no unfinished record can be promoted by changing a display label alone.

## Next Ladder

The next class path should use the same sequence:

1. official edition-separated rules audit;
2. explicit Data Schema mapping and build choices;
3. twenty records per edition;
4. hard-gate validation;
5. catalog-wide uniqueness tests;
6. printable review;
7. coverage-ledger update.
