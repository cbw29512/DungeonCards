import { useState } from "react";
import { rollCocPercentile } from "../utils/cocPercentile";
import { CocRuleStatus } from "./CocRuleStatus";

const castingTiming = (castingTime: string, dexterity: number) => {
  const normalized = castingTime.trim().toLowerCase();
  if (normalized === "instantaneous") return `Activates at DEX ${dexterity + 50}.`;
  if (normalized === "1 round" || normalized === "one round") return `Activates at DEX ${dexterity} in the present round.`;
  return `Track the listed ${castingTime || "casting time"}; the effect activates on the caster's DEX when the required rounds are complete.`;
};

export const CocMagicProcedureCard = () => {
  const [power, setPower] = useState(60);
  const [dexterity, setDexterity] = useState(55);
  const [currentMagicPoints, setCurrentMagicPoints] = useState(12);
  const [magicPointCost, setMagicPointCost] = useState(3);
  const [castingTime, setCastingTime] = useState("instantaneous");
  const [previouslyCast, setPreviouslyCast] = useState(false);
  const [firstAttemptFailed, setFirstAttemptFailed] = useState(false);
  const [result, setResult] = useState("Enter the spell's authorized costs and casting time before resolving the procedure.");

  const spendCost = () => {
    const spentFromMp = Math.min(currentMagicPoints, magicPointCost);
    const hitPointCost = Math.max(0, magicPointCost - currentMagicPoints);
    setCurrentMagicPoints(currentMagicPoints - spentFromMp);
    return { spentFromMp, hitPointCost };
  };

  const costText = ({ spentFromMp, hitPointCost }: { spentFromMp: number; hitPointCost: number }) =>
    `${spentFromMp} MP spent${hitPointCost > 0 ? ` and ${hitPointCost} HP lost because MP reached zero` : ""}`;

  const resolveCasting = () => {
    const payment = spendCost();
    if (previouslyCast) {
      setFirstAttemptFailed(false);
      setResult(`No casting roll is required because this spell has been cast successfully before. ${costText(payment)}. ${castingTiming(castingTime, dexterity)}`);
      return;
    }

    const roll = rollCocPercentile(power, "hard");
    if (roll.meetsDifficulty) {
      setPreviouslyCast(true);
      setFirstAttemptFailed(false);
      setResult(`Hard POW roll ${roll.roll}: success. The spell is cast. ${costText(payment)}. ${castingTiming(castingTime, dexterity)}`);
      return;
    }

    setFirstAttemptFailed(true);
    setResult(`Hard POW roll ${roll.roll}: failure. Nothing happens yet, but the costs were paid (${costText(payment)}). The caster may stop or pay the costs again and push the casting roll.`);
  };

  const pushCasting = () => {
    if (!firstAttemptFailed) return;
    const payment = spendCost();
    const roll = rollCocPercentile(power, "hard");
    setPreviouslyCast(true);
    setFirstAttemptFailed(false);
    setResult(roll.meetsDifficulty
      ? `Pushed Hard POW roll ${roll.roll}: success. The spell works normally. ${costText(payment)}. ${castingTiming(castingTime, dexterity)}`
      : `Pushed Hard POW roll ${roll.roll}: failure. The spell still works normally, but the Keeper applies a dire consequence to the caster. ${costText(payment)}. ${castingTiming(castingTime, dexterity)}`);
  };

  return (
    <article className="coc-card coc-card--interactive">
      <header className="coc-card__header">
        <div>
          <small>Occult procedure</small>
          <h2>First-Time Spell Casting</h2>
        </div>
        <span className="coc-card__stamp">POW</span>
      </header>

      <p className="coc-card__summary">
        Use an authorized spell description for its effect and costs. This card handles Magic Points, the first-casting Hard POW roll, a pushed casting, and combat timing.
      </p>

      <div className="coc-control-grid coc-control-grid--two">
        <label>POW<input min="1" max="100" type="number" value={power} onChange={(event) => setPower(Math.max(1, Math.min(100, Math.trunc(Number(event.target.value) || 1))))} /></label>
        <label>DEX<input min="1" max="100" type="number" value={dexterity} onChange={(event) => setDexterity(Math.max(1, Math.min(100, Math.trunc(Number(event.target.value) || 1))))} /></label>
        <label>Current MP<input min="0" max="100" type="number" value={currentMagicPoints} onChange={(event) => setCurrentMagicPoints(Math.max(0, Math.min(100, Math.trunc(Number(event.target.value) || 0))))} /></label>
        <label>Spell MP cost<input min="0" max="100" type="number" value={magicPointCost} onChange={(event) => setMagicPointCost(Math.max(0, Math.min(100, Math.trunc(Number(event.target.value) || 0))))} /></label>
        <label>Casting time<input type="text" value={castingTime} onChange={(event) => setCastingTime(event.target.value)} placeholder="instantaneous, 1 round, 2 rounds…" /></label>
      </div>

      <label className="coc-check-control"><input type="checkbox" checked={previouslyCast} onChange={(event) => {
        setPreviouslyCast(event.target.checked);
        setFirstAttemptFailed(false);
      }} />This caster has successfully cast this spell before</label>

      <div className="coc-record-grid">
        <span><small>Hard POW</small><strong>{Math.floor(power / 2)}</strong></span>
        <span><small>Available MP</small><strong>{currentMagicPoints}</strong></span>
        <span><small>Timing</small><strong>{castingTiming(castingTime, dexterity)}</strong></span>
      </div>

      <div className="coc-button-row">
        <button className="coc-roll-button" type="button" onClick={resolveCasting}>Resolve casting</button>
        {firstAttemptFailed && <button type="button" onClick={pushCasting}>Pay again and push</button>}
      </div>

      <section className="coc-roll-result" aria-live="polite"><p>{result}</p></section>
      <CocRuleStatus sourceId="coc-magic-casting" />
    </article>
  );
};
