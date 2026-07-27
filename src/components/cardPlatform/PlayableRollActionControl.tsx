import { useState } from "react";
import type { CardDefinition } from "../../types/cardPlatform";
import type { CardRollActionDefinition } from "../../types/cardPlatformActions";
import type { CardActionExecutionOptions, CardActionExecutionResult } from "../../types/cardActionExecution";
import type { AdvantageMode } from "../../types/ruleCards";
import type { CocDifficulty } from "../../types/coc";
import { CardActionCostSummary } from "./CardActionCostSummary";

type Props = {
  action: CardRollActionDefinition;
  definition: CardDefinition;
  result?: CardActionExecutionResult;
  onExecute(options: CardActionExecutionOptions): void;
};

export const PlayableRollActionControl = ({ action, definition, result, onExecute }: Props) => {
  const [advantageMode, setAdvantageMode] = useState<AdvantageMode>("normal");
  const [target, setTarget] = useState(action.percentileTarget?.toString() ?? "");
  const [difficulty, setDifficulty] = useState<CocDifficulty>(action.percentileDifficulty ?? "regular");
  const [bonusDice, setBonusDice] = useState(0);
  const [penaltyDice, setPenaltyDice] = useState(0);
  const execute = () => onExecute(action.rollSystem === "percentile" ? {
    percentileTarget: Number(target),
    percentileDifficulty: difficulty,
    bonusDice,
    penaltyDice
  } : { advantageMode });
  return (
    <article className="playable-card-action playable-card-action--roll">
      <header><div><small>{action.rollSystem.replaceAll("-", " ")}</small><strong>{action.label}</strong></div><CardActionCostSummary action={action} definition={definition} /></header>
      {action.rollSystem === "percentile" ? (
        <div className="playable-card-action__options">
          <label>Target<input max={100} min={1} onChange={(event) => setTarget(event.target.value)} type="number" value={target} /></label>
          <label>Difficulty<select onChange={(event) => setDifficulty(event.target.value as CocDifficulty)} value={difficulty}><option value="regular">Regular</option><option value="hard">Hard</option><option value="extreme">Extreme</option></select></label>
          <label>Bonus dice<select onChange={(event) => setBonusDice(Number(event.target.value))} value={bonusDice}><option value={0}>0</option><option value={1}>1</option><option value={2}>2</option></select></label>
          <label>Penalty dice<select onChange={(event) => setPenaltyDice(Number(event.target.value))} value={penaltyDice}><option value={0}>0</option><option value={1}>1</option><option value={2}>2</option></select></label>
        </div>
      ) : (
        <div className="playable-card-action__options">
          <code>{action.formula}</code>
          {action.rollSystem === "d20" && action.allowsAdvantage && <label>Mode<select onChange={(event) => setAdvantageMode(event.target.value as AdvantageMode)} value={advantageMode}><option value="normal">Normal</option><option value="advantage">Advantage</option><option value="disadvantage">Disadvantage</option></select></label>}
        </div>
      )}
      <button disabled={action.rollSystem === "percentile" && (!Number.isInteger(Number(target)) || Number(target) < 1 || Number(target) > 100)} onClick={execute} type="button">Roll {action.label}</button>
      {result?.actionKind === "roll" && <output className="playable-card-action__result"><strong>{result.summary}</strong>{result.resourceChanges.length > 0 && <span>{result.resourceChanges.map((change) => `${change.resourceId}: ${change.before}→${change.after}`).join(" · ")}</span>}</output>}
    </article>
  );
};
