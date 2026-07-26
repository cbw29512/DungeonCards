import { useState } from "react";
import { dndHealthRuleSources } from "../data/dndHealthRules";
import type { RulesetId } from "../types/ruleCards";
import {
  applyDndDamage,
  applyDndHealing,
  chooseDndTemporaryHitPoints,
  createDndHealthState,
  isDndBloodied,
  recoverStableDndCreature,
  resolveDndDeathSave,
  stabilizeDndCreature,
  type DndHealthState
} from "../utils/dndHealth";
import { secureRandomInteger } from "../utils/randomInteger";
import "../styles/dnd-health-tracker.css";

const stateLabels: Record<DndHealthState["lifeState"], string> = {
  conscious: "Conscious",
  unconscious: "Unconscious",
  stable: "Stable",
  dead: "Dead"
};

export const DndHealthTracker = () => {
  const [ruleset, setRuleset] = useState<RulesetId>("srd-5.2.1-2024");
  const [state, setState] = useState(() => createDndHealthState("srd-5.2.1-2024", 30));
  const [damage, setDamage] = useState(8);
  const [criticalHit, setCriticalHit] = useState(false);
  const [healing, setHealing] = useState(6);
  const [offeredTemporaryHitPoints, setOfferedTemporaryHitPoints] = useState(5);
  const [lastResult, setLastResult] = useState("Tracker ready.");
  const [stableRecoveryHours, setStableRecoveryHours] = useState<number>();

  const setRules = (nextRuleset: RulesetId) => {
    setRuleset(nextRuleset);
    setState((current) => ({ ...current, ruleset: nextRuleset }));
    setLastResult(`Switched to ${nextRuleset === "srd-5.1-2014" ? "2014" : "2024"} health rules.`);
  };

  const updateMaximum = (maximumHitPoints: number) => {
    const maximum = Math.max(1, Math.trunc(maximumHitPoints) || 1);
    setState((current) => ({ ...current, maximumHitPoints: maximum, currentHitPoints: Math.min(maximum, current.currentHitPoints) }));
  };

  const updateCurrent = (currentHitPoints: number) => {
    const current = Math.min(state.maximumHitPoints, Math.max(0, Math.trunc(currentHitPoints) || 0));
    setState((previous) => ({
      ...previous,
      currentHitPoints: current,
      lifeState: previous.lifeState === "dead" ? "dead" : current > 0 ? "conscious" : "unconscious",
      deathSaveSuccesses: current > 0 ? 0 : previous.deathSaveSuccesses,
      deathSaveFailures: current > 0 ? 0 : previous.deathSaveFailures
    }));
  };

  const applyDamage = () => {
    const result = applyDndDamage(state, damage, criticalHit);
    setState(result.state);
    setLastResult(result.summary);
    setStableRecoveryHours(undefined);
  };

  const applyHealing = () => {
    const next = applyDndHealing(state, healing);
    setState(next);
    setLastResult(next === state || state.lifeState === "dead" ? "Ordinary healing cannot restore a dead creature." : `${Math.max(0, next.currentHitPoints - state.currentHitPoints)} HP restored.`);
    setStableRecoveryHours(undefined);
  };

  const rollDeathSave = () => {
    const roll = secureRandomInteger(1, 20);
    const result = resolveDndDeathSave(state, roll);
    setState(result.state);
    setLastResult(`Death Save ${roll}: ${result.summary}`);
    setStableRecoveryHours(undefined);
  };

  const source = dndHealthRuleSources[ruleset];
  const bloodied = isDndBloodied(state);

  return (
    <section className="dnd-health-tracker" aria-labelledby="dnd-health-title">
      <header className="dnd-health-tracker__heading">
        <div>
          <p>Persistent combat state</p>
          <h1 id="dnd-health-title">Hit Points, Temporary HP &amp; Death Saves</h1>
          <span>Apply damage and healing in order, track the exact death-save state, and keep stabilization and massive damage visible at the table.</span>
        </div>
        <div className="dnd-health-ruleset" aria-label="D&D rules edition">
          <button aria-pressed={ruleset === "srd-5.1-2014"} type="button" onClick={() => setRules("srd-5.1-2014")}>2014</button>
          <button aria-pressed={ruleset === "srd-5.2.1-2024"} type="button" onClick={() => setRules("srd-5.2.1-2024")}>2024</button>
        </div>
      </header>

      <section className={`dnd-health-status is-${state.lifeState}`} aria-live="polite">
        <header>
          <div><small>Current state</small><h2>{stateLabels[state.lifeState]}{bloodied ? " · Bloodied" : ""}</h2></div>
          <strong>{state.currentHitPoints} / {state.maximumHitPoints} HP</strong>
        </header>
        <div className="dnd-health-meter" aria-label={`${state.currentHitPoints} of ${state.maximumHitPoints} Hit Points`}>
          <span style={{ width: `${Math.max(0, Math.min(100, state.currentHitPoints / state.maximumHitPoints * 100))}%` }} />
        </div>
        <dl>
          <div><dt>Temporary HP</dt><dd>{state.temporaryHitPoints}</dd></div>
          <div><dt>Death successes</dt><dd>{state.deathSaveSuccesses} / 3</dd></div>
          <div><dt>Death failures</dt><dd>{state.deathSaveFailures} / 3</dd></div>
        </dl>
        <p>{lastResult}</p>
      </section>

      <div className="dnd-health-workspaces">
        <section className="dnd-health-panel" aria-labelledby="dnd-health-values-title">
          <header><small>Character values</small><h2 id="dnd-health-values-title">Set the HP record</h2></header>
          <div className="dnd-health-control-grid">
            <label>Maximum HP<input min="1" type="number" value={state.maximumHitPoints} onChange={(event) => updateMaximum(Number(event.target.value))} /></label>
            <label>Current HP<input min="0" max={state.maximumHitPoints} type="number" value={state.currentHitPoints} onChange={(event) => updateCurrent(Number(event.target.value))} /></label>
          </div>
          <button type="button" onClick={() => {
            setState(createDndHealthState(ruleset, state.maximumHitPoints));
            setLastResult("Health and death-save state reset.");
            setStableRecoveryHours(undefined);
          }}>Reset to full HP</button>
        </section>

        <section className="dnd-health-panel" aria-labelledby="dnd-damage-title">
          <header><small>Incoming damage</small><h2 id="dnd-damage-title">Apply damage</h2></header>
          <div className="dnd-health-control-grid">
            <label>Damage<input min="0" type="number" value={damage} onChange={(event) => setDamage(Math.max(0, Math.trunc(Number(event.target.value) || 0)))} /></label>
            <label className="dnd-health-check"><input type="checkbox" checked={criticalHit} onChange={(event) => setCriticalHit(event.target.checked)} />Critical hit</label>
          </div>
          <button type="button" onClick={applyDamage}>Apply damage</button>
          <small>Temporary HP is removed first. A critical hit matters when damage is taken at 0 HP.</small>
        </section>

        <section className="dnd-health-panel" aria-labelledby="dnd-healing-title">
          <header><small>Recovery</small><h2 id="dnd-healing-title">Apply healing</h2></header>
          <label>Healing<input min="0" type="number" value={healing} onChange={(event) => setHealing(Math.max(0, Math.trunc(Number(event.target.value) || 0)))} /></label>
          <button type="button" onClick={applyHealing}>Restore HP</button>
          <small>Healing never exceeds the HP maximum and resets Death Save counters after HP is regained.</small>
        </section>

        <section className="dnd-health-panel" aria-labelledby="dnd-temp-title">
          <header><small>Nonstacking buffer</small><h2 id="dnd-temp-title">Temporary Hit Points</h2></header>
          <label>Offered Temporary HP<input min="0" type="number" value={offeredTemporaryHitPoints} onChange={(event) => setOfferedTemporaryHitPoints(Math.max(0, Math.trunc(Number(event.target.value) || 0)))} /></label>
          <div className="dnd-health-button-row">
            <button type="button" onClick={() => {
              setState((current) => chooseDndTemporaryHitPoints(current, offeredTemporaryHitPoints, "keep"));
              setLastResult(`Kept ${state.temporaryHitPoints} Temporary HP.`);
            }}>Keep current</button>
            <button type="button" onClick={() => {
              setState((current) => chooseDndTemporaryHitPoints(current, offeredTemporaryHitPoints, "replace"));
              setLastResult(`Replaced the Temporary HP pool with ${offeredTemporaryHitPoints}.`);
            }}>Take offered</button>
          </div>
          <small>Temporary HP does not stack, cannot be healed, and does not restore consciousness at 0 HP.</small>
        </section>
      </div>

      <section className="dnd-death-workspace" aria-labelledby="dnd-death-workspace-title">
        <header><div><small>At 0 Hit Points</small><h2 id="dnd-death-workspace-title">Death Saves &amp; Stabilization</h2></div><strong>{state.lifeState === "unconscious" ? "Roll required at turn start" : stateLabels[state.lifeState]}</strong></header>
        <div className="dnd-death-counters">
          <span><small>Successes</small><strong>{"●".repeat(state.deathSaveSuccesses)}{"○".repeat(3 - state.deathSaveSuccesses)}</strong></span>
          <span><small>Failures</small><strong>{"●".repeat(state.deathSaveFailures)}{"○".repeat(3 - state.deathSaveFailures)}</strong></span>
        </div>
        <div className="dnd-health-button-row">
          <button disabled={state.lifeState !== "unconscious"} type="button" onClick={rollDeathSave}>Roll Death Save</button>
          <button disabled={state.lifeState !== "unconscious"} type="button" onClick={() => {
            setState((current) => stabilizeDndCreature(current));
            setLastResult("The creature is Stable; both Death Save counters reset.");
            setStableRecoveryHours(secureRandomInteger(1, 4));
          }}>Stabilize after DC 10 Medicine</button>
          <button disabled={state.lifeState !== "stable"} type="button" onClick={() => {
            setState((current) => recoverStableDndCreature(current));
            setLastResult("After the recorded 1d4 hours, the creature regains 1 HP.");
            setStableRecoveryHours(undefined);
          }}>Complete stable recovery</button>
        </div>
        {stableRecoveryHours !== undefined && <p>Stable recovery time: {stableRecoveryHours} hour{stableRecoveryHours === 1 ? "" : "s"} before regaining 1 HP if not healed or damaged.</p>}
      </section>

      <section className="dnd-health-reference" aria-labelledby="dnd-health-reference-title">
        <header><small>Fast procedure</small><h2 id="dnd-health-reference-title">What the tracker enforces</h2></header>
        <div>
          <article><h3>Instant death</h3><p>When damage reduces a character to 0 HP, remaining damage equal to or greater than maximum HP causes death. At 0 HP, one damage instance equal to or greater than maximum HP also kills.</p></article>
          <article><h3>Death Saves</h3><p>10–20 succeeds; 1–9 fails. Three successes stabilize. Three failures kill. A natural 1 counts twice, and a natural 20 restores 1 HP.</p></article>
          <article><h3>Damage at 0</h3><p>Damage at 0 HP causes one failure, or two if the damage came from a Critical Hit. Damage ends Stable status.</p></article>
          <article><h3>Stabilization</h3><p>A successful DC 10 Wisdom (Medicine) check stabilizes a creature. Without healing, a Stable creature regains 1 HP after 1d4 hours.</p></article>
        </div>
      </section>

      <footer className="dnd-health-source">
        <strong>{source.reference}</strong>
        <a href={source.url} target="_blank" rel="noreferrer">Open the official damage and healing rules</a>
      </footer>
    </section>
  );
};
