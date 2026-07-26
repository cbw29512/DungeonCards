import type { DndAbilityScores, DndCharacterRecord, DndCharacterResource } from "../types/dndCharacter";
import type { RulesetId } from "../types/ruleCards";
import { dndAbilityModifier, dndFixedHitPoints } from "../utils/dndCharacterRecord";
import { getDndPregenBuildSlot } from "../utils/dndPregenCatalog";
import { getDndFullCasterSlots } from "./dndCasterProgression";

const levels = Array.from({ length: 20 }, (_, index) => index + 1);
const attained = (level: number, entries: Array<[number, string]>): string[] =>
  entries.filter(([unlock]) => level >= unlock).map(([, value]) => value);

const cantrips2014 = (level: number): string[] => [
  "Sacred Flame", "Guidance", "Thaumaturgy",
  ...(level >= 4 ? ["Spare the Dying"] : []),
  ...(level >= 10 ? ["Light"] : [])
];

const cantrips2024 = (level: number): string[] => [
  "Guidance", "Light", "Spare the Dying",
  ...(level >= 4 ? ["Resistance"] : []),
  ...(level >= 10 ? ["Toll the Dead"] : []),
  "Sacred Flame (Magic Initiate: Cleric)",
  "Thaumaturgy (Magic Initiate: Cleric)"
];

const clericPreparedPool2014: Array<[number, string]> = [
  [1, "Guiding Bolt"], [1, "Healing Word"], [1, "Sanctuary"], [1, "Shield of Faith"],
  [3, "Aid"], [3, "Prayer of Healing"], [5, "Spirit Guardians"], [5, "Dispel Magic"],
  [7, "Banishment"], [7, "Freedom of Movement"], [9, "Greater Restoration"], [9, "Flame Strike"],
  [11, "Heal"], [11, "Heroes' Feast"], [11, "Word of Recall"], [13, "Resurrection"],
  [13, "Plane Shift"], [15, "Holy Aura"], [17, "Mass Heal"], [17, "True Resurrection"],
  [1, "Command"], [1, "Detect Magic"], [1, "Protection from Evil and Good"], [3, "Hold Person"],
  [3, "Silence"], [3, "Warding Bond"], [5, "Sending"], [5, "Speak with Dead"],
  [5, "Water Walk"], [7, "Divination"], [7, "Locate Creature"], [9, "Commune"]
];

const clericPreparedPool2024: Array<[number, string]> = [
  [1, "Guiding Bolt"], [1, "Healing Word"], [1, "Sanctuary"], [1, "Command"],
  [3, "Prayer of Healing"], [3, "Hold Person"], [5, "Spirit Guardians"], [5, "Dispel Magic"],
  [7, "Banishment"], [7, "Freedom of Movement"], [9, "Flame Strike"], [9, "Commune"],
  [11, "Heal"], [11, "Heroes' Feast"], [11, "Word of Recall"], [13, "Resurrection"],
  [13, "Plane Shift"], [15, "Holy Aura"], [17, "Mass Heal"], [17, "True Resurrection"],
  [1, "Detect Magic"], [1, "Protection from Evil and Good"]
];

const domainSpells2014 = (level: number): string[] => attained(level, [
  [1, "Bless"], [1, "Cure Wounds"], [3, "Lesser Restoration"], [3, "Spiritual Weapon"],
  [5, "Beacon of Hope"], [5, "Revivify"], [7, "Death Ward"], [7, "Guardian of Faith"],
  [9, "Mass Cure Wounds"], [9, "Raise Dead"]
]);

const domainSpells2024 = (level: number): string[] => attained(level, [
  [3, "Aid"], [3, "Bless"], [3, "Cure Wounds"], [3, "Lesser Restoration"],
  [5, "Mass Healing Word"], [5, "Revivify"], [7, "Aura of Life"], [7, "Death Ward"],
  [9, "Greater Restoration"], [9, "Mass Cure Wounds"]
]);

const preparedCounts2024 = [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22];

const scores2014 = (level: number): DndAbilityScores => {
  const scores = { str: 14, dex: 10, con: 15, int: 8, wis: 16, cha: 12 };
  if (level >= 4) scores.wis += 2;
  if (level >= 8) scores.wis += 2;
  if (level >= 12) { scores.con += 1; scores.str += 1; }
  if (level >= 16) { scores.str += 1; scores.dex += 1; }
  if (level >= 19) { scores.dex += 1; scores.cha += 1; }
  return scores;
};

const scores2024 = (level: number): DndAbilityScores => {
  const scores = { str: 13, dex: 12, con: 14, int: 8, wis: 17, cha: 11 };
  if (level >= 4) scores.wis += 2;
  if (level >= 8) { scores.wis += 1; scores.con += 1; }
  if (level >= 12) { scores.con += 1; scores.str += 1; }
  if (level >= 16) scores.con += 2;
  if (level >= 19) scores.cha += 1;
  return scores;
};

const choices2014 = (level: number): string[] => attained(level, [
  [4, "Level 4 Ability Score Improvement: Wisdom +2"],
  [8, "Level 8 Ability Score Improvement: Wisdom +2"],
  [12, "Level 12 Ability Score Improvement: Constitution +1, Strength +1"],
  [16, "Level 16 Ability Score Improvement: Strength +1, Dexterity +1"],
  [19, "Level 19 Ability Score Improvement: Dexterity +1, Charisma +1"]
]);

const choices2024 = (level: number): string[] => [
  "Acolyte Origin Feat: Magic Initiate (Cleric) — Sacred Flame, Thaumaturgy, Shield of Faith; Wisdom is the spellcasting ability",
  ...attained(level, [
    [4, "Level 4 Ability Score Improvement: Wisdom +2"],
    [8, "Level 8 Ability Score Improvement: Wisdom +1, Constitution +1"],
    [12, "Level 12 Ability Score Improvement: Constitution +1, Strength +1"],
    [16, "Level 16 Ability Score Improvement: Constitution +2"],
    [19, "Level 19 Boon of Fate: Charisma +1; add or subtract 2d4 from a d20 Test within 60 feet once per Short or Long Rest"]
  ])
];

const features2014 = (level: number): string[] => [
  "Spellcasting: prepare Cleric spells equal to Cleric level + Wisdom modifier; domain spells are always prepared outside that count",
  ...attained(level, [
    [2, "Channel Divinity — Turn Undead: Action; undead within 30 feet make a Wisdom save or are Turned for 1 minute"],
    [4, "Ability Score Improvement"], [5, "Destroy Undead (CR 1/2)"],
    [8, "Ability Score Improvement"], [8, "Destroy Undead (CR 1)"],
    [10, "Divine Intervention: percentile roll at or below Cleric level; on success, no reuse for 7 days; on failure, retry after a Long Rest"],
    [11, "Destroy Undead (CR 2)"], [12, "Ability Score Improvement"],
    [14, "Destroy Undead (CR 3)"], [16, "Ability Score Improvement"],
    [17, "Destroy Undead (CR 4)"], [18, "Channel Divinity: three uses between rests"],
    [19, "Ability Score Improvement"], [20, "Improved Divine Intervention: Divine Intervention succeeds automatically"]
  ])
];

const life2014 = (level: number): string[] => attained(level, [
  [1, "Bonus Proficiency: Heavy Armor"],
  [1, "Disciple of Life: a spell of level 1+ that restores HP restores an additional 2 + spell level"],
  [2, "Channel Divinity — Preserve Life: distribute HP equal to five times Cleric level among creatures within 30 feet, without raising a creature above half HP"],
  [6, "Blessed Healer: when a level 1+ spell heals another creature, regain 2 + spell level HP"],
  [8, "Divine Strike: once per turn, one weapon hit deals +1d8 radiant damage"],
  [14, "Divine Strike: extra radiant damage becomes 2d8"],
  [17, "Supreme Healing: when a spell would roll dice to restore HP, use the maximum result instead"]
]);

const features2024 = (level: number): string[] => [
  "Spellcasting: the Cleric table determines prepared Cleric spells; domain and origin spells are always prepared outside that count",
  "Divine Order — Protector: Martial weapon training and Heavy Armor training",
  ...attained(level, [
    [2, "Channel Divinity — Divine Spark or Turn Undead: two uses; regain one on a Short Rest and all on a Long Rest"],
    [2, "Divine Spark: Magic action; heal a creature or force an undead within 30 feet to make a Constitution save against radiant or necrotic damage"],
    [2, "Turn Undead: Magic action; undead within 30 feet make a Wisdom save or become Frightened and Incapacitated for 1 minute"],
    [4, "Ability Score Improvement"], [5, "Sear Undead: Turn Undead also deals radiant damage equal to Wisdom modifier d8"],
    [6, "Channel Divinity: three uses"], [7, "Blessed Strikes — Divine Strike: once per turn, one weapon hit deals +1d8 radiant damage"],
    [8, "Ability Score Improvement"], [10, "Divine Intervention: Magic action; cast an eligible Cleric spell of level 5 or lower without a spell slot or material components, once per Long Rest"],
    [12, "Ability Score Improvement"], [14, "Improved Blessed Strikes: Divine Strike extra damage becomes 2d8"],
    [16, "Ability Score Improvement"], [18, "Channel Divinity: four uses"],
    [19, "Epic Boon — Boon of Fate"], [20, "Greater Divine Intervention: Divine Intervention can produce Wish; afterward it is unavailable for 2d4 Long Rests"]
  ])
];

const life2024 = (level: number): string[] => attained(level, [
  [3, "Disciple of Life: a spell-slot spell that restores HP restores an additional 2 + spell-slot level"],
  [3, "Channel Divinity — Preserve Life: choose Bloodied creatures within 30 feet; each regains 2d8 + Cleric level HP and cannot rise above half HP from this use"],
  [6, "Blessed Healer: when a spell-slot spell heals another creature, regain 2 + spell-slot level HP"],
  [17, "Supreme Healing: when a spell would roll dice to restore HP, use the maximum result instead"]
]);

const channelDivinityUses2014 = (level: number): number => level >= 18 ? 3 : level >= 6 ? 2 : 1;
const channelDivinityUses2024 = (level: number): number => level >= 18 ? 4 : level >= 6 ? 3 : 2;

const resources2014 = (level: number): DndCharacterResource[] => [
  ...(level >= 2 ? [{ id: "channel-divinity", name: "Channel Divinity", maximum: channelDivinityUses2014(level), refresh: "short-rest" as const }] : []),
  ...(level >= 10 ? [{ id: "divine-intervention", name: "Divine Intervention", maximum: 1, refresh: "long-rest" as const, notes: level >= 20 ? "Succeeds automatically; after a success, unavailable for 7 days." : "On a success, unavailable for 7 days; after a failed request, retry after a Long Rest." }] : [])
];

const resources2024 = (level: number): DndCharacterResource[] => [
  ...(level >= 2 ? [{ id: "channel-divinity", name: "Channel Divinity", maximum: channelDivinityUses2024(level), refresh: "long-rest" as const, notes: "Regain one expended use on a Short Rest and all on a Long Rest." }] : []),
  { id: "magic-initiate-shield-faith", name: "Magic Initiate — Shield of Faith free cast", maximum: 1, refresh: "long-rest", notes: "Shield of Faith remains prepared and can also be cast with spell slots." },
  ...(level >= 10 ? [{ id: "divine-intervention", name: "Divine Intervention", maximum: 1, refresh: "long-rest" as const, notes: level >= 20 ? "Greater Divine Intervention can produce Wish; afterward unavailable for 2d4 Long Rests." : "Cast an eligible Cleric spell of level 5 or lower without expending a slot." }] : [])
];

const make2014 = (level: number): DndCharacterRecord => {
  const slot = getDndPregenBuildSlot("srd-5.1-2014", "cleric", "life-domain", level);
  if (!slot) throw new Error(`Missing 2014 Cleric / Life build slot at level ${level}.`);
  const abilityScores = scores2014(level);
  const strengthModifier = dndAbilityModifier(abilityScores.str);
  const preparedCount = level + dndAbilityModifier(abilityScores.wis);
  const prepared = clericPreparedPool2014.filter(([unlock]) => level >= unlock).slice(0, preparedCount).map(([, spell]) => spell);
  const domain = domainSpells2014(level);
  return {
    id: `${slot.id}-bromli-dawnshield`, buildSlotId: slot.id, ruleset: slot.ruleset,
    name: "Bromli Dawnshield", classId: "cleric", className: "Cleric", subclassId: "life-domain", subclassName: "Life Domain", subclassUnlockLevel: 1, level,
    species: "Hill Dwarf", background: "Acolyte", abilityScores, hitDie: 8,
    maximumHitPoints: dndFixedHitPoints(8, level, abilityScores.con) + level,
    armorClass: 18, speedFeet: 25,
    savingThrowProficiencies: ["wis", "cha"],
    skillProficiencies: ["Insight", "Religion", "Medicine", "Persuasion"],
    languages: ["Common", "Dwarvish", "Celestial", "Elvish"],
    toolProficiencies: ["Brewer's Supplies"], senses: ["Darkvision 60 ft."],
    attacks: [
      { id: "warhammer", name: "Warhammer", attackAbility: "str", proficient: true, damageFormula: `1d8+${strengthModifier}`, damageType: "bludgeoning", rangeOrReach: "5 ft.", notes: level >= 8 ? `Divine Strike can add ${level >= 14 ? "2d8" : "1d8"} radiant damage once per turn.` : "One-handed with Shield." },
      { id: "light-crossbow", name: "Light Crossbow", attackAbility: "dex", proficient: true, damageFormula: `1d8+${dndAbilityModifier(abilityScores.dex)}`, damageType: "piercing", rangeOrReach: "80/320 ft.", notes: "Loading, ammunition, two-handed; 20 bolts carried." }
    ],
    resources: resources2014(level), spellcastingExpected: true,
    spellcasting: { kind: "prepared", ability: "wis", cantrips: cantrips2014(level), spells: [...prepared, ...domain], slotsByLevel: getDndFullCasterSlots(level), notes: `Prepared Cleric spells: ${preparedCount}. Life Domain adds ${domain.length} always-prepared spells outside that count.` },
    classFeatures: features2014(level), subclassFeatures: life2014(level), advancementChoices: choices2014(level),
    equipment: ["Chain Mail", "Shield", "Warhammer", "Light Crossbow", "20 Bolts", "Priest's Pack", "Holy Symbol", "Prayer Book", "5 Sticks of Incense", "Vestments", "Common Clothes"], currencyGp: 15,
    notes: ["Hill Dwarf Dwarven Toughness adds 1 maximum HP per level; that bonus is included.", "Hill Dwarf speed is not reduced by Heavy Armor.", "Acolyte grants Insight, Religion, two languages, and Shelter of the Faithful."],
    sources: [
      { label: "2014 Basic Rules — Cleric and Life Domain", url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/classes", scope: "public-srd" },
      { label: "2014 Basic Rules — Hill Dwarf", url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/races", scope: "public-srd" },
      { label: "2014 Basic Rules — Acolyte", url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/personality-and-background", scope: "public-srd" }
    ], printableSummaryReady: true
  };
};

const make2024 = (level: number): DndCharacterRecord => {
  const slot = getDndPregenBuildSlot("srd-5.2.1-2024", "cleric", "life-domain", level);
  if (!slot) throw new Error(`Missing 2024 Cleric / Life build slot at level ${level}.`);
  const abilityScores = scores2024(level);
  const strengthModifier = dndAbilityModifier(abilityScores.str);
  const preparedCount = preparedCounts2024[level - 1];
  const prepared = clericPreparedPool2024.filter(([unlock]) => level >= unlock).slice(0, preparedCount).map(([, spell]) => spell);
  const domain = domainSpells2024(level);
  return {
    id: `${slot.id}-thora-brightmantle`, buildSlotId: slot.id, ruleset: slot.ruleset,
    name: "Thora Brightmantle", classId: "cleric", className: "Cleric", subclassId: "life-domain", subclassName: "Life Domain", subclassUnlockLevel: 3, level,
    species: "Dwarf", background: "Acolyte", abilityScores, hitDie: 8,
    maximumHitPoints: dndFixedHitPoints(8, level, abilityScores.con) + level,
    armorClass: 18, speedFeet: 30,
    savingThrowProficiencies: ["wis", "cha"],
    skillProficiencies: ["Insight", "Religion", "Medicine", "Persuasion"],
    languages: ["Common", "Dwarvish", "Celestial"], toolProficiencies: ["Calligrapher's Supplies"],
    senses: ["Darkvision 120 ft."],
    attacks: [
      { id: "warhammer", name: "Warhammer", attackAbility: "str", proficient: true, damageFormula: `1d8+${strengthModifier}`, damageType: "bludgeoning", rangeOrReach: "5 ft.", notes: level >= 7 ? `Divine Strike can add ${level >= 14 ? "2d8" : "1d8"} radiant damage once per turn.` : "Protector grants Martial weapon and Heavy Armor training." },
      { id: "light-crossbow", name: "Light Crossbow", attackAbility: "dex", proficient: true, damageFormula: `1d8+${dndAbilityModifier(abilityScores.dex)}`, damageType: "piercing", rangeOrReach: "80/320 ft.", notes: "Loading, ammunition, two-handed; 20 bolts carried." }
    ],
    resources: resources2024(level), spellcastingExpected: true,
    spellcasting: { kind: "prepared", ability: "wis", cantrips: cantrips2024(level), spells: [...prepared, ...domain, "Shield of Faith (Magic Initiate: Cleric)"], slotsByLevel: getDndFullCasterSlots(level), notes: `Cleric table Prepared Spells: ${preparedCount}. Life Domain adds ${domain.length} always-prepared spells; Magic Initiate adds Shield of Faith outside that count.` },
    classFeatures: features2024(level), subclassFeatures: life2024(level), advancementChoices: choices2024(level),
    equipment: ["Chain Mail", "Shield", "Warhammer", "Light Crossbow", "20 Bolts", "Priest's Pack", "Holy Symbol", "Quarterstaff", "Calligrapher's Supplies", "Prayer Book", "10 Sheets of Parchment", "Robe"], currencyGp: 23,
    notes: ["Dwarven Toughness adds 1 maximum HP per level; that bonus is included.", "Acolyte supplies Magic Initiate (Cleric), Insight, Religion, Calligrapher's Supplies, and the selected Wisdom/Charisma increases.", "Protector supplies Martial weapon and Heavy Armor training."],
    sources: [
      { label: "2024 Free Rules — Cleric and Life Domain", url: "https://www.dndbeyond.com/sources/dnd/br-2024/character-classes", scope: "public-srd" },
      { label: "2024 Free Rules — Dwarf and Acolyte", url: "https://www.dndbeyond.com/sources/dnd/br-2024/character-origins", scope: "public-srd" },
      { label: "2024 Free Rules — Feats", url: "https://www.dndbeyond.com/sources/dnd/br-2024/feats", scope: "public-srd" },
      { label: "2024 Free Rules — Equipment", url: "https://www.dndbeyond.com/sources/dnd/br-2024/equipment", scope: "public-srd" }
    ], printableSummaryReady: true
  };
};

export const dndClericPregenRecords: DndCharacterRecord[] = [...levels.map(make2014), ...levels.map(make2024)];
export const getDndClericPregenRecord = (ruleset: RulesetId, level: number): DndCharacterRecord | undefined =>
  dndClericPregenRecords.find((record) => record.ruleset === ruleset && record.level === level);
