import type { WorkspaceRole, WorkspaceView } from "../types/workspaces";

const roleLabel = (role: WorkspaceRole): string => {
  if (role === "player") return "Player Workspace";
  if (role === "dm") return "DM Workspace";
  return "Monster Encounter";
};

const tableLabel = (role: WorkspaceRole): string =>
  role === "monster" ? "My Encounter" : "My Table";

type WorkspaceToolbarProps = {
  role: WorkspaceRole;
  view: WorkspaceView;
  activeCount: number;
  totalCount: number;
  storageError?: string;
  onChangeView: (view: WorkspaceView) => void;
  onReset: () => void;
};

export const WorkspaceToolbar = ({
  role,
  view,
  activeCount,
  totalCount,
  storageError,
  onChangeView,
  onReset
}: WorkspaceToolbarProps) => (
  <div className="workspace-toolbar">
    <div>
      <strong>{roleLabel(role)}</strong>
      <span>Local profile • {activeCount} selected • {totalCount} in Library</span>
    </div>

    <div className="workspace-toolbar__actions">
      <div className="workspace-view-toggle" role="group" aria-label="Workspace view">
        <button
          aria-pressed={view === "table"}
          onClick={() => onChangeView("table")}
          type="button"
        >
          {tableLabel(role)}
        </button>
        <button
          aria-pressed={view === "library"}
          onClick={() => onChangeView("library")}
          type="button"
        >
          Library
        </button>
      </div>
      <button className="workspace-reset" onClick={onReset} type="button">
        Reset starter selection
      </button>
    </div>

    {storageError && <p className="workspace-error" role="alert">{storageError}</p>}
  </div>
);