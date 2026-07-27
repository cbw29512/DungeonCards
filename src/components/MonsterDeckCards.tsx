import type { EncounterMonsterEntry } from "../types/encounterMonsters";
import type { WorkspaceView } from "../types/workspaces";
import { MonsterReferenceCard } from "./MonsterReferenceCard";
import { SrdMonsterEncounterCard } from "./SrdMonsterEncounterCard";

type Props = {
  entries: EncounterMonsterEntry[];
  activeEntries: EncounterMonsterEntry[];
  activeCardIds: string[];
  pinnedCardIds: string[];
  view: WorkspaceView;
  onAdd(cardId: string): void;
  onDeleteHomebrew(monsterId: string): void;
  onMove(cardId: string, direction: "earlier" | "later"): void;
  onRemove(cardId: string): void;
  onTogglePin(cardId: string): void;
};

export const MonsterDeckCards = ({
  entries,
  activeEntries,
  activeCardIds,
  pinnedCardIds,
  view,
  onAdd,
  onDeleteHomebrew,
  onMove,
  onRemove,
  onTogglePin
}: Props) => (
  <div className="monster-grid">
    {entries.map((entry) => {
      const isActive = activeCardIds.includes(entry.id);
      const isPinned = pinnedCardIds.includes(entry.id);
      const tableIndex = activeEntries.findIndex((item) => item.id === entry.id);
      const previous = activeEntries[tableIndex - 1];
      const next = activeEntries[tableIndex + 1];
      const previousMatches = previous !== undefined
        && pinnedCardIds.includes(previous.id) === isPinned;
      const nextMatches = next !== undefined
        && pinnedCardIds.includes(next.id) === isPinned;
      const workspaceControls = {
        view,
        isActive,
        isPinned,
        canMoveEarlier: view === "table" && previousMatches,
        canMoveLater: view === "table" && nextMatches,
        onToggleActive: () => isActive ? onRemove(entry.id) : onAdd(entry.id),
        onTogglePin: () => onTogglePin(entry.id),
        onMoveEarlier: () => onMove(entry.id, "earlier" as const),
        onMoveLater: () => onMove(entry.id, "later" as const)
      };

      if (entry.kind === "reference") {
        return (
          <SrdMonsterEncounterCard
            key={entry.id}
            monster={entry.monster}
            workspaceControls={workspaceControls}
          />
        );
      }

      return (
        <MonsterReferenceCard
          key={entry.id}
          monster={entry.monster}
          onDelete={view === "library" && entry.ruleset === "homebrew"
            ? () => onDeleteHomebrew(entry.id)
            : undefined}
          workspaceControls={workspaceControls}
        />
      );
    })}
  </div>
);
