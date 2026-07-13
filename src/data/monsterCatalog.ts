import type { MonsterCardData } from "../types/monsters";

export const monsterCatalog: MonsterCardData[] = [
  {
    id: "goblin-2014",
    ruleset: "srd-5.1-2014",
    source: "Monster Card Forge SRD sample",
    name: "Goblin",
    cr: "1/4",
    type: "Humanoid",
    size: "Small",
    layoutHint: "standard",
    ac: "15",
    hp: "7 (2d6)",
    speed: "30 ft.",
    abilities: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
    saves: [],
    skills: ["Stealth +6"],
    senses: "Darkvision 60 ft., Passive Perception 9",
    languages: "Common, Goblin",
    resistances: [],
    immunities: [],
    conditionImmunities: [],
    traits: [],
    actions: [
      { name: "Scimitar", hit: "+4", reach: "5 ft.", damage: "5 (1d6+2) Slashing", text: "Melee weapon attack." },
      { name: "Shortbow", hit: "+4", reach: "80/320 ft.", damage: "5 (1d6+2) Piercing", text: "Ranged weapon attack." }
    ],
    bonusActions: [{ name: "Nimble Escape", text: "Take the Disengage or Hide action." }],
    reactions: [],
    legendaryActions: [],
    spellcasting: null,
    lairActions: [],
    regionalEffects: []
  },
  {
    id: "adult-black-dragon-2014",
    ruleset: "srd-5.1-2014",
    source: "Monster Card Forge SRD sample",
    name: "Adult Black Dragon",
    cr: "14",
    type: "Dragon",
    size: "Huge",
    layoutHint: "accordion",
    ac: "19",
    hp: "195 (17d12+85)",
    speed: "40 ft., fly 80 ft., swim 40 ft.",
    abilities: { str: 23, dex: 14, con: 21, int: 14, wis: 13, cha: 17 },
    saves: ["Dex +7", "Con +10", "Wis +6", "Cha +8"],
    skills: ["Perception +11", "Stealth +7"],
    senses: "Blindsight 60 ft., Darkvision 120 ft., Passive Perception 21",
    languages: "Common, Draconic",
    resistances: [],
    immunities: ["Acid"],
    conditionImmunities: [],
    traits: [
      { name: "Amphibious", text: "Can breathe air and water." },
      { name: "Legendary Resistance (3/Day)", text: "If the dragon fails a saving throw, it can choose to succeed instead." }
    ],
    actions: [
      { name: "Multiattack", text: "Uses Frightful Presence, then makes one Bite and two Claw attacks." },
      { name: "Bite", hit: "+11", reach: "10 ft.", damage: "17 (2d10+6) Piercing + 4 (1d8) Acid" },
      { name: "Claw", hit: "+11", reach: "5 ft.", damage: "13 (2d6+6) Slashing" },
      { name: "Tail", hit: "+11", reach: "15 ft.", damage: "15 (2d8+6) Bludgeoning" },
      { name: "Acid Breath", text: "Recharge 5–6. 60-foot line; Dexterity save; acid damage." }
    ],
    bonusActions: [],
    reactions: [],
    legendaryActions: [
      { name: "Detect", text: "Makes a Wisdom (Perception) check." },
      { name: "Tail Attack", text: "Makes a Tail attack." },
      { name: "Wing Attack (Costs 2)", text: "Nearby creatures save or take damage and fall Prone; the dragon flies up to half its Speed." }
    ],
    spellcasting: null,
    lairActions: [
      { name: "Mire", text: "Pools of water become grasping sludge." },
      { name: "Darkness", text: "Magical darkness spreads from a point." }
    ],
    regionalEffects: []
  },
  {
    id: "lich-2014",
    ruleset: "srd-5.1-2014",
    source: "Monster Card Forge SRD sample",
    name: "Lich",
    cr: "21",
    type: "Undead",
    size: "Medium",
    layoutHint: "accordion",
    ac: "17",
    hp: "135 (18d8+54)",
    speed: "30 ft.",
    abilities: { str: 11, dex: 16, con: 16, int: 20, wis: 14, cha: 16 },
    saves: ["Con +10", "Int +12", "Wis +9"],
    skills: ["Arcana +18", "History +12", "Insight +9", "Perception +9"],
    senses: "Truesight 120 ft., Passive Perception 19",
    languages: "Common plus five languages",
    resistances: ["Cold", "Lightning", "Necrotic"],
    immunities: ["Poison", "Nonmagical Bludgeoning, Piercing, and Slashing"],
    conditionImmunities: ["Charmed", "Exhaustion", "Frightened", "Paralyzed", "Poisoned"],
    traits: [
      { name: "Legendary Resistance (3/Day)", text: "If the lich fails a saving throw, it can choose to succeed instead." },
      { name: "Rejuvenation", text: "If it has a phylactery, a destroyed lich gains a new body in 1d10 days." },
      { name: "Turn Resistance", text: "Advantage on saving throws against effects that turn Undead." }
    ],
    actions: [
      { name: "Paralyzing Touch", hit: "+12", reach: "5 ft.", damage: "10 (3d6) Cold", text: "Target must save or become Paralyzed." }
    ],
    bonusActions: [],
    reactions: [],
    legendaryActions: [
      { name: "Cantrip", text: "Casts a cantrip." },
      { name: "Paralyzing Touch (Costs 2)", text: "Uses Paralyzing Touch." },
      { name: "Frightening Gaze (Costs 2)", text: "One creature must save or become Frightened." },
      { name: "Disrupt Life (Costs 3)", text: "Nearby creatures save or take Necrotic damage." }
    ],
    spellcasting: {
      header: "Spellcasting. Save DC 20, spell attack +12.",
      levels: {
        "At will": ["Mage Hand", "Prestidigitation", "Ray of Frost"],
        "1st": ["Detect Magic", "Magic Missile", "Shield", "Thunderwave"],
        "2nd": ["Detect Thoughts", "Invisibility", "Mirror Image", "Acid Arrow"],
        "3rd": ["Animate Dead", "Counterspell", "Dispel Magic", "Fireball"],
        "4th": ["Blight", "Dimension Door"],
        "5th": ["Cloudkill", "Scrying"],
        "6th": ["Disintegrate", "Globe of Invulnerability"],
        "7th": ["Finger of Death", "Plane Shift"],
        "8th": ["Dominate Monster", "Power Word Stun"],
        "9th": ["Power Word Kill"]
      }
    },
    lairActions: [
      { name: "Necrotic Tether", text: "A spirit effect drains life." },
      { name: "Arcane Surge", text: "Magical energy disrupts intruders." }
    ],
    regionalEffects: []
  }
];

export const monsterHomebrewExample: MonsterCardData = {
  id: "frost-troll-homebrew",
  ruleset: "homebrew",
  source: "Homebrew example",
  name: "Frost Troll",
  cr: "8",
  type: "Giant",
  size: "Large",
  layoutHint: "auto",
  ac: "15",
  hp: "136 (16d10+48)",
  speed: "30 ft.",
  abilities: { str: 20, dex: 13, con: 18, int: 7, wis: 10, cha: 7 },
  saves: ["Con +7"],
  skills: ["Perception +3"],
  senses: "Darkvision 60 ft., Passive Perception 13",
  languages: "Giant",
  resistances: ["Cold"],
  immunities: [],
  conditionImmunities: [],
  traits: [{ name: "Regeneration", text: "Regains 10 HP at the start of its turn unless damaged by Fire." }],
  actions: [
    { name: "Multiattack", text: "Makes one Bite and two Claw attacks." },
    { name: "Claw", hit: "+8", reach: "5 ft.", damage: "12 (2d6+5) Slashing" }
  ],
  bonusActions: [],
  reactions: [],
  legendaryActions: [],
  spellcasting: null,
  lairActions: [],
  regionalEffects: []
};