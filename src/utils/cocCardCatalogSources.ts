import { cocPreviewCreature, cocPreviewSpell, cocPreviewWeapon } from "../data/cocPreviewCatalog";
import { cocQuickReferenceCards, getCocRuleSource } from "../data/cocRuleSources";
import type { CardPlatformExportEnvelope } from "../types/cardPlatformRuntime";
import { adaptCocCreature } from "./cardPlatformCocCreatureAdapter";
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
    [cocPreviewWeapon],
    (weapon) => adaptCocWeapon(weapon, { source: getCocRuleSource("coc-original-weapon-preview") })
  );
  const rituals = collectCatalogDefinitions(
    "coc-rituals",
    [cocPreviewSpell],
    (spell) => adaptCocSpell(spell, { source: getCocRuleSource("coc-original-spell-preview") })
  );
  const creatures = collectCatalogDefinitions(
    "coc-creatures",
    [cocPreviewCreature],
    (creature) => adaptCocCreature(creature, { source: getCocRuleSource("coc-original-creature-preview") })
  );
  const sources: CardCatalogSource[] = [
    { id: "coc-procedures", label: "Verified CoC procedures", ...procedures },
    { id: "coc-equipment", label: "Original equipment demonstrations", ...equipment },
    { id: "coc-rituals", label: "Original ritual demonstrations", ...rituals },
    { id: "coc-creatures", label: "Original creature demonstrations", ...creatures },
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
