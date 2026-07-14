import { useEffect, useState } from "react";
import type { MonsterCardData } from "../types/monsters";
import {
  estimateMonsterLayout,
  getMonsterPrintLayout
} from "../utils/monsterCards";
import {
  RuleCardWorkspaceActions,
  type WorkspaceCardControls
} from "./RuleCardWorkspaceActions";
import { MonsterCardFace } from "./MonsterCardFace";
import { MonsterFolio } from "./MonsterFolio";

type MonsterReferenceCardProps = {
  monster: MonsterCardData;
  workspaceControls: WorkspaceCardControls;
};

export const MonsterReferenceCard = ({
  monster,
  workspaceControls
}: MonsterReferenceCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const layout = estimateMonsterLayout(monster);
  const printLayout = getMonsterPrintLayout(monster);

  useEffect(() => {
    const finishPrint = () => setIsPrinting(false);
    window.addEventListener("afterprint", finishPrint);
    return () => window.removeEventListener("afterprint", finishPrint);
  }, []);

  const printMonster = () => {
    if (printLayout === "folio") {
      setIsExpanded(true);
    }

    setIsPrinting(true);

    // Two animation frames give React time to commit the print-only classes and,
    // for complex monsters, mount the folio before the browser opens print preview.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => window.print());
    });
  };

  return (
    <article
      className={`monster-reference monster-reference--${layout} monster-reference--print-${printLayout}${isPrinting ? " monster-reference--printing" : ""}`}
    >
      <MonsterCardFace monster={monster} />
      <RuleCardWorkspaceActions
        cardName={monster.name}
        collectionLabel="My Encounter"
        controls={workspaceControls}
      />
      <div className="monster-reference__actions">
        <button
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((current) => !current)}
          type="button"
        >
          {isExpanded ? "Close full folio" : layout === "accordion" ? "Open boss folio" : "Open full card"}
        </button>
        <button onClick={printMonster} type="button">
          {printLayout === "card" ? "Print card" : "Print folio"}
        </button>
      </div>
      {isExpanded && <MonsterFolio monster={monster} />}
    </article>
  );
};
