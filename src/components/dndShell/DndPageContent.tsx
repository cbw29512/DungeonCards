import { dmRuleCards, playerRuleCards } from "../../data/ruleCardCatalog";
import type { DndAppPage } from "../../integration/dmForgeRoute";
import type { HomebrewCardDraft, HomebrewDiceCard } from "../../types/cards";
import type { MonsterCardData } from "../../types/monsters";
import { DndArmorLoadout } from "../DndArmorLoadout";
import { DndCardCatalog } from "../DndCardCatalog";
import { DndConditionsLibrary } from "../DndConditionsLibrary";
import { DndEncounterTracker } from "../DndEncounterTracker";
import { DndHealthTracker } from "../DndHealthTracker";
import { DndHomebrewWorkspace } from "../DndHomebrewWorkspace";
import { DndMovementLibrary } from "../DndMovementLibrary";
import { DndPregenLibrary } from "../DndPregenLibrary";
import { DndPrivateCardLibrary } from "../DndPrivateCardLibrary";
import { DndRulesGuide } from "../DndRulesGuide";
import { DndWeaponMasteryLibrary } from "../DndWeaponMasteryLibrary";
import { MonsterDeck } from "../MonsterDeck";
import { MonsterHomebrewBuilder } from "../MonsterHomebrewBuilder";
import { RulesCoverageDashboard } from "../RulesCoverageDashboard";
import { RulesDeck } from "../RulesDeck";
import { SrdCompendium } from "../SrdCompendium";
import { DndHome } from "./DndHome";

export type DndPageContentProps = {
  activePage: DndAppPage;
  homebrewCards: HomebrewDiceCard[];
  homebrewMonsters: MonsterCardData[];
  homebrewStorageError: string | null;
  monsterStorageError: string | null;
  migrationNotice: string | null;
  onCreateCard(draft: HomebrewCardDraft): boolean;
  onCreateMonster(draft: MonsterCardData): boolean;
  onDeleteCard(cardId: string): boolean;
  onDeleteMonster(monsterId: string): boolean;
  onNavigate(page: DndAppPage): void;
};

export const DndPageContent = (props: DndPageContentProps) => {
  const { activePage } = props;
  if (activePage === "home") return <DndHome onNavigate={props.onNavigate} />;
  if (activePage === "rules") return <DndRulesGuide />;
  if (activePage === "coverage") return <RulesCoverageDashboard />;
  if (activePage === "conditions") return <DndConditionsLibrary />;
  if (activePage === "movement") return <DndMovementLibrary />;
  if (activePage === "health") return <DndHealthTracker />;
  if (activePage === "combat") return <DndEncounterTracker />;
  if (activePage === "pregens") return <DndPregenLibrary />;
  if (activePage === "mastery") return <DndWeaponMasteryLibrary />;
  if (activePage === "armor") return <DndArmorLoadout />;
  if (activePage === "compendium") return <SrdCompendium />;
  if (activePage === "catalog") return <DndCardCatalog homebrewCards={props.homebrewCards} homebrewMonsters={props.homebrewMonsters} />;
  if (activePage === "library") return <DndPrivateCardLibrary />;

  if (activePage === "player") {
    return <RulesDeck cards={playerRuleCards} description="Add independent copies for one character and keep only the cards used at the table." eyebrow="player" role="player" title="Your personal cards, ready when initiative starts." />;
  }
  if (activePage === "dm") {
    return <RulesDeck cards={dmRuleCards} description="Build a focused table with checks, saves, traps, items, and generators." eyebrow="dm" role="dm" title="A focused DM screen backed by the full rules library." />;
  }
  if (activePage === "monster") {
    return <MonsterDeck homebrewMonsters={props.homebrewMonsters} libraryError={props.monsterStorageError} onDeleteHomebrewMonster={props.onDeleteMonster} />;
  }
  if (activePage === "homebrew") {
    return <DndHomebrewWorkspace cards={props.homebrewCards} migrationNotice={props.migrationNotice} onCreate={props.onCreateCard} onDelete={props.onDeleteCard} storageError={props.homebrewStorageError} />;
  }
  return <MonsterHomebrewBuilder libraryError={props.monsterStorageError} onSave={props.onCreateMonster} />;
};