import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { dndHealthRuleSources } from "../data/dndHealthRules";
import type { RulesetId } from "../types/ruleCards";
import { isDndBloodied } from "../utils/dndHealth";
import type { DndEncounterState } from "../utils/dndEncounter";
import {
  applyDndCombatantDamage,
  applyDndCombatantHealing,
  chooseDndCombatantTemporaryHitPoints,
  recoverStableDndCombatant,
  resolveDndCombatantDeathSave,
  stabilizeDndCombatant
} from "../utils/dndEncounterHealth";
import { secureRandomInteger } from "../utils/randomInteger";
import "../styles/dnd-combatant-health.css";

type DndCombatantHealthPanelProps = {
  ruleset: RulesetId;
  encounter: DndEncounterState;
  setEncounter: Dispatch<SetStateAction<DndEncounterState>>;
};

export const DndCombatantHealthPanel = ({
  ruleset,
  encounter,
  setEncounter
}: DndCombatantHealthPanelProps) => {
  const [combatantId, setCombatantId] = useState("");
  const [damage, setDamage] = useState(5);
  const [criticalHit, setCriticalHit] = useState(false);
  const [healing, setHealing] = useState(5);
  const [temporaryHitPoints, setTemporaryHitPoints] = useState(5);
  const [result, setResult] = useState("");
  const source = dndHealthRuleSources[ruleset];
  const combatant = encounter.combatants.find((candidate) => candidate.id === combatantId);

  useEffect(() => {
    if (combatantId && !encounter.combatants.some((candidate) => candidate.id === combatantId)) {
      setCombatantId("");
      setResult("");
    }
  }, [combatantId, encounter.combatants]);

  const applyDamage = () => {
    if (!combatant) return;
    setEncounter((current) => {
      const applied = applyDndCombatantDamage(current, combatant.id, damage, criticalHit);
      setResult(`${combatant.name}: ${applied.summary}`);
      return applied.state;
    });
  };

  const applyHealing = () => {
    if (!combatant) return;
    setEncounter((current) => applyDndCombatantHealing(current, combatant.id, healing));
    setResult(`${combatant.name}: applied ${healing} healing, capped at maximum HP. Ordinary healing does not revive a dead combatant.`);
  };

  const chooseTemporaryHp = (choice: "keep" | "replace") => {
    if (!combatant) return;
    setEncounter((current) => chooseDndCombatantTemporaryHitPoints(
      current,
      combatant.id,
      temporaryHitPoints,
      choice
    ));
    setResult(choice === "keep"
      ? `${combatant.name} keeps the existing Temporary HP.`
      : `${combatant.name} replaces the existing Temporary HP with ${temporaryHitPoints}.`);
  };

  const rollDeathSave = () => {
    if (!combatant) return;
    const roll = secureRandomInteger(1, 20);
    setEncounter((current) => {
      const resolved = resolveDndCombatantDeathSave(current, combatant.id, roll);
      setResult(`${combatant.name} rolled ${roll}: ${resolved.summary}`);
      return resolved.state;
    });
  };

  return (
    <section className="dnd-combatant-health" aria-labelledby="dnd-combatant-health-title">
      <header>
        <div><small>Combatant state</small><h2 id="dnd-combatant-health-title">HP, Temporary HP &amp; Death Saves</h2></div>
        <strong>{encounter.combatants.filter((candidate) => candidate.health.lifeState !== "conscious").length} down</strong>
      </header>

      <p className="dnd-combatant-health__boundary">
        Use Death Saves for player characters and any other creatures the DM chooses to track that way. Damage that causes Unconscious, Stable-at-0, or Dead state automatically ends concentration.
      </p>

      <div className="dnd-combatant-health__selector">
        <label>Combatant<select value={combatantId} onChange={(event) => { setCombatantId(event.target.value); setResult(""); }}><option value="">Select combatant</option>{encounter.combatants.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}</select></label>
      </div>

      {combatant && (
        <>
          <article className={`dnd-live-health-card state-${combatant.health.lifeState}`} aria-live="polite">
            <header>
              <div><small>{combatant.name}</small><strong>{combatant.health.lifeState}</strong></div>
              <span>{combatant.health.currentHitPoints} / {combatant.health.maximumHitPoints} HP</span>
            </header>
            <div className="dnd-live-health-metrics">
              <span><small>Temporary HP</small><strong>{combatant.health.temporaryHitPoints}</strong></span>
              <span><small>Save successes</small><strong>{combatant.health.deathSaveSuccesses}</strong></span>
              <span><small>Save failures</small><strong>{combatant.health.deathSaveFailures}</strong></span>
              <span><small>2024 Bloodied</small><strong>{isDndBloodied(combatant.health) ? "Yes" : "No"}</strong></span>
            </div>
            {combatant.concentration && <p>Concentrating: {combatant.concentration.effectName}</p>}
          </article>

          <div className="dnd-live-health-actions">
            <section>
              <header><strong>Damage</strong></header>
              <label>Amount<input min="0" type="number" value={damage} onChange={(event) => setDamage(Math.max(0, Math.trunc(Number(event.target.value) || 0)))} /></label>
              <label className="dnd-encounter-check"><input type="checkbox" checked={criticalHit} onChange={(event) => setCriticalHit(event.target.checked)} />Critical Hit at 0 HP</label>
              <button type="button" onClick={applyDamage}>Apply damage</button>
            </section>
            <section>
              <header><strong>Healing</strong></header>
              <label>Amount<input min="0" type="number" value={healing} onChange={(event) => setHealing(Math.max(0, Math.trunc(Number(event.target.value) || 0)))} /></label>
              <button type="button" onClick={applyHealing}>Apply healing</button>
            </section>
            <section>
              <header><strong>Temporary HP</strong></header>
              <label>Offered<input min="0" type="number" value={temporaryHitPoints} onChange={(event) => setTemporaryHitPoints(Math.max(0, Math.trunc(Number(event.target.value) || 0)))} /></label>
              <div><button type="button" onClick={() => chooseTemporaryHp("replace")}>Take new value</button><button type="button" onClick={() => chooseTemporaryHp("keep")}>Keep current</button></div>
            </section>
          </div>

          <div className="dnd-death-state-actions">
            <button disabled={combatant.health.lifeState !== "unconscious"} type="button" onClick={rollDeathSave}>Roll Death Save</button>
            <button disabled={combatant.health.currentHitPoints > 0 || combatant.health.lifeState === "dead"} type="button" onClick={() => { setEncounter((current) => stabilizeDndCombatant(current, combatant.id)); setResult(`${combatant.name} is Stable at 0 HP.`); }}>Stabilize</button>
            <button disabled={combatant.health.lifeState !== "stable"} type="button" onClick={() => { setEncounter((current) => recoverStableDndCombatant(current, combatant.id)); setResult(`${combatant.name} regains 1 HP after the table resolves the 1d4-hour stable recovery.`); }}>Record stable recovery</button>
          </div>
        </>
      )}

      {result && <output aria-live="polite">{result}</output>}
      <footer><a href={source.url} target="_blank" rel="noreferrer">{source.reference}</a></footer>
    </section>
  );
};
