import { useMemo, useState } from "react";
import { dndEncounterRules } from "../data/dndEncounterRules";
import { createClientId } from "../utils/createId";
import {
  advanceDndTurn,
  calculateDndConcentrationDc,
  createDndCombatant,
  endDndConcentration,
  isDndTurnRestrictedBySurprise,
  moveDndCombatant,
  resolveDndConcentrationSave,
  spendDndMovement,
  spendDndTurnResource,
  startDndConcentration,
  startDndEncounter,
  updateDndCombatant,
  type DndCombatantSide,
  type DndEncounterState
} from "../utils/dndEncounter";
import { secureRandomInteger } from "../utils/randomInteger";
import { RULESET_LABELS, type RulesetId } from "../types/ruleCards";
import "../styles/dnd-encounter-tracker.css";

const emptyEncounter = (ruleset: RulesetId): DndEncounterState => ({
  ruleset,
  round: 0,
  currentIndex: 0,
  started: false,
  combatants: []
});

const sideLabels: Record<DndCombatantSide, string> = {
  player: "Player",
  ally: "Ally",
  enemy: "Enemy"
};

export const DndEncounterTracker = () => {
  const [ruleset, setRuleset] = useState<RulesetId>("srd-5.2.1-2024");
  const [encounter, setEncounter] = useState<DndEncounterState>(() => emptyEncounter("srd-5.2.1-2024"));
  const [name, setName] = useState("New combatant");
  const [side, setSide] = useState<DndCombatantSide>("enemy");
  const [initiative, setInitiative] = useState(12);
  const [dexterityModifier, setDexterityModifier] = useState(2);
  const [speedFeet, setSpeedFeet] = useState(30);
  const [surprised, setSurprised] = useState(false);
  const [concentrationCombatantId, setConcentrationCombatantId] = useState("");
  const [concentrationEffect, setConcentrationEffect] = useState("Bless");
  const [damageTaken, setDamageTaken] = useState(10);
  const [constitutionSaveBonus, setConstitutionSaveBonus] = useState(2);
  const [concentrationResult, setConcentrationResult] = useState("");

  const source = dndEncounterRules[ruleset];
  const active = encounter.started ? encounter.combatants[encounter.currentIndex] : undefined;
  const activeRestricted = active ? isDndTurnRestrictedBySurprise(encounter, active) : false;
  const concentrationDc = calculateDndConcentrationDc(ruleset, damageTaken);
  const concentratingCombatants = useMemo(
    () => encounter.combatants.filter((combatant) => combatant.concentration),
    [encounter.combatants]
  );

  const changeRuleset = (next: RulesetId) => {
    setRuleset(next);
    setEncounter(emptyEncounter(next));
    setConcentrationCombatantId("");
    setConcentrationResult("");
  };

  const rollInitiative = () => {
    const first = secureRandomInteger(1, 20);
    const second = secureRandomInteger(1, 20);
    const die = ruleset === "srd-5.2.1-2024" && surprised ? Math.min(first, second) : first;
    setInitiative(die + dexterityModifier);
  };

  const addCombatant = () => {
    const combatant = createDndCombatant({
      id: createClientId("combatant"),
      name,
      side,
      initiative,
      dexterityModifier,
      speedFeet,
      surprised,
      ruleset
    });
    setEncounter((current) => ({ ...current, combatants: [...current.combatants, combatant] }));
    setName("New combatant");
    setSurprised(false);
  };

  const startEncounter = () => {
    const started = startDndEncounter(ruleset, encounter.combatants);
    setEncounter(started);
    setConcentrationCombatantId(started.combatants[0]?.id ?? "");
    setConcentrationResult("");
  };

  const runConcentrationSave = () => {
    const combatant = encounter.combatants.find((candidate) => candidate.id === concentrationCombatantId);
    if (!combatant?.concentration) {
      setConcentrationResult("Select a combatant who is currently concentrating.");
      return;
    }
    const roll = secureRandomInteger(1, 20);
    const result = resolveDndConcentrationSave({
      ruleset,
      damageTaken,
      roll,
      constitutionSaveBonus
    });
    if (!result.maintained) setEncounter((current) => endDndConcentration(current, combatant.id));
    setConcentrationResult(
      `${combatant.name}: ${roll} + ${constitutionSaveBonus} = ${result.total} vs. DC ${result.dc}. ${result.maintained ? "Concentration maintained." : "Concentration ends."}`
    );
  };

  return (
    <section className="dnd-encounter-tracker" aria-labelledby="dnd-encounter-title">
      <header className="dnd-encounter-tracker__header">
        <div>
          <p>Live combat state</p>
          <h1 id="dnd-encounter-title">Initiative, Turns &amp; Concentration</h1>
          <span>Run the round in order, track each creature’s action economy and Reaction, and resolve concentration one damage source at a time.</span>
        </div>
        <div className="dnd-encounter-ruleset" aria-label="D&D rules edition">
          {(Object.keys(RULESET_LABELS) as RulesetId[]).map((option) => (
            <button aria-pressed={ruleset === option} key={option} type="button" onClick={() => changeRuleset(option)}>{RULESET_LABELS[option]}</button>
          ))}
        </div>
      </header>

      <section className="dnd-encounter-source-note">
        <strong>{RULESET_LABELS[ruleset]} only</strong>
        <p>{source.surpriseSummary}</p>
        <p>{source.reactionSummary}</p>
      </section>

      {!encounter.started && (
        <section className="dnd-combatant-builder" aria-labelledby="combatant-builder-title">
          <header><small>Encounter setup</small><h2 id="combatant-builder-title">Add combatants</h2></header>
          <div className="dnd-combatant-builder__grid">
            <label>Name<input value={name} onChange={(event) => setName(event.target.value)} /></label>
            <label>Side<select value={side} onChange={(event) => setSide(event.target.value as DndCombatantSide)}>{Object.entries(sideLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label>Dexterity modifier<input min="-5" max="15" type="number" value={dexterityModifier} onChange={(event) => setDexterityModifier(Math.trunc(Number(event.target.value) || 0))} /></label>
            <label>Initiative<input type="number" value={initiative} onChange={(event) => setInitiative(Math.trunc(Number(event.target.value) || 0))} /></label>
            <label>Speed<input min="0" step="5" type="number" value={speedFeet} onChange={(event) => setSpeedFeet(Math.max(0, Math.trunc(Number(event.target.value) || 0)))} /></label>
            <label className="dnd-encounter-check"><input type="checkbox" checked={surprised} onChange={(event) => setSurprised(event.target.checked)} />Surprised when combat begins</label>
          </div>
          <div className="dnd-encounter-button-row">
            <button type="button" onClick={rollInitiative}>Roll Initiative{ruleset === "srd-5.2.1-2024" && surprised ? " with Disadvantage" : ""}</button>
            {ruleset === "srd-5.2.1-2024" && <button type="button" onClick={() => setInitiative(10 + dexterityModifier)}>Use Initiative score ({10 + dexterityModifier})</button>}
            <button type="button" onClick={addCombatant}>Add combatant</button>
            <button disabled={encounter.combatants.length === 0} type="button" onClick={startEncounter}>Start encounter</button>
          </div>
        </section>
      )}

      <section className="dnd-initiative-board" aria-labelledby="initiative-board-title">
        <header>
          <div><small>Turn order</small><h2 id="initiative-board-title">{encounter.started ? `Round ${encounter.round}` : "Setup order"}</h2></div>
          {encounter.started && <div className="dnd-encounter-button-row"><button type="button" onClick={() => setEncounter((current) => advanceDndTurn(current))}>End turn / Next</button><button type="button" onClick={() => setEncounter(emptyEncounter(ruleset))}>End encounter</button></div>}
        </header>

        {encounter.combatants.length === 0 ? <p className="dnd-encounter-empty">Add at least one combatant to begin.</p> : (
          <ol>
            {encounter.combatants.map((combatant, index) => {
              const isActive = encounter.started && index === encounter.currentIndex;
              const restricted = isActive && isDndTurnRestrictedBySurprise(encounter, combatant);
              return (
                <li className={`${isActive ? "is-active " : ""}side-${combatant.side}`} key={combatant.id}>
                  <header>
                    <span className="dnd-initiative-count">{combatant.initiative}</span>
                    <div><strong>{combatant.name}</strong><small>{sideLabels[combatant.side]} · Speed {combatant.speedFeet} ft.{combatant.surprised ? " · Surprised" : ""}</small></div>
                    <div className="dnd-order-controls"><button aria-label={`Move ${combatant.name} earlier`} disabled={index === 0} type="button" onClick={() => setEncounter((current) => moveDndCombatant(current, combatant.id, -1))}>↑</button><button aria-label={`Move ${combatant.name} later`} disabled={index === encounter.combatants.length - 1} type="button" onClick={() => setEncounter((current) => moveDndCombatant(current, combatant.id, 1))}>↓</button>{!encounter.started && <button type="button" onClick={() => setEncounter((current) => ({ ...current, combatants: current.combatants.filter((candidate) => candidate.id !== combatant.id) }))}>Remove</button>}</div>
                  </header>
                  {encounter.started && (
                    <div className="dnd-turn-resources">
                      <button disabled={!isActive || restricted || !combatant.actionAvailable} type="button" onClick={() => setEncounter((current) => spendDndTurnResource(current, combatant.id, "action"))}>Action {combatant.actionAvailable ? "ready" : "used"}</button>
                      <button disabled={!isActive || restricted || !combatant.bonusActionAvailable} type="button" onClick={() => setEncounter((current) => spendDndTurnResource(current, combatant.id, "bonusAction"))}>Bonus {combatant.bonusActionAvailable ? "ready" : "used"}</button>
                      <button disabled={!combatant.reactionAvailable} type="button" onClick={() => setEncounter((current) => spendDndTurnResource(current, combatant.id, "reaction"))}>Reaction {combatant.reactionAvailable ? "ready" : "used"}</button>
                      <button disabled={!isActive || restricted || combatant.movementRemainingFeet === 0} type="button" onClick={() => setEncounter((current) => spendDndMovement(current, combatant.id, 5))}>Move 5 ft. ({combatant.movementRemainingFeet} left)</button>
                    </div>
                  )}
                  {restricted && <p className="dnd-surprise-warning">2014 surprise: no movement, Action, Bonus Action, or Reaction until this first turn ends.</p>}
                  {combatant.concentration && <p className="dnd-concentration-tag">Concentrating: {combatant.concentration.effectName}</p>}
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {encounter.started && encounter.combatants.length > 0 && (
        <section className="dnd-concentration-workspace" aria-labelledby="concentration-title">
          <header><small>Spell and effect state</small><h2 id="concentration-title">Concentration</h2></header>
          <p>{source.concentrationSummary}</p>
          <div className="dnd-concentration-controls">
            <label>Combatant<select value={concentrationCombatantId} onChange={(event) => { setConcentrationCombatantId(event.target.value); setConcentrationResult(""); }}><option value="">Select combatant</option>{encounter.combatants.map((combatant) => <option key={combatant.id} value={combatant.id}>{combatant.name}</option>)}</select></label>
            <label>Effect<input value={concentrationEffect} onChange={(event) => setConcentrationEffect(event.target.value)} /></label>
            <button disabled={!concentrationCombatantId} type="button" onClick={() => setEncounter((current) => startDndConcentration(current, concentrationCombatantId, concentrationEffect))}>Start / replace concentration</button>
            <button disabled={!concentrationCombatantId} type="button" onClick={() => setEncounter((current) => endDndConcentration(current, concentrationCombatantId))}>End concentration</button>
          </div>
          <div className="dnd-concentration-save">
            <label>Damage from this source<input min="0" type="number" value={damageTaken} onChange={(event) => { setDamageTaken(Math.max(0, Math.trunc(Number(event.target.value) || 0))); setConcentrationResult(""); }} /></label>
            <label>Constitution save bonus<input type="number" value={constitutionSaveBonus} onChange={(event) => { setConstitutionSaveBonus(Math.trunc(Number(event.target.value) || 0)); setConcentrationResult(""); }} /></label>
            <strong>DC {concentrationDc}</strong>
            <button disabled={!concentrationCombatantId || concentratingCombatants.length === 0} type="button" onClick={runConcentrationSave}>Roll save</button>
          </div>
          <p className="dnd-concentration-reminder">Multiple damage sources require separate saves. Enter and resolve each source individually.</p>
          {concentrationResult && <output aria-live="polite">{concentrationResult}</output>}
        </section>
      )}

      <footer className="dnd-encounter-sources">
        <a href={source.initiativeUrl} target="_blank" rel="noreferrer">{source.initiativeReference}</a>
        <a href={source.concentrationUrl} target="_blank" rel="noreferrer">{source.concentrationReference}</a>
      </footer>
    </section>
  );
};
