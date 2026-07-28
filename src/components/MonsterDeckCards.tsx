import type { EncounterMonsterEntry } from "../types/encounterMonsters";
import type { ResolvedMonsterEncounterInstance } from "../types/monsterEncounterWorkspace";
import type { WorkspaceMoveDirection, WorkspaceView } from "../types/workspaces";
import { MonsterEncounterInstanceControls } from "./MonsterEncounterInstanceControls";
import { MonsterReferenceCard } from "./MonsterReferenceCard";
import { SrdMonsterEncounterCard } from "./SrdMonsterEncounterCard";

const renderMonsterCard = (
  entry: EncounterMonsterEntry,
  workspaceControls: Parameters<typeof SrdMonsterEncounterCard>[0]["workspaceControls"],
  options: {
    key: string;
    label?: string;
    onDeleteHomebrew?: () => boolean;
  }
) => entry.kind === "reference" ? (
  <SrdMonsterEncounterCard
    key={options.key}
    monster={entry.monster}
    workspaceControls={workspaceControls}
    workspaceLabel={options.label}
  />
) : (
  <MonsterReferenceCard
    key={options.key}
    monster={entry.monster}
    onDelete={options.onDeleteHomebrew}
    workspaceControls={workspaceControls}
    workspaceLabel={options.label}
  />
);

type Props = {
  entries: EncounterMonsterEntry[];
  activeInstances: ResolvedMonsterEncounterInstance[];
  view: WorkspaceView;
  countCopies(monsterId: string): number;
  onAdd(monsterId: string): void;
  onDeleteHomebrew(monsterId: string): boolean;
  onMove(instanceId: string, direction: WorkspaceMoveDirection): void;
  onRemove(instanceId: string): void;
  onTogglePin(instanceId: string): void;
  onRename(instanceId: string, label: string): void;
  onSetHitPoints(instanceId: string, value: number): void;
  onSetInitiative(instanceId: string, value: number | null): void;
  onAddCondition(instanceId: string, condition: string): void;
  onRemoveCondition(instanceId: string, condition: string): void;
  onSetReaction(instanceId: string, available: boolean): void;
  onSetRecharge(instanceId: string, ready: boolean): void;
  onSetLegendaryRemaining(instanceId: string, remaining: number): void;
  onStartTurn(instanceId: string): void;
};

export const MonsterDeckCards = ({
  entries,
  activeInstances,
  view,
  countCopies,
  onAdd,
  onDeleteHomebrew,
  onMove,
  onRemove,
  onTogglePin,
  onRename,
  onSetHitPoints,
  onSetInitiative,
  onAddCondition,
  onRemoveCondition,
  onSetReaction,
  onSetRecharge,
  onSetLegendaryRemaining,
  onStartTurn
}: Props) => {
  if (view === "library") {
    return (
      <div className="monster-grid monster-grid--library">
        {entries.map((entry) => {
          const copyCount = countCopies(entry.id);
          return renderMonsterCard(entry, {
            view,
            isActive: copyCount > 0,
            isPinned: false,
            canMoveEarlier: false,
            canMoveLater: false,
            allowDuplicates: true,
            copyCount,
            onToggleActive: () => onAdd(entry.id),
            onTogglePin: () => {},
            onMoveEarlier: () => {},
            onMoveLater: () => {}
          }, {
            key: entry.id,
            onDeleteHomebrew: entry.ruleset === "homebrew"
              ? () => onDeleteHomebrew(entry.id)
              : undefined
          });
        })}
      </div>
    );
  }

  return (
    <div className="monster-instance-grid">
      {activeInstances.map((instance, index) => {
        const previous = activeInstances[index - 1];
        const next = activeInstances[index + 1];
        const workspaceControls = {
          view,
          isActive: true,
          isPinned: instance.pinned,
          canMoveEarlier: previous !== undefined && previous.pinned === instance.pinned,
          canMoveLater: next !== undefined && next.pinned === instance.pinned,
          onToggleActive: () => onRemove(instance.instanceId),
          onTogglePin: () => onTogglePin(instance.instanceId),
          onMoveEarlier: () => onMove(instance.instanceId, "earlier"),
          onMoveLater: () => onMove(instance.instanceId, "later")
        };

        return (
          <article className="monster-instance" key={instance.instanceId}>
            <MonsterEncounterInstanceControls
              instance={instance}
              onAddCondition={(condition) => onAddCondition(instance.instanceId, condition)}
              onRemoveCondition={(condition) => onRemoveCondition(instance.instanceId, condition)}
              onRename={(label) => onRename(instance.instanceId, label)}
              onSetHitPoints={(value) => onSetHitPoints(instance.instanceId, value)}
              onSetInitiative={(value) => onSetInitiative(instance.instanceId, value)}
              onSetLegendaryRemaining={(value) => onSetLegendaryRemaining(instance.instanceId, value)}
              onSetReaction={(available) => onSetReaction(instance.instanceId, available)}
              onSetRecharge={(ready) => onSetRecharge(instance.instanceId, ready)}
              onStartTurn={() => onStartTurn(instance.instanceId)}
            />
            {renderMonsterCard(instance.monster, workspaceControls, {
              key: `${instance.instanceId}-card`,
              label: instance.label
            })}
          </article>
        );
      })}
    </div>
  );
};