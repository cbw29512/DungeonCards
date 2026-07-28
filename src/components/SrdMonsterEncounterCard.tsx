import { useEffect, useState } from "react";
import type { SrdMonsterRecord } from "../types/srdCompendium";
import { RULESET_LABELS } from "../types/ruleCards";
import {
  RuleCardWorkspaceActions,
  type WorkspaceCardControls
} from "./RuleCardWorkspaceActions";
import { MonsterCardFlip } from "./MonsterCardFlip";
import { MonsterPortraitFace } from "./MonsterPortraitFace";
import { SrdMonsterEncounterFace } from "./SrdMonsterEncounterFace";
import { SrdMonsterEncounterFolio } from "./SrdMonsterEncounterFolio";

type SrdMonsterEncounterCardProps = {
  monster: SrdMonsterRecord;
  workspaceControls: WorkspaceCardControls;
  workspaceLabel?: string;
};

export const SrdMonsterEncounterCard = ({
  monster,
  workspaceControls,
  workspaceLabel
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
      <MonsterCardFlip
        back={<SrdMonsterEncounterFace monster={monster} />}
        front={(
          <MonsterPortraitFace
            challengeRating={monster.challenge}
            name={monster.name}
            ruleset={monster.edition}
            rulesetLabel={RULESET_LABELS[monster.edition]}
            size={monster.size}
            type={monster.type}
          />
        )}
        monsterName={workspaceLabel ?? monster.name}
      />
      <RuleCardWorkspaceActions
        cardName={workspaceLabel ?? monster.name}
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