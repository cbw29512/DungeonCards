import { getDndConditions } from "../data/dndConditions";
import { encounterMonsterCatalog, createHomebrewEncounterEntry } from "../data/encounterMonsterCatalog";
import { ruleCardCatalog } from "../data/ruleCardCatalog";
import { srdSpells } from "../data/srdCompendium";
import { generateDndVaultCardLibrary } from "../data/dndVaultCardLibrary";
import type { DndGameSystemId } from "../types/cardPlatform";
import type { CardPlatformExportEnvelope } from "../types/cardPlatformRuntime";
import type { HomebrewDiceCard } from "../types/cards";
import type { MonsterCardData } from "../types/monsters";
import { adaptDiceCard } from "./cardPlatformDiceAdapter";
import { adaptDndCondition } from "./cardPlatformDndConditionAdapter";
import { adaptEncounterMonster } from "./cardPlatformMonsterAdapter";
import { adaptRuleCard } from "./cardPlatformRuleAdapter";
import { adaptSrdSpell } from "./cardPlatformSrdSpellAdapter";
import { buildCardCatalog, collectCatalogDefinitions, type CardCatalogSource } from "./cardCatalogBuild";

const rulesetFor = (system: DndGameSystemId) => system === "dnd-2014"
  ? "srd-5.1-2014" as const
  : "srd-5.2.1-2024" as const;

export const buildDndCardCatalog = (
  gameSystemId: DndGameSystemId,
  homebrewCards: HomebrewDiceCard[],
  homebrewMonsters: MonsterCardData[],
  privateLibrary: CardPlatformExportEnvelope
) => {
  const ruleset = rulesetFor(gameSystemId);
  const rules = collectCatalogDefinitions("rules", ruleCardCatalog, (card) => adaptRuleCard(card, ruleset));
  const conditions = collectCatalogDefinitions(
    "conditions",
    getDndConditions(ruleset),
    adaptDndCondition
  );
  const spells = collectCatalogDefinitions(
    "spells",
    srdSpells.filter((spell) => spell.edition === ruleset),
    adaptSrdSpell
  );
  const monsters = collectCatalogDefinitions(
    "monsters",
    encounterMonsterCatalog.filter((entry) => entry.ruleset === ruleset),
    adaptEncounterMonster
  );
  const characters = generateDndVaultCardLibrary()
    .filter((bundle) => bundle.gameSystemId === gameSystemId)
    .flatMap((bundle) => bundle.definitions);
  const homebrewDice = collectCatalogDefinitions(
    "homebrew",
    homebrewCards.filter((card) => card.gameSystemId === gameSystemId),
    (card) => adaptDiceCard(card, {
      gameSystemId,
      visibility: "private",
      source: {
        kind: "user-owned-private",
        title: "Private homebrew card",
        edition: gameSystemId,
        publicDistributionAllowed: false
      }
    })
  );
  const homebrewCreatures = collectCatalogDefinitions(
    "homebrew",
    homebrewMonsters.map(createHomebrewEncounterEntry),
    (entry) => adaptEncounterMonster(entry, { homebrewGameSystemId: gameSystemId })
  );
  const sources: CardCatalogSource[] = [
    { id: "rules", label: "Built-in rule cards", ...rules },
    { id: "conditions", label: "D&D condition cards", ...conditions },
    { id: "spells", label: "Generated SRD spells", ...spells },
    { id: "monsters", label: "Generated SRD monsters", ...monsters },
    { id: "characters", label: "Character Vault", definitions: characters },
    {
      id: "homebrew",
      label: "Private homebrew",
      definitions: [...homebrewDice.definitions, ...homebrewCreatures.definitions],
      issues: [...homebrewDice.issues, ...homebrewCreatures.issues]
    },
    {
      id: "private",
      label: "Imported private library",
      definitions: privateLibrary.gameSystemId === gameSystemId ? privateLibrary.definitions : [],
      privateImported: true,
      issues: privateLibrary.gameSystemId === gameSystemId ? [] : ["Private library system did not match the selected catalog."]
    }
  ];
  return buildCardCatalog(gameSystemId, sources);
};
