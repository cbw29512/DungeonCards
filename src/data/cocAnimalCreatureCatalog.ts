import type { CocCreatureRecord } from "../types/coc";

export const cocAnimalCreatureCatalog: CocCreatureRecord[] = [
  {
    "id": "coc-original-marsh-hound",
    "name": "Marsh Hound",
    "classification": "Altered animal",
    "keeperTag": "Wetland incident log",
    "kind": "animal",
    "threat": "moderate",
    "environments": ["marsh", "swamp", "riverbank"],
    "characteristics": { "STR": 65, "CON": 70, "SIZ": 55, "DEX": 75, "INT": 20, "POW": 40 },
    "hitPoints": 13,
    "magicPoints": 8,
    "move": 10,
    "build": 0,
    "damageBonus": "0",
    "armor": 1,
    "dodge": 40,
    "sanityLossFormula": "1d4",
    "description": "A long-bodied hunting beast with translucent skin and lungs that pulse visibly as it tracks warm blood through fog.",
    "traits": ["Amphibious hunter: ignores movement penalties from mud and shallow water.", "Scent of fear: gains a Bonus die to track an injured investigator.", "Keeper cue: attacks from water and withdraws beneath the surface."],
    "attacks": [
      { "id": "marsh-hound-bite", "name": "Needle-Toothed Bite", "skill": 60, "damageFormula": "1d8", "notes": "May hold the target on an Extreme success." },
      { "id": "marsh-hound-pounce", "name": "Bog Pounce", "skill": 50, "damageFormula": "1d6", "notes": "May knock the target prone if the hound moved before attacking." }
    ]
  },
  {
    "id": "coc-original-glasswing-swarm",
    "name": "Glasswing Swarm",
    "classification": "Altered animal swarm",
    "keeperTag": "Agricultural quarantine notice",
    "kind": "animal",
    "threat": "moderate",
    "environments": ["fields", "greenhouse", "attic"],
    "characteristics": { "STR": 35, "CON": 60, "SIZ": 40, "DEX": 90, "INT": 10, "POW": 45 },
    "hitPoints": 10,
    "magicPoints": 9,
    "move": 12,
    "build": -1,
    "damageBonus": "-1d4",
    "armor": 0,
    "dodge": 60,
    "sanityLossFormula": "1d4",
    "description": "A cloud of transparent insects whose wings chime like thin glass and reflect scenes that occurred nearby days earlier.",
    "traits": ["Swarm body: ordinary single-target attacks deal at most 1 damage unless especially suitable.", "Memory shimmer: investigators studying the swarm may glimpse misleading fragments of the past.", "Keeper cue: fills enclosed spaces and drives victims toward hazards."],
    "attacks": [
      { "id": "glasswing-cut", "name": "Razor Wing Cloud", "skill": 65, "damageFormula": "1d6", "notes": "Affects one nearby target engulfed by the swarm." },
      { "id": "glasswing-dazzle", "name": "Reflected Memory", "skill": 55, "damageFormula": "1d3", "notes": "This damage represents Sanity loss caused by invasive images." }
    ]
  },
  {
    "id": "coc-original-ash-crowned-stag",
    "name": "Ash-Crowned Stag",
    "classification": "Altered animal",
    "keeperTag": "Forest service anomaly map",
    "kind": "animal",
    "threat": "severe",
    "environments": ["forest", "burn scar", "mountain"],
    "characteristics": { "STR": 90, "CON": 80, "SIZ": 85, "DEX": 70, "INT": 25, "POW": 65 },
    "hitPoints": 16,
    "magicPoints": 13,
    "move": 11,
    "build": 2,
    "damageBonus": "+1d6",
    "armor": 2,
    "dodge": 40,
    "sanityLossFormula": "1d6",
    "description": "A massive stag crowned in smoldering antlers. Its hoofprints fill with gray ash even when the ground is wet.",
    "traits": ["Cinder hide reduces ordinary physical damage by 2.", "Forest omen: animals flee and open flames gutter when it approaches.", "Keeper cue: charges anyone carrying an object taken from its territory."],
    "attacks": [
      { "id": "stag-gore", "name": "Burning Antlers", "skill": 65, "damageFormula": "1d10+1d6", "notes": "May knock the target down on an Extreme success." },
      { "id": "stag-trample", "name": "Trample", "skill": 55, "damageFormula": "2d6", "notes": "Usable after moving through an occupied space." }
    ]
  },
  {
    "id": "coc-original-cellar-brood",
    "name": "Cellar Brood",
    "classification": "Altered vermin colony",
    "keeperTag": "Condemned property inspection",
    "kind": "animal",
    "threat": "low",
    "environments": ["basement", "sewer", "pantry"],
    "characteristics": { "STR": 25, "CON": 55, "SIZ": 35, "DEX": 80, "INT": 15, "POW": 30 },
    "hitPoints": 9,
    "magicPoints": 6,
    "move": 9,
    "build": -1,
    "damageBonus": "-1d4",
    "armor": 0,
    "dodge": 50,
    "sanityLossFormula": "1d3",
    "description": "A coordinated colony of pale rats that moves as though sharing one nervous system and arranges stolen objects into crude diagrams.",
    "traits": ["Colony body: may pass through openings large enough for a rat.", "Shared senses: surprising one part of the brood does not surprise the whole.", "Keeper cue: steals keys, evidence, and small ritual objects before attacking."],
    "attacks": [
      { "id": "brood-bite", "name": "Hundred Bites", "skill": 55, "damageFormula": "1d4", "notes": "Armor protects normally." },
      { "id": "brood-surge", "name": "Swarming Surge", "skill": 45, "damageFormula": "1d3", "notes": "May impose a Penalty die on the target's next physical action." }
    ]
  },
  {
    "id": "coc-original-red-tide-eel",
    "name": "Red-Tide Eel",
    "classification": "Altered aquatic predator",
    "keeperTag": "Coastal research memorandum",
    "kind": "animal",
    "threat": "severe",
    "environments": ["coast", "harbor", "flooded tunnel"],
    "characteristics": { "STR": 85, "CON": 80, "SIZ": 90, "DEX": 60, "INT": 15, "POW": 50 },
    "hitPoints": 17,
    "magicPoints": 10,
    "move": 9,
    "build": 2,
    "damageBonus": "+1d6",
    "armor": 3,
    "dodge": 30,
    "sanityLossFormula": "1d6",
    "description": "A thick, crimson eel whose skin flashes with humanlike expressions just before it strikes from dark water.",
    "traits": ["Aquatic: suffers a Penalty die to physical actions when stranded on dry ground.", "Rubbery hide reduces ordinary physical damage by 3.", "Keeper cue: attacks boats, docks, and anyone carrying bloody objects."],
    "attacks": [
      { "id": "eel-bite", "name": "Circular Bite", "skill": 65, "damageFormula": "1d10+1d6", "notes": "May remain attached after a successful maneuver." },
      { "id": "eel-tail", "name": "Tail Sweep", "skill": 50, "damageFormula": "1d8", "notes": "May knock down nearby targets." }
    ]
  },
  {
    "id": "coc-original-cemetery-moth-cloud",
    "name": "Cemetery Moth Cloud",
    "classification": "Altered insect swarm",
    "keeperTag": "Funeral home contamination report",
    "kind": "animal",
    "threat": "moderate",
    "environments": ["cemetery", "morgue", "old house"],
    "characteristics": { "STR": 20, "CON": 65, "SIZ": 45, "DEX": 85, "INT": 20, "POW": 55 },
    "hitPoints": 11,
    "magicPoints": 11,
    "move": 10,
    "build": -1,
    "damageBonus": "-1d4",
    "armor": 0,
    "dodge": 55,
    "sanityLossFormula": "1d4",
    "description": "Large black moths marked with patterns resembling closed human eyes. Their scales carry the smell of old flowers and opened graves.",
    "traits": ["Swarm body: unsuitable weapons deal at most 1 damage.", "Breath thief: enclosed victims begin coughing and speaking in dead voices.", "Keeper cue: gathers around corpses and recent mourners."],
    "attacks": [
      { "id": "moth-smother", "name": "Smothering Cloud", "skill": 60, "damageFormula": "1d4", "notes": "May impose a Penalty die on speech and sight-based actions." },
      { "id": "moth-whisper", "name": "Borrowed Voice", "skill": 50, "damageFormula": "1d3", "notes": "This damage represents Sanity loss." }
    ]
  }
];
