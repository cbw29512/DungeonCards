import { useState } from "react";
import type {
  CocPercentileResult,
  CocRitualRecord,
  CocRollMode
} from "../types/coc";
import { rollCocPercentile } from "../utils/cocPercentile";
import { rollDiceFormula } from "../utils/rollDice";
import { CocRuleStatus } from "./CocRuleStatus";

type CocSpellCardProps = {
  spell: CocRitualRecord;
};

const titleCase = (value: string) => value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export const CocSpellCard = ({ spell }: CocSpellCardProps) => {
  const [magicPoints, setMagicPoints] = useState(12);
  const [sanity, setSanity] = useState(60);
  const [castingSkill, setCastingSkill] = useState(spell.defaultCastingSkill);
  const [mode, setMode] = useState<CocRollMode>("normal");
  const [castResult, setCastResult] = useState<CocPercentileResult>();
  const [sanityCost, setSanityCost] = useState<number>();
  const [duration, setDuration] = useState<number>();
  const [error, setError] = useState<string>();

  const cast = () => {
    try {
      if (magicPoints < spell.magicPointCost) {
        throw new Error("Not enough Magic Points remain to begin this ritual.");
      }

      const result = rollCocPercentile(castingSkill, spell.difficulty, mode);
      setMagicPoints((current) => current - spell.magicPointCost);
      setCastResult(result);
      setDuration(undefined);
      setSanityCost(undefined);
      setError(undefined);
    } catch (caught) {
      console.error("Percentile-horror ritual casting failed", { ritualId: spell.id, caught });
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
      console.error("Percentile-horror ritual Sanity cost failed", { ritualId: spell.id, caught });
      setError(caught instanceof Error ? caught.message : "The Sanity cost roll failed.");
    }
  };

  const rollDuration = () => {
    try {
      setDuration(rollDiceFormula(spell.durationFormula).total);
      setError(undefined);
    } catch (caught) {
      console.error("Percentile-horror ritual duration failed", { ritualId: spell.id, caught });
      setError(caught instanceof Error ? caught.message : "The duration roll failed.");
    }
  };

  const castSucceeded = castResult?.meetsDifficulty === true;

  return (
    <article className={`coc-card coc-card--spell${castSucceeded ? " coc-outcome--extreme" : ""}`}>
      <header className="coc-card__header">
        <div>
          <small>Original occult memorandum · {titleCase(spell.kind)}</small>
          <h2>{spell.name}</h2>
        </div>
        <span className="coc-card__stamp">{spell.risk.slice(0, 3).toUpperCase()}</span>
      </header>

      <p className="coc-card__summary">{spell.summary}</p>

      <div className="coc-record-grid">
        <span><small>Risk</small><strong>{titleCase(spell.risk)}</strong></span>
        <span><small>Casting time</small><strong>{spell.castingTime}</strong></span>
        <span><small>MP cost</small><strong>{spell.magicPointCost}</strong></span>
        <span><small>SAN cost</small><strong>{spell.sanityCostFormula}</strong></span>
        <span><small>Range</small><strong>{spell.range}</strong></span>
        <span><small>Duration</small><strong>{spell.durationFormula} {spell.durationUnit}</strong></span>
        <span><small>Test</small><strong>{spell.castingSkillName}</strong></span>
        <span><small>Difficulty</small><strong>{titleCase(spell.difficulty)}</strong></span>
      </div>

      <section className="coc-ritual-card__requirements">
        <h3>Requirements</h3>
        <ul>{spell.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul>
      </section>

      <section className="coc-ritual-card__effect">
        <h3>Effect</h3>
        <p>{spell.effect}</p>
      </section>

      <div className="coc-resource-ledger">
        <label>
          <small>Magic Points</small>
          <input
            aria-label="Current Magic Points"
            min="0"
            max="99"
            onChange={(event) => setMagicPoints(Math.max(0, Math.min(99, Math.trunc(Number(event.target.value) || 0))))}
            type="number"
            value={magicPoints}
          />
        </label>
        <label>
          <small>Sanity</small>
          <input
            aria-label="Current Sanity"
            min="0"
            max="99"
            onChange={(event) => setSanity(Math.max(0, Math.min(99, Math.trunc(Number(event.target.value) || 0))))}
            type="number"
            value={sanity}
          />
        </label>
      </div>

      <div className="coc-control-grid coc-control-grid--two">
        <label>
          {spell.castingSkillName} value
          <input
            min="1"
            max="100"
            type="number"
            value={castingSkill}
            onChange={(event) => setCastingSkill(Math.max(1, Math.min(100, Math.trunc(Number(event.target.value) || 1))))}
          />
        </label>
        <label>
          Net dice modifier
          <select value={mode} onChange={(event) => setMode(event.target.value as CocRollMode)}>
            <option value="double-penalty">Two Penalty dice</option>
            <option value="penalty">One Penalty die</option>
            <option value="normal">Normal</option>
            <option value="bonus">One Bonus die</option>
            <option value="double-bonus">Two Bonus dice</option>
          </select>
        </label>
      </div>

      <div className="coc-button-row">
        <button className="coc-roll-button" type="button" onClick={cast}>Begin casting</button>
        <button type="button" onClick={() => {
          setMagicPoints(12);
          setSanity(60);
          setCastResult(undefined);
          setSanityCost(undefined);
          setDuration(undefined);
          setError(undefined);
        }}>Reset card</button>
      </div>

      {castResult && (
        <section className="coc-compact-result" aria-live="polite">
          <strong>{castResult.roll}</strong>
          <span>{castSucceeded ? "Casting succeeds" : "Casting fails"}</span>
          <p>{castSucceeded ? spell.effect : spell.failure}</p>
          <div className="coc-button-row coc-button-row--compact">
            <button type="button" onClick={paySanityCost}>Pay {spell.sanityCostFormula} SAN</button>
            {castSucceeded && <button type="button" onClick={rollDuration}>Roll duration</button>}
          </div>
          {sanityCost !== undefined && <em>{sanityCost} Sanity lost</em>}
          {duration !== undefined && <em>Active for {duration} {spell.durationUnit}</em>}
        </section>
      )}

      <section className="coc-ritual-card__backlash">
        <h3>Failure or backlash</h3>
        <p>{spell.failure}</p>
      </section>

      <p className="coc-card__note">Contexts: {spell.contexts.join(" · ")}</p>
      <p className="coc-card__note">Original DM Forge percentile-horror ritual; not an official published spell.</p>
      <CocRuleStatus sourceId="coc-magic-casting" />
      {error && <p className="coc-error" role="alert">{error}</p>}
    </article>
  );
};
