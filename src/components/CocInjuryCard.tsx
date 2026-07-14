import { useState } from "react";
import type { CocPercentileResult } from "../types/coc";
import { resolveCocInjury, type CocInjuryOutcome } from "../utils/cocInjury";
import { rollCocPercentile } from "../utils/cocPercentile";
import { CocRuleStatus } from "./CocRuleStatus";

export const CocInjuryCard = () => {
  const [maximumHitPoints, setMaximumHitPoints] = useState(12);
  const [currentHitPoints, setCurrentHitPoints] = useState(12);
  const [constitution, setConstitution] = useState(60);
  const [damage, setDamage] = useState(6);
  const [hasMajorWound, setHasMajorWound] = useState(false);
  const [outcome, setOutcome] = useState<CocInjuryOutcome>();
  const [consciousnessResult, setConsciousnessResult] = useState<CocPercentileResult>();
  const [error, setError] = useState<string>();

  const applyDamage = () => {
    try {
      const next = resolveCocInjury(maximumHitPoints, currentHitPoints, damage, hasMajorWound);
      setOutcome(next);
      setCurrentHitPoints(next.currentHitPoints);
      setHasMajorWound((current) => current || next.majorWoundInflicted);
      setConsciousnessResult(undefined);
      setError(undefined);
    } catch (caught) {
      console.error("CoC injury procedure failed", {
        maximumHitPoints,
        currentHitPoints,
        damage,
        hasMajorWound,
        caught
      });
      setError(caught instanceof Error ? caught.message : "The injury procedure failed.");
    }
  };

  const rollConsciousness = () => {
    try {
      if (!outcome?.requiresConsciousnessRoll) {
        throw new Error("This injury does not require a Major Wound CON roll.");
      }
      setConsciousnessResult(rollCocPercentile(constitution));
      setError(undefined);
    } catch (caught) {
      console.error("CoC Major Wound CON roll failed", { constitution, outcome, caught });
      setError(caught instanceof Error ? caught.message : "The CON roll failed.");
    }
  };

  const reset = () => {
    setCurrentHitPoints(maximumHitPoints);
    setHasMajorWound(false);
    setOutcome(undefined);
    setConsciousnessResult(undefined);
    setError(undefined);
  };

  return (
    <article className="coc-card coc-card--interactive">
      <header className="coc-card__header">
        <div>
          <small>Investigator procedure</small>
          <h2>Damage & Major Wounds</h2>
        </div>
        <span className="coc-card__stamp">HP</span>
      </header>

      <p className="coc-card__summary">
        Apply one blow at a time. A Major Wound depends on damage from a single blow—not on merely falling below half current HP.
      </p>

      <div className="coc-control-grid coc-control-grid--two">
        <label>
          Maximum HP
          <input min="1" max="100" type="number" value={maximumHitPoints} onChange={(event) => {
            const next = Math.max(1, Math.min(100, Math.trunc(Number(event.target.value) || 1)));
            setMaximumHitPoints(next);
            setCurrentHitPoints((current) => Math.min(current, next));
            setOutcome(undefined);
          }} />
        </label>
        <label>
          Current HP
          <input min="0" max={maximumHitPoints} type="number" value={currentHitPoints} onChange={(event) => {
            setCurrentHitPoints(Math.max(0, Math.min(maximumHitPoints, Math.trunc(Number(event.target.value) || 0))));
            setOutcome(undefined);
          }} />
        </label>
        <label>
          Damage from this blow
          <input min="0" max="1000" type="number" value={damage} onChange={(event) => {
            setDamage(Math.max(0, Math.trunc(Number(event.target.value) || 0)));
            setOutcome(undefined);
          }} />
        </label>
        <label>
          CON
          <input min="1" max="100" type="number" value={constitution} onChange={(event) => {
            setConstitution(Math.max(1, Math.min(100, Math.trunc(Number(event.target.value) || 1))));
            setConsciousnessResult(undefined);
          }} />
        </label>
      </div>

      <label className="coc-check-control">
        <input type="checkbox" checked={hasMajorWound} onChange={(event) => {
          setHasMajorWound(event.target.checked);
          setOutcome(undefined);
        }} />
        Investigator already has a Major Wound
      </label>

      <div className="coc-button-row">
        <button className="coc-roll-button" type="button" onClick={applyDamage}>Apply this blow</button>
        <button type="button" onClick={reset}>Reset injury</button>
      </div>

      {outcome && (
        <section className="coc-roll-result" aria-live="polite">
          <strong className="coc-roll-result__total">{outcome.currentHitPoints}</strong>
          <h3>Hit Points remaining</h3>
          <p>Major Wound threshold for this investigator: {outcome.majorWoundThreshold} damage from one blow.</p>
          {outcome.instantDeath && <p>The blow equals or exceeds maximum HP: instant death.</p>}
          {!outcome.instantDeath && outcome.majorWoundInflicted && (
            <p>A Major Wound is inflicted. Make a CON roll or fall unconscious.</p>
          )}
          {outcome.unconsciousAtZeroHitPoints && !outcome.dying && (
            <p>The investigator is unconscious at 0 HP but is not dying because no Major Wound exists.</p>
          )}
          {outcome.dying && (
            <p>The investigator is unconscious and dying. First Aid is required to stabilize them; continued dying CON checks occur by round.</p>
          )}
          {outcome.requiresConsciousnessRoll && !consciousnessResult && (
            <button type="button" onClick={rollConsciousness}>Roll CON to remain conscious</button>
          )}
          {consciousnessResult && (
            <p>
              CON roll {consciousnessResult.roll}: {consciousnessResult.meetsDifficulty ? "the investigator remains conscious" : "the investigator falls unconscious"}.
            </p>
          )}
        </section>
      )}

      <CocRuleStatus sourceId="coc-hit-points-wounds" />
      {error && <p className="coc-error" role="alert">{error}</p>}
    </article>
  );
};