import { useEffect, useState } from "react";
import type { MonsterCardData } from "../types/monsters";
import { estimateMonsterLayout } from "../utils/monsterCards";
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

  useEffect(() => {
    const finishPrint = () => setIsPrinting(false);
    window.addEventListener("afterprint", finishPrint);
    return () => window.removeEventListener("afterprint", finishPrint);
  }, []);

  const printMonster = () => {
    setIsExpanded(true);
    setIsPrinting(true);
    window.requestAnimationFrame(() => window.print());
  };

  return (
    <article
      className={`monster-reference monster-reference--${layout}${isPrinting ? " monster-reference--printing" : ""}`}
    >
      <MonsterCardFace monster={monster} />
      <RuleCardWorkspaceActions
        cardName={monster.name}
        collectionLabel="My Encounter"
        controls={workspaceControls}
      />
      <div className="monster-reference__actions">
        <button onClick={() => setIsExpanded((current) => !current)} type="button">
          {isExpanded ? "Close full folio" : layout === "accordion" ? "Open boss folio" : "Open full card"}
        </button>
        <button onClick={printMonster} type="button">Print monster</button>
      </div>
      {isExpanded && <MonsterFolio monster={monster} />}
    </article>
  );
};