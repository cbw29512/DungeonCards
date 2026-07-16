import { useEffect, useState } from "react";
import type { SrdMonsterRecord } from "../types/srdCompendium";
import {
  RuleCardWorkspaceActions,
  type WorkspaceCardControls
} from "./RuleCardWorkspaceActions";
import { SrdMonsterEncounterFace } from "./SrdMonsterEncounterFace";
import { SrdMonsterEncounterFolio } from "./SrdMonsterEncounterFolio";

type SrdMonsterEncounterCardProps = {
  monster: SrdMonsterRecord;
  workspaceControls: WorkspaceCardControls;
};

export const SrdMonsterEncounterCard = ({
  monster,
  workspaceControls
}: SrdMonsterEncounterCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const finishPrint = () => setIsPrinting(false);
    window.addEventListener("afterprint", finishPrint);
    return () => window.removeEventListener("afterprint", finishPrint);
  }, []);

  const printFolio = () => {
    setIsExpanded(true);
    setIsPrinting(true);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => window.print());
    });
  };

  return (
    <article
      className={`monster-reference monster-reference--accordion monster-reference--print-folio${isPrinting ? " monster-reference--printing" : ""}`}
    >
      <SrdMonsterEncounterFace monster={monster} />
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
          {isExpanded ? "Close full folio" : "Open full folio"}
        </button>
        <button onClick={printFolio} type="button">Print folio</button>
      </div>
      {isExpanded && <SrdMonsterEncounterFolio monster={monster} />}
    </article>
  );
};
