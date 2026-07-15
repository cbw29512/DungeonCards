import type { WorkspaceView } from "../types/workspaces";

export type WorkspaceCardControls = {
  view: WorkspaceView;
  isActive: boolean;
  isPinned: boolean;
  canMoveEarlier: boolean;
  canMoveLater: boolean;
  allowDuplicates?: boolean;
  copyCount?: number;
  onRename?: () => void;
  onToggleActive: () => void;
  onTogglePin: () => void;
  onMoveEarlier: () => void;
  onMoveLater: () => void;
};

type RuleCardWorkspaceActionsProps = {
  cardName: string;
  controls: WorkspaceCardControls;
  collectionLabel?: string;
};

export const RuleCardWorkspaceActions = ({
  cardName,
  controls,
  collectionLabel = "My Table"
}: RuleCardWorkspaceActionsProps) => {
  if (controls.view === "library") {
    const duplicateLabel = controls.copyCount
      ? `Add another to ${collectionLabel} (${controls.copyCount} ready)`
      : `Add to ${collectionLabel}`;

    return (
      <div className="rule-card__workspace-actions">
        <button onClick={controls.onToggleActive} type="button">
          {controls.allowDuplicates
            ? duplicateLabel
            : controls.isActive
              ? `Remove from ${collectionLabel}`
              : `Add to ${collectionLabel}`}
        </button>
      </div>
    );
  }

  return (
    <div className="rule-card__workspace-actions rule-card__workspace-actions--table">
      <button
        aria-pressed={controls.isPinned}
        onClick={controls.onTogglePin}
        title={`${controls.isPinned ? "Unpin" : "Pin"} ${cardName}`}
        type="button"
      >
        {controls.isPinned ? "Unpin" : "Pin"}
      </button>
      {controls.onRename && (
        <button onClick={controls.onRename} title={`Rename ${cardName}`} type="button">
          Name
        </button>
      )}
      <button
        aria-label={`Move ${cardName} earlier`}
        disabled={!controls.canMoveEarlier}
        onClick={controls.onMoveEarlier}
        title="Move earlier"
        type="button"
      >
        ←
      </button>
      <button
        aria-label={`Move ${cardName} later`}
        disabled={!controls.canMoveLater}
        onClick={controls.onMoveLater}
        title="Move later"
        type="button"
      >
        →
      </button>
      <button onClick={controls.onToggleActive} type="button">Remove</button>
    </div>
  );
};
