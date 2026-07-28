import { cocCreatureCatalog } from "./cocCreatureCatalog";
import { cocRitualCatalog } from "./cocRitualCatalog";
import { cocWeaponCatalog } from "./cocWeaponCatalog";

export const cocPreviewWeapon = cocWeaponCatalog.find(
  (weapon) => weapon.id === "coc-original-service-revolver"
)!;

export const cocPreviewSpell = cocRitualCatalog.find(
  (ritual) => ritual.id === "coc-original-lantern-ward"
)!;

export const cocPreviewCreature = cocCreatureCatalog.find(
  (creature) => creature.id === "coc-original-lantern-maw"
)!;
