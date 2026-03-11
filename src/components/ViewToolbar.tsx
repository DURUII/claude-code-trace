import type { ViewState } from "../types";

interface ViewToolbarProps {
  view: ViewState;
  hasTeams: boolean;
  hasSession: boolean;
  messageCount: number;
  onGoToSessions: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onJumpTop: () => void;
  onJumpBottom: () => void;
  onOpenTeams: () => void;
  onOpenDebug: () => void;
  onBackToList: () => void;
}

export function ViewToolbar({
  view,
  hasTeams,
  hasSession,
  messageCount,
  onGoToSessions,
  onExpandAll,
  onCollapseAll,
  onJumpTop,
  onJumpBottom,
  onOpenTeams,
  onOpenDebug,
  onBackToList,
}: ViewToolbarProps) {
  if (view === "list") {
    return (
      <div className="view-toolbar">
        <button className="view-toolbar__btn" onClick={onGoToSessions}>
          &larr; Sessions
        </button>
        <button className="view-toolbar__btn" onClick={onExpandAll}>
          Expand All
        </button>
        <button className="view-toolbar__btn" onClick={onCollapseAll}>
          Collapse All
        </button>
        <span className="view-toolbar__separator" />
        <button
          className="view-toolbar__btn"
          onClick={onJumpTop}
          disabled={messageCount === 0}
        >
          Top
        </button>
        <button
          className="view-toolbar__btn"
          onClick={onJumpBottom}
          disabled={messageCount === 0}
        >
          Bottom
        </button>
        <span className="view-toolbar__separator" />
        {hasTeams && (
          <button className="view-toolbar__btn" onClick={onOpenTeams}>
            Teams
          </button>
        )}
        <button className="view-toolbar__btn" onClick={onOpenDebug}>
          Debug
        </button>
      </div>
    );
  }

  if (view === "picker") {
    return hasSession ? (
      <div className="view-toolbar">
        <button className="view-toolbar__btn" onClick={onBackToList}>
          &larr; Back to Messages
        </button>
      </div>
    ) : null;
  }

  // detail, team, debug views have their own back buttons
  return null;
}
