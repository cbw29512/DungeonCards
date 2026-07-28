import type {
  CocSpellPreview,
  CocWeaponPreview
} from "../types/coc";
import { cocCreatureCatalog } from "./cocCreatureCatalog";

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

export const cocPreviewCreature = cocCreatureCatalog.find(
  (creature) => creature.id === "coc-original-lantern-maw"
)!;
