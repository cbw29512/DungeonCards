import type {
  CocCreaturePreview,
  CocSpellPreview,
  CocWeaponPreview
} from "../types/coc";

export const cocPreviewWeapon: CocWeaponPreview = {
  id: "coc-preview-service-revolver",
  name: "Service Revolver",
  category: "Handgun",
  skillName: "Firearms (Handgun)",
  defaultSkill: 55,
  damageFormula: "1d10",
  capacity: 6,
  malfunction: 100,
  range: "15 yards",
  attacksPerRound: "1–3",
  impaling: true,
  notes: "Prototype weapon entry using original summary text. Multiple shots may add a Penalty die at the Keeper's direction."
};

export const cocPreviewSpell: CocSpellPreview = {
  id: "coc-preview-hollow-star",
  name: "Veil of the Hollow Star",
  castingTime: "1 combat round",
  magicPointCost: 3,
  sanityCostFormula: "1d4",
  castingSkillName: "POW",
  defaultCastingSkill: 65,
  range: "30 yards",
  duration: "1d6",
  summary: "An original prototype ritual that folds dim, impossible light around one nearby target. On success, the target becomes difficult to perceive until the veil collapses.",
  failure: "The caster still pays the Magic Point cost. The Keeper may introduce an unsettling sign or unwanted attention."
};

export const cocPreviewCreature: CocCreaturePreview = {
  id: "coc-preview-lantern-maw",
  name: "The Lantern Maw",
  classification: "Original Mythos-adjacent prototype",
  keeperTag: "Restricted case file · specimen LM-17",
  characteristics: {
    STR: 80,
    CON: 70,
    SIZ: 75,
    DEX: 55,
    INT: 35,
    POW: 60
  },
  hitPoints: 18,
  magicPoints: 12,
  move: 8,
  build: 1,
  damageBonus: "+1d4",
  armor: 2,
  dodge: 30,
  sanityLossFormula: "1d6",
  description: "A hunched silhouette with a lantern-like cavity where its face should be. The light does not illuminate the room; it reveals things that should remain unseen.",
  traits: [
    "Skin like wet parchment: reduce ordinary physical damage by 2.",
    "Unlight: nearby electric lamps dim when it spends 1 Magic Point.",
    "Keeper cue: it isolates investigators before committing to violence."
  ],
  attacks: [
    {
      id: "lantern-maw-rake",
      name: "Hooked Rake",
      skill: 55,
      damageFormula: "1d8+1d4",
      notes: "A successful attack drags the target several feet toward the creature."
    },
    {
      id: "lantern-maw-glare",
      name: "Impossible Glare",
      skill: 45,
      damageFormula: "1d6",
      notes: "Treat the damage roll as Sanity loss for this original prototype power."
    }
  ]
};
