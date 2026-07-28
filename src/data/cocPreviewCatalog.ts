import type { CocSpellPreview } from "../types/coc";
import { cocCreatureCatalog } from "./cocCreatureCatalog";
import { cocWeaponCatalog } from "./cocWeaponCatalog";

export const cocPreviewWeapon = cocWeaponCatalog.find(
  (weapon) => weapon.id === "coc-original-service-revolver"
)!;

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
