import type { CocCreatureRecord } from "../types/coc";

export const cocEntityCreatureCatalog: CocCreatureRecord[] = [
  {
    id: "coc-original-pale-astronomer",
    name: "The Pale Astronomer",
    classification: "Major entity",
    keeperTag: "Observatory exclusion protocol",
    kind: "entity",
    threat: "catastrophic",
    environments: ["observatory", "mountaintop", "dream"],
    characteristics: {"STR": 60, "CON": 120, "SIZ": 80, "DEX": 65, "INT": 130, "POW": 140},
    hitPoints: 20,
    magicPoints: 28,
    move: 8,
    build: 1,
    damageBonus: "+1d4",
    armor: 6,
    dodge: 40,
    sanityLossFormula: "2d6",
    description: "A colorless figure in antique observatory robes whose face is a rotating map of stars that do not belong to Earth's sky.",
    traits: ["Remote manifestation: destroying the visible body only ends the current appearance.", "Celestial calculation: cannot be surprised by ordinary movement under an open sky.", "Keeper cue: rearranges people and events to complete a geometric observation."],
    attacks: [
      {"id": "astronomer-ray", "name": "Cold Starlight", "skill": 75, "damageFormula": "2d6", "notes": "Ignores ordinary darkness and may pass through glass."},
      {"id": "astronomer-alignment", "name": "Impossible Alignment", "skill": 80, "damageFormula": "1d10", "notes": "This damage represents Sanity loss; victims perceive themselves from far above."}
    ]
  },
  {
    id: "coc-original-listening-house",
    name: "The House That Listens",
    classification: "Major entity",
    keeperTag: "Property condemned · do not enter",
    kind: "entity",
    threat: "catastrophic",
    environments: ["haunted house", "dream", "suburb"],
    characteristics: {"STR": 130, "CON": 150, "SIZ": 180, "DEX": 20, "INT": 90, "POW": 120},
    hitPoints: 33,
    magicPoints: 24,
    move: 0,
    build: 5,
    damageBonus: "+2d6",
    armor: 8,
    dodge: 0,
    sanityLossFormula: "2d6",
    description: "An occupied-looking house whose rooms rearrange around private conversations. Pipes carry whispers, doors breathe, and every wall is warm.",
    traits: ["Location body: it cannot move, but every interior room counts as part of the entity.", "Rearrange floor plan: spend 2 Magic Points to seal, open, or relocate an interior passage.", "Keeper cue: learns secrets first, then recreates them as rooms."],
    attacks: [
      {"id": "house-crush", "name": "Closing Room", "skill": 70, "damageFormula": "2d6+2d6", "notes": "Walls, floor, or ceiling compress around occupants."},
      {"id": "house-confession", "name": "Compelled Confession", "skill": 75, "damageFormula": "1d8", "notes": "This damage represents Sanity loss; the house repeats a hidden truth."}
    ]
  },
  {
    id: "coc-original-drowned-parliament",
    name: "The Drowned Parliament",
    classification: "Major entity",
    keeperTag: "Offshore exclusion zone",
    kind: "entity",
    threat: "catastrophic",
    environments: ["sea", "flooded city", "storm"],
    characteristics: {"STR": 140, "CON": 160, "SIZ": 170, "DEX": 35, "INT": 100, "POW": 130},
    hitPoints: 33,
    magicPoints: 26,
    move: 7,
    build: 5,
    damageBonus: "+2d6",
    armor: 7,
    dodge: 15,
    sanityLossFormula: "2d6",
    description: "Dozens of water-swollen figures fused into a walking assembly that debates in overlapping voices beneath a single crown of seaweed.",
    traits: ["Many bodies: effects that depend on a single anatomy are ineffective.", "Flood vote: spend 3 Magic Points to force water through cracks and drains across a scene.", "Keeper cue: demands unanimous agreement and punishes dissent."],
    attacks: [
      {"id": "parliament-hands", "name": "Unanimous Grasp", "skill": 75, "damageFormula": "2d6+2d6", "notes": "May seize several nearby targets narratively."},
      {"id": "parliament-decree", "name": "Drowning Decree", "skill": 80, "damageFormula": "1d10", "notes": "This damage represents Sanity loss and may compel a target to stop speaking."}
    ]
  },
  {
    id: "coc-original-crownless-king",
    name: "The Crownless King",
    classification: "Major entity",
    keeperTag: "Dynastic archive · black seal",
    kind: "entity",
    threat: "catastrophic",
    environments: ["ruins", "palace", "dream"],
    characteristics: {"STR": 120, "CON": 140, "SIZ": 110, "DEX": 55, "INT": 120, "POW": 150},
    hitPoints: 25,
    magicPoints: 30,
    move: 8,
    build: 3,
    damageBonus: "+1d6",
    armor: 7,
    dodge: 30,
    sanityLossFormula: "2d6",
    description: "A towering monarch in rotted formal dress whose absent crown casts a visible shadow above an empty skull.",
    traits: ["Royal denial: ordinary commands, intimidation, and social authority cannot move it.", "Audience of one: spend 3 Magic Points to isolate one mind in a silent throne room.", "Keeper cue: offers power in exchange for recognition of a forgotten claim."],
    attacks: [
      {"id": "king-scepter", "name": "Broken Scepter", "skill": 75, "damageFormula": "2d6+1d6", "notes": "A crushing close-combat attack."},
      {"id": "king-edict", "name": "Edict of Submission", "skill": 85, "damageFormula": "1d10", "notes": "This damage represents Sanity loss; the target may kneel or lose their next action."}
    ]
  }
];
