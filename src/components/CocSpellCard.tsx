import { useState } from "react";
import type { CocPercentileResult, CocSpellPreview } from "../types/coc";
import { rollCocPercentile } from "../utils/cocPercentile";
import { rollDiceFormula } from "../utils/rollDice";

type CocSpellCardProps = {
  spell: CocSpellPreview;
};

export const CocSpellCard = ({ spell }: CocSpellCardProps) => {
  const [magicPoints, setMagicPoints] = useState(12);
  const [sanity, setSanity] = useState(60);
  const [castingSkill, setCastingSkill] = useState(spell.defaultCastingSkill);
  const [castResult, setCastResult] = useState<CocPercentileResult>();
  const [sanityCost, setSanityCost] = useState<number>();
  const [duration, setDuration] = useState<number>();
  const [error, setError] = useState<string>();

  const cast = () => {
    try {
      if (magicPoints < spell.magicPointCost) {
        throw new Error("Not enough Magic Points remain to begin this ritual.");
      }

      const result = rollCocPercentile(castingSkill);
      setMagicPoints((current) => current - spell.magicPointCost);
      setCastResult(result);
      setDuration(undefined);
      setSanityCost(undefined);
      setError(undefined);
    } catch (caught) {
      console.error("CoC spell casting failed", { spellId: spell.id, caught });
      setError(caught instanceof Error ? caught.message : "The casting sequence failed.");
    }
  };

  const paySanityCost = () => {
    try {
      const cost = rollDiceFormula(spell.sanityCostFormula).total;
      setSanity((current) => Math.max(0, current - cost));
      setSanityCost(cost);
      setError(undefined);
    } catch (caught) {
      console.error("CoC spell Sanity cost failed", { spellId: spell.id, caught });
      setError(caught instanceof Error ? caught.message : "The Sanity cost roll failed.");
    }
  };

  const rollDuration = () => {
    try {
      setDuration(rollDiceFormula(spell.duration).total);
      setError(undefined);
    } catch (caught) {
      console.error("CoC spell duration failed", { spellId: spell.id, caught });
      setError(caught instanceof Error ? caught.message : "The duration roll failed.");
    }
  };

  const castSucceeded = castResult?.meetsDifficulty === true;

  return (
    <article className={`coc-card coc-card--spell${castSucceeded ? " coc-outcome--extreme" : ""}`}>
      <header className="coc-card__header">
        <div>
          <small>Restricted occult memorandum</small>
          <h2>{spell.name}</h2>
        </div>
        <span className="coc-card__stamp">RIT</span>
      </header>

      <p className="coc-card__summary">{spell.summary}</p>

      <div className="coc-record-grid">
        <span><small>Casting time</small><strong>{spell.castingTime}</strong></span>
        <span><small>MP cost</small><strong>{spell.magicPointCost}</strong></span>
        <span><small>SAN cost</small><strong>{spell.sanityCostFormula}</strong></span>
        <span><small>Range</small><strong>{spell.range}</strong></span>
        <span><small>Duration</small><strong>{spell.duration}</strong></span>
        <span><small>Test</small><strong>{spell.castingSkillName}</strong></span>
      </div>

      <div className="coc-resource-ledger">
        <span><small>Magic Points</small><strong>{magicPoints}</strong></span>
        <span><small>Sanity</small><strong>{sanity}</strong></span>
      </div>

      <label className="coc-single-control">
        {spell.castingSkillName} value
        <input
          min="1"
          max="100"
          type="number"
          value={castingSkill}
          onChange={(event) => setCastingSkill(Math.max(1, Math.min(100, Math.trunc(Number(event.target.value) || 1))))}
        />
      </label>

      <div className="coc-button-row">
        <button className="coc-roll-button" type="button" onClick={cast}>Begin casting</button>
        <button type="button" onClick={() => {
          setMagicPoints(12);
          setSanity(60);
          setCastResult(undefined);
          setSanityCost(undefined);
          setDuration(undefined);
        }}>Reset resources</button>
      </div>

      {castResult && (
        <section className="coc-compact-result" aria-live="polite">
          <strong>{castResult.roll}</strong>
          <span>{castSucceeded ? "The veil answers" : "The ritual fails"}</span>
          <p>{castSucceeded ? "The casting roll succeeded. Resolve costs and duration." : spell.failure}</p>
          <div className="coc-button-row coc-button-row--compact">
            <button type="button" onClick={paySanityCost}>Pay {spell.sanityCostFormula} SAN</button>
            {castSucceeded && <button type="button" onClick={rollDuration}>Roll duration</button>}
          </div>
          {sanityCost !== undefined && <em>{sanityCost} Sanity lost</em>}
          {duration !== undefined && <em>Active for {duration} rounds</em>}
        </section>
      )}

      {error && <p className="coc-error" role="alert">{error}</p>}
    </article>
  );
};
