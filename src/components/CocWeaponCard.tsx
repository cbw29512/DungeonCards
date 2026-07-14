import { useState } from "react";
import type { CocPercentileResult, CocRollMode, CocSuccessLevel, CocWeaponPreview } from "../types/coc";
import { rollCocPercentile } from "../utils/cocPercentile";
import { rollDiceFormula } from "../utils/rollDice";
import { CocRuleStatus } from "./CocRuleStatus";

const outcomeLabels: Record<CocSuccessLevel, string> = {
  critical: "Critical Success",
  extreme: "Extreme Success",
  hard: "Hard Success",
  regular: "Regular Success",
  failure: "Miss",
  fumble: "Fumble"
};

type CocWeaponCardProps = {
  weapon: CocWeaponPreview;
};

export const CocWeaponCard = ({ weapon }: CocWeaponCardProps) => {
  const [skillValue, setSkillValue] = useState(weapon.defaultSkill);
  const [mode, setMode] = useState<CocRollMode>("normal");
  const [ammunition, setAmmunition] = useState(weapon.capacity);
  const [attackResult, setAttackResult] = useState<CocPercentileResult>();
  const [damage, setDamage] = useState<number>();
  const [error, setError] = useState<string>();

  const attack = () => {
    try {
      if (ammunition <= 0) throw new Error("The weapon is empty. Reload before attacking.");
      const result = rollCocPercentile(skillValue, "regular", mode);
      setAmmunition((current) => Math.max(0, current - 1));
      setAttackResult(result);
      setDamage(undefined);
      setError(undefined);
    } catch (caught) {
      console.error("CoC weapon attack failed", { weaponId: weapon.id, caught });
      setError(caught instanceof Error ? caught.message : "The attack roll failed.");
    }
  };

  const rollDamage = () => {
    try {
      setDamage(rollDiceFormula(weapon.damageFormula).total);
      setError(undefined);
    } catch (caught) {
      console.error("CoC weapon damage failed", { weaponId: weapon.id, caught });
      setError(caught instanceof Error ? caught.message : "The damage roll failed.");
    }
  };

  const malfunctioned = attackResult !== undefined && attackResult.roll >= weapon.malfunction;
  const specialDamagePending = attackResult?.successLevel === "extreme" || attackResult?.successLevel === "critical";
  const canDamage = attackResult !== undefined
    && attackResult.meetsDifficulty
    && !malfunctioned
    && !specialDamagePending;

  return (
    <article className={`coc-card coc-card--weapon${malfunctioned ? " coc-outcome--fumble" : ""}`}>
      <header className="coc-card__header">
        <div>
          <small>Evidence locker · {weapon.category}</small>
          <h2>{weapon.name}</h2>
        </div>
        <span className="coc-card__stamp">WPN</span>
      </header>

      <div className="coc-record-grid">
        <span><small>Skill</small><strong>{weapon.skillName}</strong></span>
        <span><small>Damage</small><strong>{weapon.damageFormula}</strong></span>
        <span><small>Range</small><strong>{weapon.range}</strong></span>
        <span><small>Attacks</small><strong>{weapon.attacksPerRound}</strong></span>
        <span><small>Malfunction</small><strong>{weapon.malfunction}</strong></span>
        <span><small>Impaling</small><strong>{weapon.impaling ? "Yes" : "No"}</strong></span>
      </div>

      <div className="coc-ammo" aria-label={`${ammunition} of ${weapon.capacity} rounds remaining`}>
        {Array.from({ length: weapon.capacity }, (_, index) => (
          <span className={index < ammunition ? "is-loaded" : ""} key={index} aria-hidden="true" />
        ))}
        <strong>{ammunition}/{weapon.capacity}</strong>
      </div>

      <div className="coc-control-grid coc-control-grid--two">
        <label>
          {weapon.skillName}
          <input
            min="1"
            max="100"
            type="number"
            value={skillValue}
            onChange={(event) => setSkillValue(Math.max(1, Math.min(100, Math.trunc(Number(event.target.value) || 1))))}
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
        <button className="coc-roll-button" type="button" onClick={attack}>Fire one round</button>
        <button type="button" onClick={() => {
          setAmmunition(weapon.capacity);
          setAttackResult(undefined);
          setDamage(undefined);
        }}>Reload</button>
      </div>

      {attackResult && (
        <section className="coc-compact-result" aria-live="polite">
          <strong>{attackResult.roll}</strong>
          <span>{malfunctioned ? "Weapon Malfunction" : outcomeLabels[attackResult.successLevel]}</span>
          {canDamage && <button type="button" onClick={rollDamage}>Roll listed base damage</button>}
          {specialDamagePending && !malfunctioned && (
            <p>Extreme and Critical weapon damage is not automated until the weapon damage audit is certified.</p>
          )}
          {damage !== undefined && <em>{damage} listed base damage</em>}
        </section>
      )}

      <p className="coc-card__note">{weapon.notes}</p>
      <CocRuleStatus sourceId="coc-original-weapon-preview" />
      {error && <p className="coc-error" role="alert">{error}</p>}
    </article>
  );
};