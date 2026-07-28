import { cocCreatureCatalog } from "../data/cocCreatureCatalog";
import { cocInvestigatorCatalog } from "../data/cocInvestigatorCatalog";
import { cocRitualCatalog } from "../data/cocRitualCatalog";
import { cocWeaponCatalog } from "../data/cocWeaponCatalog";
import { cocQuickReferenceCards, getCocRuleSource } from "../data/cocRuleSources";
import type { CardPlatformExportEnvelope } from "../types/cardPlatformRuntime";
import { adaptCocCreature } from "./cardPlatformCocCreatureAdapter";
import { adaptCocInvestigator } from "./cardPlatformCocInvestigatorAdapter";
import { adaptCocQuickReference } from "./cardPlatformCocReferenceAdapter";
import { adaptCocSpell } from "./cardPlatformCocSpellAdapter";
import { adaptCocWeapon } from "./cardPlatformCocWeaponAdapter";
import { buildCardCatalog, collectCatalogDefinitions, type CardCatalogSource } from "./cardCatalogBuild";

export const buildCocCardCatalog = (privateLibrary: CardPlatformExportEnvelope) => {
  const procedures = collectCatalogDefinitions(
    "coc-procedures",
    cocQuickReferenceCards,
    (card) => adaptCocQuickReference(card, getCocRuleSource(card.sourceId))
  );
  const equipment = collectCatalogDefinitions(
    "coc-equipment",
    cocWeaponCatalog,
    (weapon) => adaptCocWeapon(weapon)
  );
  const rituals = collectCatalogDefinitions(
    "coc-rituals",
    cocRitualCatalog,
    (ritual) => adaptCocSpell(ritual)
  );
  const creatures = collectCatalogDefinitions(
    "coc-creatures",
    cocCreatureCatalog,
    (creature) => adaptCocCreature(creature, { source: getCocRuleSource("coc-original-creature-preview") })
  );
  const investigators = collectCatalogDefinitions(
    "coc-investigators",
    cocInvestigatorCatalog,
    (investigator) => adaptCocInvestigator(investigator)
  );
  const sources: CardCatalogSource[] = [
    { id: "coc-procedures", label: "Verified CoC procedures", ...procedures },
    { id: "coc-equipment", label: "Original weapon and equipment library", ...equipment },
    { id: "coc-rituals", label: "Original ritual and unnatural-effect library", ...rituals },
    { id: "coc-creatures", label: "Original creature and NPC library", ...creatures },
    { id: "coc-investigators", label: "Original premade Investigator library", ...investigators },
    {
      id: "private",
      label: "Imported private library",
      definitions: privateLibrary.gameSystemId === "coc-7e" ? privateLibrary.definitions : [],
      privateImported: true,
      issues: privateLibrary.gameSystemId === "coc-7e" ? [] : ["Private library system did not match Call of Cthulhu 7e."]
    }
  ];
  return buildCardCatalog("coc-7e", sources);
};
