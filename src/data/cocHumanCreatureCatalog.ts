import type { CocCreatureRecord } from "../types/coc";

export const cocHumanCreatureCatalog: CocCreatureRecord[] = [
  {
    "id": "coc-original-cult-enforcer",
    "name": "Cult Enforcer",
    "classification": "Human adversary",
    "keeperTag": "Field profile · violent believer",
    "kind": "human",
    "threat": "moderate",
    "environments": ["city", "warehouse", "cult site"],
    "characteristics": { "STR": 70, "CON": 65, "SIZ": 70, "DEX": 55, "INT": 45, "POW": 50 },
    "hitPoints": 13,
    "magicPoints": 10,
    "move": 8,
    "build": 1,
    "damageBonus": "+1d4",
    "armor": 1,
    "dodge": 30,
    "sanityLossFormula": "1d3",
    "description": "A disciplined believer trained to protect forbidden meetings, destroy evidence, and keep witnesses from reaching the authorities.",
    "traits": ["Padded coat provides 1 point of armor.", "Fanatical discipline: gains a Bonus die to resist intimidation while a leader is present.", "Keeper cue: retreats only to protect a more important secret."],
    "attacks": [
      { "id": "enforcer-club", "name": "Weighted Club", "skill": 60, "damageFormula": "1d8+1d4", "notes": "Blunt close-combat attack." },
      { "id": "enforcer-revolver", "name": "Concealed Revolver", "skill": 50, "damageFormula": "1d10", "notes": "Six shots; firing multiple times may impose a Penalty die." }
    ]
  },
  {
    "id": "coc-original-desperate-smuggler",
    "name": "Desperate Smuggler",
    "classification": "Human adversary",
    "keeperTag": "Port authority watch list",
    "kind": "human",
    "threat": "low",
    "environments": ["docks", "ship", "warehouse"],
    "characteristics": { "STR": 55, "CON": 55, "SIZ": 60, "DEX": 65, "INT": 60, "POW": 45 },
    "hitPoints": 11,
    "magicPoints": 9,
    "move": 8,
    "build": 0,
    "damageBonus": "0",
    "armor": 0,
    "dodge": 45,
    "sanityLossFormula": "1d2",
    "description": "A quick-thinking trafficker who has seen enough unnatural cargo to know that witnesses are dangerous and locked crates should remain locked.",
    "traits": ["Escape routes: knows at least two exits from any prepared meeting place.", "Nervous trigger: may fire first if cornered by obvious authority.", "Keeper cue: bargains readily when offered safe passage."],
    "attacks": [
      { "id": "smuggler-knife", "name": "Dock Knife", "skill": 45, "damageFormula": "1d4+2", "notes": "Close-combat stabbing attack." },
      { "id": "smuggler-pistol", "name": "Pocket Pistol", "skill": 55, "damageFormula": "1d8", "notes": "Compact firearm with limited capacity." }
    ]
  },
  {
    "id": "coc-original-corrupt-deputy",
    "name": "Corrupt Deputy",
    "classification": "Human adversary",
    "keeperTag": "Internal affairs file · sealed",
    "kind": "human",
    "threat": "moderate",
    "environments": ["small town", "road", "jail"],
    "characteristics": { "STR": 60, "CON": 60, "SIZ": 65, "DEX": 55, "INT": 55, "POW": 50 },
    "hitPoints": 12,
    "magicPoints": 10,
    "move": 8,
    "build": 0,
    "damageBonus": "0",
    "armor": 1,
    "dodge": 35,
    "sanityLossFormula": "1d3",
    "description": "A law officer who protects a local conspiracy through intimidation, false arrest, planted evidence, and carefully staged violence.",
    "traits": ["Badge and authority: ordinary civilians hesitate before opposing the deputy.", "Protective vest provides 1 point of armor.", "Keeper cue: prefers arrest and isolation over a public gunfight."],
    "attacks": [
      { "id": "deputy-baton", "name": "Police Baton", "skill": 60, "damageFormula": "1d6", "notes": "Blunt close-combat attack." },
      { "id": "deputy-sidearm", "name": "Service Sidearm", "skill": 60, "damageFormula": "1d10", "notes": "Standard handgun attack." }
    ]
  },
  {
    "id": "coc-original-occult-surgeon",
    "name": "Occult Surgeon",
    "classification": "Human adversary",
    "keeperTag": "Medical board revocation · confidential",
    "kind": "human",
    "threat": "severe",
    "environments": ["clinic", "laboratory", "mansion"],
    "characteristics": { "STR": 45, "CON": 55, "SIZ": 55, "DEX": 70, "INT": 85, "POW": 75 },
    "hitPoints": 11,
    "magicPoints": 15,
    "move": 8,
    "build": 0,
    "damageBonus": "0",
    "armor": 0,
    "dodge": 40,
    "sanityLossFormula": "1d4",
    "description": "A brilliant physician who treats identity, memory, and anatomy as interchangeable materials in a private program of forbidden experiments.",
    "traits": ["Clinical precision: gains a Bonus die when performing prepared medical procedures.", "Sedative kit: may attempt to incapacitate a restrained target without dealing normal damage.", "Keeper cue: speaks calmly and documents every atrocity."],
    "attacks": [
      { "id": "surgeon-scalpel", "name": "Surgical Blade", "skill": 55, "damageFormula": "1d4+2", "notes": "A precise close-combat attack." },
      { "id": "surgeon-injector", "name": "Sedative Injector", "skill": 50, "damageFormula": "1d3", "notes": "On a successful opposed ruling, the target may become impaired or unconscious." }
    ]
  },
  {
    "id": "coc-original-grave-robber",
    "name": "Grave Robber",
    "classification": "Human adversary",
    "keeperTag": "Cemetery patrol report",
    "kind": "human",
    "threat": "low",
    "environments": ["cemetery", "catacombs", "ruins"],
    "characteristics": { "STR": 60, "CON": 60, "SIZ": 60, "DEX": 60, "INT": 50, "POW": 40 },
    "hitPoints": 12,
    "magicPoints": 8,
    "move": 8,
    "build": 0,
    "damageBonus": "0",
    "armor": 0,
    "dodge": 35,
    "sanityLossFormula": "1d2",
    "description": "A practical criminal who steals bodies and funerary objects, and who has learned not to ask why certain clients pay extra for intact hands and teeth.",
    "traits": ["Cemetery knowledge: gains a Bonus die to navigate burial grounds and service tunnels.", "Crowbar leverage: may use STR 70 for forced-entry attempts.", "Keeper cue: greed overcomes fear until something actually moves."],
    "attacks": [
      { "id": "robber-crowbar", "name": "Crowbar", "skill": 50, "damageFormula": "1d6", "notes": "Heavy improvised weapon." },
      { "id": "robber-shotgun", "name": "Cut-Down Shotgun", "skill": 40, "damageFormula": "2d6", "notes": "Devastating at close range; limited ammunition." }
    ]
  },
  {
    "id": "coc-original-zealous-antiquarian",
    "name": "Zealous Antiquarian",
    "classification": "Human adversary",
    "keeperTag": "Museum donor file · restricted",
    "kind": "human",
    "threat": "moderate",
    "environments": ["museum", "library", "estate"],
    "characteristics": { "STR": 35, "CON": 45, "SIZ": 50, "DEX": 50, "INT": 90, "POW": 80 },
    "hitPoints": 10,
    "magicPoints": 16,
    "move": 7,
    "build": 0,
    "damageBonus": "0",
    "armor": 0,
    "dodge": 25,
    "sanityLossFormula": "1d4",
    "description": "A celebrated collector who believes civilization must be sacrificed to preserve knowledge that predates humanity.",
    "traits": ["Forbidden scholarship: recognizes occult symbols and dead languages at a glance.", "Prepared wards: once per scene, spend 2 Magic Points to impose a Penalty die on an attacker.", "Keeper cue: destroys irreplaceable evidence rather than surrender it."],
    "attacks": [
      { "id": "antiquarian-cane", "name": "Sword Cane", "skill": 45, "damageFormula": "1d6+1", "notes": "Concealed edged weapon." },
      { "id": "antiquarian-command", "name": "Compelling Phrase", "skill": 60, "damageFormula": "1d4", "notes": "This roll represents Sanity pressure; the target may freeze or obey briefly at the Keeper's ruling." }
    ]
  }
];
