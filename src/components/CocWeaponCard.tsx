import { useState } from "react";
import type { CocPercentileResult, CocRollMode, CocSuccessLevel, CocWeaponRecord } from "../types/coc";
import { resolveCocDamage, type CocDamageResolution } from "../utils/cocDamage";
import { rollCocPercentile } from "../utils/cocPercentile";
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
  weapon: CocWeaponRecord;
};

export const CocWeaponCard = ({ weapon }: CocWeaponCardProps) => {
  const [skillValue, setSkillValue] = useState(weapon.defaultSkill);
  const [mode, setMode] = useState<CocRollMode>("normal");
  const [ammunition, setAmmunition] = useState(weapon.capacity);
  const [damageBonus, setDamageBonus] = useState("0");
  const [attackResult, setAttackResult] = useState<CocPercentileResult>();
  const [damage, setDamage] = useState<CocDamageResolution>();
  const [error, setError] = useState<string>();
  const usesAmmunition = weapon.capacity > 0;

  const attack = () => {
    try {
      if (usesAmmunition && ammunition <= 0) throw new Error("The weapon is empty. Reload before attacking.");
      const result = rollCocPercentile(skillValue, "regular", mode);
      if (usesAmmunition) setAmmunition((current) => Math.max(0, current - 1));
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
      if (!attackResult?.meetsDifficulty) throw new Error("A missed attack does not roll damage.");
      if (attackResult.successLevel === "critical") {
        throw new Error("Critical damage remains blocked until its exact rule passes source review.");
      }

      const kind = attackResult.successLevel === "extreme"
        ? weapon.impaling ? "extreme-impaling" : "extreme-blunt"
        : "ordinary";
      setDamage(resolveCocDamage(
        weapon.damageFormula,
        weapon.usesDamageBonus ? damageBonus : "0",
        kind
      ));
      setError(undefined);
    } catch (caught) {
      console.error("CoC weapon damage failed", { weaponId: weapon.id, attackResult, damageBonus, caught });
      setError(caught instanceof Error ? caught.message : "The damage roll failed.");
    }
  };

  const malfunctioned = attackResult !== undefined
    && weapon.malfunction !== undefined
    && attackResult.roll >= weapon.malfunction;
  const criticalDamagePending = attackResult?.successLevel === "critical";
  const canDamage = attackResult !== undefined
    && attackResult.meetsDifficulty
    && !malfunctioned
    && !criticalDamagePending;

  return (
    <article className={`coc-card coc-card--weapon${malfunctioned ? " coc-outcome--fumble" : ""}`}>
      <header className="coc-card__header">
        <div>
          <small>Original armory · {weapon.category}</small>
          <h2>{weapon.name}</h2>
        </div>
        <span className="coc-card__stamp">WPN</span>
      </header>

      <div className="coc-record-grid">
        <span><small>Skill</small><strong>{weapon.skillName}</strong></span>
        <span><small>Damage</small><strong>{weapon.damageFormula}{weapon.usesDamageBonus ? " + DB" : ""}</strong></span>
        <span><small>Range</small><strong>{weapon.range}</strong></span>
        <span><small>Attacks</small><strong>{weapon.attacksPerRound}</strong></span>
        <span><small>Hands</small><strong>{weapon.hands}</strong></span>
        <span><small>Availability</small><strong>{weapon.availability}</strong></span>
        <span><small>Malfunction</small><strong>{weapon.malfunction ?? "—"}</strong></span>
        <span><small>Impaling</small><strong>{weapon.impaling ? "Yes" : "No"}</strong></span>
      </div>

      {usesAmmunition && (
        <div className="coc-ammo" aria-label={`${ammunition} of ${weapon.capacity} rounds remaining`}>
          {Array.from({ length: weapon.capacity }, (_, index) => (
            <span className={index < ammunition ? "is-loaded" : ""} key={index} aria-hidden="true" />
          ))}
          <strong>{ammunition}/{weapon.capacity}</strong>
        </div>
      )}

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
        {weapon.usesDamageBonus && (
          <label>
            Investigator Damage Bonus
            <input
              aria-label="Damage Bonus dice formula"
              onChange={(event) => setDamageBonus(event.target.value)}
              placeholder="0, 1d4, -1d4…"
              type="text"
              value={damageBonus}
            />
          </label>
        )}
      </div>

      <div className="coc-button-row">
        <button className="coc-roll-button" type="button" onClick={attack}>
          {usesAmmunition ? "Fire one round" : weapon.kind === "thrown" ? "Throw weapon" : "Make attack"}
        </button>
        {usesAmmunition && (
          <button type="button" onClick={() => {
            setAmmunition(weapon.capacity);
            setAttackResult(undefined);
            setDamage(undefined);
          }}>Reload</button>
        )}
      </div>

      {attackResult && (
        <section className="coc-compact-result" aria-live="polite">
          <strong>{attackResult.roll}</strong>
          <span>{malfunctioned ? "Weapon Malfunction" : outcomeLabels[attackResult.successLevel]}</span>
          {canDamage && (
            <button type="button" onClick={rollDamage}>
              {attackResult.successLevel === "extreme" ? "Resolve Extreme damage" : "Roll damage"}
            </button>
          )}
          {criticalDamagePending && !malfunctioned && (
            <p>Critical damage remains blocked until its exact rule receives direct and independent source review.</p>
          )}
          {damage && (
            <div className="coc-damage-breakdown">
              <em>{damage.total} total damage</em>
              <small>
                Weapon: {damage.weaponDamage}
                {damage.damageBonus !== 0 ? ` · Damage Bonus: ${damage.damageBonus}` : ""}
                {damage.additionalWeaponRoll > 0 ? ` · Additional weapon roll: ${damage.additionalWeaponRoll}` : ""}
              </small>
            </div>
          )}
        </section>
      )}

      <p className="coc-card__note"><strong>Reload:</strong> {weapon.reload}</p>
      <p className="coc-card__note">{weapon.notes}</p>
      <p className="coc-card__note">Original DM Forge percentile-horror record · {weapon.eras.join(" / ")}</p>
      {usesAmmunition && <CocRuleStatus sourceId="coc-firearm-procedure" />}
      {attackResult?.successLevel === "extreme" && <CocRuleStatus sourceId="coc-extreme-damage" />}
      {error && <p className="coc-error" role="alert">{error}</p>}
    </article>
  );
};
