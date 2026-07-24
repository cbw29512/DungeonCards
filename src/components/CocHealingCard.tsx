import { useState } from "react";
import { rollCocPercentile } from "../utils/cocPercentile";
import { rollDiceFormula } from "../utils/rollDice";
import { CocRuleStatus } from "./CocRuleStatus";

const clampHp = (value: number, maximum: number) => Math.max(0, Math.min(maximum, value));

export const CocHealingCard = () => {
  const [maximumHitPoints, setMaximumHitPoints] = useState(12);
  const [currentHitPoints, setCurrentHitPoints] = useState(3);
  const [constitution, setConstitution] = useState(60);
  const [firstAidSkill, setFirstAidSkill] = useState(50);
  const [medicineSkill, setMedicineSkill] = useState(30);
  const [hasMajorWound, setHasMajorWound] = useState(true);
  const [dying, setDying] = useState(false);
  const [result, setResult] = useState("Choose a treatment or recovery procedure.");

  const applyHealing = (amount: number) => {
    const next = clampHp(currentHitPoints + amount, maximumHitPoints);
    setCurrentHitPoints(next);
    if (hasMajorWound && next >= Math.ceil(maximumHitPoints / 2)) setHasMajorWound(false);
    return next;
  };

  const attemptFirstAid = () => {
    const roll = rollCocPercentile(firstAidSkill);
    if (!roll.meetsDifficulty) {
      setResult(`First Aid ${roll.roll}: failure. No HP is restored and the dying condition is not stabilized.`);
      return;
    }
    const next = applyHealing(1);
    if (dying) setDying(false);
    setResult(`First Aid ${roll.roll}: success. Restore 1 HP${dying ? " and stabilize the dying investigator long enough for Medicine" : ""}. Current HP: ${next}.`);
  };

  const attemptMedicine = () => {
    const roll = rollCocPercentile(medicineSkill);
    if (!roll.meetsDifficulty) {
      setResult(`Medicine ${roll.roll}: failure after at least one hour of treatment. No HP is restored.`);
      return;
    }
    const healed = rollDiceFormula("1d3").total;
    const next = applyHealing(healed);
    setResult(`Medicine ${roll.roll}: success after at least one hour with suitable equipment. Restore ${healed} HP. Current HP: ${next}.`);
  };

  const recoverOneDay = () => {
    if (hasMajorWound) {
      setResult("A character with a Major Wound does not use the ordinary 1 HP per day recovery. Make the weekly CON healing roll instead.");
      return;
    }
    const next = applyHealing(1);
    setResult(`Natural recovery restores 1 HP for the day. Current HP: ${next}.`);
  };

  const makeWeeklyHealingRoll = () => {
    if (!hasMajorWound) {
      setResult("No Major Wound is present. Use ordinary recovery of 1 HP per day.");
      return;
    }
    const roll = rollCocPercentile(constitution);
    if (!roll.meetsDifficulty) {
      setResult(`Weekly CON roll ${roll.roll}: failure. No HP is restored this week.`);
      return;
    }
    const isExtreme = roll.successLevel === "critical" || roll.successLevel === "extreme";
    const healed = rollDiceFormula(isExtreme ? "2d3" : "1d3").total;
    const next = applyHealing(healed);
    if (isExtreme) setHasMajorWound(false);
    setResult(`Weekly CON roll ${roll.roll}: ${isExtreme ? "Extreme or better" : "success"}. Restore ${healed} HP. Current HP: ${next}.${isExtreme ? " The Major Wound is removed." : ""}`);
  };

  return (
    <article className="coc-card coc-card--interactive">
      <header className="coc-card__header">
        <div>
          <small>Injury procedure</small>
          <h2>First Aid, Medicine & Recovery</h2>
        </div>
        <span className="coc-card__stamp">AID</span>
      </header>

      <p className="coc-card__summary">
        Resolve immediate treatment and natural healing while keeping the Major Wound and dying states separate from current HP.
      </p>

      <div className="coc-control-grid coc-control-grid--two">
        <label>Maximum HP<input min="1" max="100" type="number" value={maximumHitPoints} onChange={(event) => {
          const next = Math.max(1, Math.min(100, Math.trunc(Number(event.target.value) || 1)));
          setMaximumHitPoints(next);
          setCurrentHitPoints((current) => Math.min(current, next));
        }} /></label>
        <label>Current HP<input min="0" max={maximumHitPoints} type="number" value={currentHitPoints} onChange={(event) => setCurrentHitPoints(clampHp(Math.trunc(Number(event.target.value) || 0), maximumHitPoints))} /></label>
        <label>CON<input min="1" max="100" type="number" value={constitution} onChange={(event) => setConstitution(Math.max(1, Math.min(100, Math.trunc(Number(event.target.value) || 1))))} /></label>
        <label>First Aid<input min="1" max="100" type="number" value={firstAidSkill} onChange={(event) => setFirstAidSkill(Math.max(1, Math.min(100, Math.trunc(Number(event.target.value) || 1))))} /></label>
        <label>Medicine<input min="1" max="100" type="number" value={medicineSkill} onChange={(event) => setMedicineSkill(Math.max(1, Math.min(100, Math.trunc(Number(event.target.value) || 1))))} /></label>
      </div>

      <label className="coc-check-control"><input type="checkbox" checked={hasMajorWound} onChange={(event) => setHasMajorWound(event.target.checked)} />Major Wound present</label>
      <label className="coc-check-control"><input type="checkbox" checked={dying} onChange={(event) => setDying(event.target.checked)} />Investigator is dying</label>

      <div className="coc-button-row coc-button-row--wrap">
        <button className="coc-roll-button" type="button" onClick={attemptFirstAid}>Roll First Aid</button>
        <button type="button" onClick={attemptMedicine}>Roll Medicine</button>
        <button type="button" onClick={recoverOneDay}>Recover one day</button>
        <button type="button" onClick={makeWeeklyHealingRoll}>Weekly Major Wound roll</button>
      </div>

      <section className="coc-roll-result" aria-live="polite">
        <strong className="coc-roll-result__total">{currentHitPoints}</strong>
        <h3>Current HP</h3>
        <p>{result}</p>
        <p>Status: {hasMajorWound ? "Major Wound" : "No Major Wound"}{dying ? " · Dying" : ""}.</p>
      </section>

      <CocRuleStatus sourceId="coc-healing" />
    </article>
  );
};
