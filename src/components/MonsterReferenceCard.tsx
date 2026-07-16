import { useEffect, useState } from "react";
import type { MonsterCardData } from "../types/monsters";
import {
  estimateMonsterLayout,
  getMonsterPrintLayout,
  monsterRulesetLabel
} from "../utils/monsterCards";
import {
  RuleCardWorkspaceActions,
  type WorkspaceCardControls
} from "./RuleCardWorkspaceActions";
import { MonsterCardFace } from "./MonsterCardFace";
import { MonsterCardFlip } from "./MonsterCardFlip";
import { MonsterFolio } from "./MonsterFolio";
import { MonsterPortraitFace } from "./MonsterPortraitFace";

type MonsterReferenceCardProps = {
  monster: MonsterCardData;
  onDelete?: () => boolean;
  workspaceControls: WorkspaceCardControls;
};

export const MonsterReferenceCard = ({
  monster,
  onDelete,
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
    if (printLayout === "folio") setIsExpanded(true);
    setIsPrinting(true);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => window.print());
    });
  };

  const deleteMonster = () => {
    try {
      const confirmed = window.confirm(
        `Delete ${monster.name} from your personal Monster Library?`
      );
      if (confirmed) onDelete?.();
    } catch (error) {
      console.error("Confirming homebrew monster deletion failed", {
        monsterId: monster.id,
        error
      });
    }
  };

  return (
    <article
      className={`monster-reference monster-reference--${layout} monster-reference--print-${printLayout}${isPrinting ? " monster-reference--printing" : ""}`}
    >
      <MonsterCardFlip
        back={<MonsterCardFace monster={monster} />}
        front={(
          <MonsterPortraitFace
            challengeRating={monster.cr}
            name={monster.name}
            rulesetLabel={monsterRulesetLabel(monster)}
            size={monster.size}
            type={monster.type}
          />
        )}
        monsterName={monster.name}
      />
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
        {onDelete && (
          <button
            className="monster-reference__delete"
            onClick={deleteMonster}
            type="button"
          >
            Delete homebrew monster
          </button>
        )}
      </div>
      {isExpanded && <MonsterFolio monster={monster} />}
    </article>
  );
};
