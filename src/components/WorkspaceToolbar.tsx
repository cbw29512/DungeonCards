import type { WorkspaceRole, WorkspaceView } from "../types/workspaces";

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
      <strong>{role === "player" ? "Player Workspace" : "DM Workspace"}</strong>
      <span>Local profile • {activeCount} on My Table • {totalCount} in Library</span>
    </div>

    <div className="workspace-toolbar__actions">
      <div className="workspace-view-toggle" role="group" aria-label="Workspace view">
        <button
          aria-pressed={view === "table"}
          onClick={() => onChangeView("table")}
          type="button"
        >
          My Table
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
        Reset starter table
      </button>
    </div>

    {storageError && <p className="workspace-error" role="alert">{storageError}</p>}
  </div>
);