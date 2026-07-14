import { useState } from "react";
import type { CocPercentileResult, CocSuccessLevel } from "../types/coc";
import {
  resolveCocCloseCombat,
  resolveCocGenericOpposed,
  type CocCloseCombatResponse,
  type CocGenericOpposedResolution
} from "../utils/cocOpposed";
import { rollCocPercentile } from "../utils/cocPercentile";
import { secureRandomInteger } from "../utils/randomInteger";
import { CocRuleStatus } from "./CocRuleStatus";

type ResolverMode = "opposed" | CocCloseCombatResponse;

const successLabels: Record<CocSuccessLevel, string> = {
  critical: "Critical",
  extreme: "Extreme",
  hard: "Hard",
  regular: "Regular",
  failure: "Failure",
  fumble: "Fumble"
};

export const CocOpposedCard = () => {
  const [mode, setMode] = useState<ResolverMode>("opposed");
  const [attackerSkill, setAttackerSkill] = useState(60);
  const [defenderSkill, setDefenderSkill] = useState(50);
  const [attackerResult, setAttackerResult] = useState<CocPercentileResult>();
  const [defenderResult, setDefenderResult] = useState<CocPercentileResult>();
  const [resolution, setResolution] = useState<CocGenericOpposedResolution | { outcome: string; reason: string }>();
  const [error, setError] = useState<string>();

  const clearResults = () => {
    setAttackerResult(undefined);
    setDefenderResult(undefined);
    setResolution(undefined);
  };

  const rollContest = () => {
    try {
      const attacker = rollCocPercentile(attackerSkill);
      const defender = rollCocPercentile(defenderSkill);
      setAttackerResult(attacker);
      setDefenderResult(defender);

      if (mode === "opposed") {
        setResolution(resolveCocGenericOpposed(
          { label: "Side A", skillValue: attackerSkill, result: attacker },
          { label: "Side B", skillValue: defenderSkill, result: defender }
        ));
      } else {
        setResolution(resolveCocCloseCombat(attacker, defender, mode));
      }
      setError(undefined);
    } catch (caught) {
      console.error("CoC opposed card failed", { mode, attackerSkill, defenderSkill, caught });
      setError(caught instanceof Error ? caught.message : "The opposed roll failed.");
    }
  };

  const rollTieBreak = () => {
    try {
      if (!attackerResult || !defenderResult || mode !== "opposed") {
        throw new Error("An equal-skill opposed result is required before rolling a tie-break.");
      }
      const sideARoll = secureRandomInteger(1, 100);
      const sideBRoll = secureRandomInteger(1, 100);
      setResolution(resolveCocGenericOpposed(
        { label: "Side A", skillValue: attackerSkill, result: attackerResult },
        { label: "Side B", skillValue: defenderSkill, result: defenderResult },
        { sideARoll, sideBRoll }
      ));
      setError(undefined);
    } catch (caught) {
      console.error("CoC opposed tie-break failed", { caught });
      setError(caught instanceof Error ? caught.message : "The tie-break failed.");
    }
  };

  return (
    <article className="coc-card coc-card--interactive">
      <header className="coc-card__header">
        <div>
          <small>Resolution procedure</small>
          <h2>Opposed & Close Combat</h2>
        </div>
        <span className="coc-card__stamp">VS</span>
      </header>

      <p className="coc-card__summary">
        Generic opposed rolls and close combat use different tie rules. Select the procedure before rolling both sides.
      </p>

      <label className="coc-single-control">
        Procedure
        <select value={mode} onChange={(event) => {
          setMode(event.target.value as ResolverMode);
          clearResults();
        }}>
          <option value="opposed">Generic opposed roll</option>
          <option value="dodge">Close combat: Dodge</option>
          <option value="fight-back">Close combat: Fight Back</option>
        </select>
      </label>

      <div className="coc-control-grid coc-control-grid--two">
        <label>
          {mode === "opposed" ? "Side A skill" : "Attacker skill"}
          <input min="1" max="100" type="number" value={attackerSkill} onChange={(event) => {
            setAttackerSkill(Math.max(1, Math.min(100, Math.trunc(Number(event.target.value) || 1))));
            clearResults();
          }} />
        </label>
        <label>
          {mode === "opposed" ? "Side B skill" : mode === "dodge" ? "Dodge skill" : "Fight Back skill"}
          <input min="1" max="100" type="number" value={defenderSkill} onChange={(event) => {
            setDefenderSkill(Math.max(1, Math.min(100, Math.trunc(Number(event.target.value) || 1))));
            clearResults();
          }} />
        </label>
      </div>

      <button className="coc-roll-button" type="button" onClick={rollContest}>Roll both sides</button>

      {attackerResult && defenderResult && resolution && (
        <section className="coc-roll-result" aria-live="polite">
          <div className="coc-opposed-results">
            <span>
              <small>{mode === "opposed" ? "Side A" : "Attacker"}</small>
              <strong>{attackerResult.roll}</strong>
              <em>{successLabels[attackerResult.successLevel]}</em>
            </span>
            <b>VS</b>
            <span>
              <small>{mode === "opposed" ? "Side B" : mode === "dodge" ? "Dodge" : "Fight Back"}</small>
              <strong>{defenderResult.roll}</strong>
              <em>{successLabels[defenderResult.successLevel]}</em>
            </span>
          </div>
          <h3>{resolution.outcome.replaceAll("-", " ")}</h3>
          <p>{resolution.reason}</p>
          {mode === "opposed" && resolution.outcome === "tie-break-required" && (
            <button type="button" onClick={rollTieBreak}>Roll separate D100 tie-break</button>
          )}
          {mode === "opposed" && resolution.outcome === "tie-break-tied" && (
            <button type="button" onClick={rollTieBreak}>Roll tie-break again</button>
          )}
        </section>
      )}

      <CocRuleStatus sourceId={mode === "opposed" ? "coc-opposed-rolls" : "coc-close-combat-responses"} />
      {error && <p className="coc-error" role="alert">{error}</p>}
    </article>
  );
};