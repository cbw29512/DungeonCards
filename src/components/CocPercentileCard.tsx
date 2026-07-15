import { useState } from "react";
import type {
  CocDifficulty,
  CocPercentileResult,
  CocRollMode,
  CocSuccessLevel
} from "../types/coc";
import { rollCocPercentile } from "../utils/cocPercentile";
import { CocRuleStatus } from "./CocRuleStatus";

const successLabels: Record<CocSuccessLevel, string> = {
  critical: "Critical Success",
  extreme: "Extreme Success",
  hard: "Hard Success",
  regular: "Regular Success",
  failure: "Failure",
  fumble: "Fumble"
};

const rollModeLabels: Record<CocRollMode, string> = {
  normal: "normal",
  bonus: "one Bonus die",
  "double-bonus": "two Bonus dice",
  penalty: "one Penalty die",
  "double-penalty": "two Penalty dice"
};

type CocPercentileCardProps = {
  defaultSkill?: number;
  eyebrow?: string;
  title?: string;
};

export const CocPercentileCard = ({
  defaultSkill = 65,
  eyebrow = "Investigator procedure",
  title = "Percentile Skill Check"
}: CocPercentileCardProps) => {
  const [skillValue, setSkillValue] = useState(defaultSkill);
  const [difficulty, setDifficulty] = useState<CocDifficulty>("regular");
  const [mode, setMode] = useState<CocRollMode>("normal");
  const [result, setResult] = useState<CocPercentileResult>();
  const [error, setError] = useState<string>();

  const roll = () => {
    try {
      setResult(rollCocPercentile(skillValue, difficulty, mode));
      setError(undefined);
    } catch (caught) {
      console.error("Percentile preview card failed", { skillValue, difficulty, mode, caught });
      setError(caught instanceof Error ? caught.message : "The percentile roll failed.");
    }
  };

  const outcomeClass = result ? ` coc-outcome--${result.successLevel}` : "";

  return (
    <article className={`coc-card coc-card--interactive${outcomeClass}`}>
      <header className="coc-card__header">
        <div>
          <small>{eyebrow}</small>
          <h2>{title}</h2>
        </div>
        <span className="coc-card__stamp">D100</span>
      </header>

      <p className="coc-card__summary">
        Enter the relevant skill and required difficulty. Apply the net Bonus or Penalty dice after opposing dice cancel.
      </p>

      <div className="coc-control-grid">
        <label>
          Skill value
          <input
            min="1"
            max="100"
            step="1"
            type="number"
            value={skillValue}
            onChange={(event) => {
              const next = Number(event.target.value);
              setSkillValue(Number.isFinite(next) ? Math.max(1, Math.min(100, Math.trunc(next))) : 1);
              setResult(undefined);
            }}
          />
        </label>

        <label>
          Difficulty
          <select value={difficulty} onChange={(event) => {
            setDifficulty(event.target.value as CocDifficulty);
            setResult(undefined);
          }}>
            <option value="regular">Regular</option>
            <option value="hard">Hard</option>
            <option value="extreme">Extreme</option>
          </select>
        </label>

        <label>
          Net dice modifier
          <select value={mode} onChange={(event) => {
            setMode(event.target.value as CocRollMode);
            setResult(undefined);
          }}>
            <option value="double-penalty">Two Penalty dice</option>
            <option value="penalty">One Penalty die</option>
            <option value="normal">Normal</option>
            <option value="bonus">One Bonus die</option>
            <option value="double-bonus">Two Bonus dice</option>
          </select>
        </label>
      </div>

      <div className="coc-thresholds" aria-label="Current success thresholds">
        <span><small>Regular</small><strong>{skillValue}</strong></span>
        <span><small>Hard</small><strong>{Math.floor(skillValue / 2)}</strong></span>
        <span><small>Extreme</small><strong>{Math.floor(skillValue / 5)}</strong></span>
      </div>

      <button className="coc-roll-button" type="button" onClick={roll}>
        Roll percentile dice
      </button>

      {result && (
        <section className="coc-roll-result" aria-live="polite">
          <div className="coc-dice-row" aria-label={`Rolled ${result.roll}`}>
            <div>
              <small>Tens</small>
              <strong>{result.tensDice.map((die) => `${die}0`).join(" · ")}</strong>
            </div>
            <span aria-hidden="true">+</span>
            <div>
              <small>Units</small>
              <strong>{result.unitDie}</strong>
            </div>
          </div>

          <strong className="coc-roll-result__total">{result.roll}</strong>
          <h3>{successLabels[result.successLevel]}</h3>
          <p>
            {result.meetsDifficulty
              ? `The roll meets the selected ${difficulty} difficulty.`
              : `The roll does not meet the selected ${difficulty} difficulty.`}
          </p>
          {result.candidates.length > 1 && (
            <small>
              Candidate results: {result.candidates.join(", ")}. The result for {rollModeLabels[result.mode]} was selected.
            </small>
          )}
        </section>
      )}

      <CocRuleStatus sourceId="coc-percentile-core" />
      <CocRuleStatus sourceId="coc-bonus-penalty-dice" />
      {error && <p className="coc-error" role="alert">{error}</p>}
    </article>
  );
};