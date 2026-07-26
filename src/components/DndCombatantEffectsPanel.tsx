import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { getDndConditions } from "../data/dndConditions";
import type { RulesetId } from "../types/ruleCards";
import { createClientId } from "../utils/createId";
import {
  addDndCombatantEffect,
  removeDndCombatantEffect,
  resolveDndEffectSave,
  type DndEffectTickTiming,
  type DndEncounterState
} from "../utils/dndEncounter";
import { secureRandomInteger } from "../utils/randomInteger";
import "../styles/dnd-combatant-effects.css";

const incapacitatingConditions = new Set([
  "Incapacitated",
  "Paralyzed",
  "Petrified",
  "Stunned",
  "Unconscious"
]);

const tickLabels: Record<DndEffectTickTiming, string> = {
  start: "Start of affected turn",
  end: "End of affected turn",
  manual: "Manual removal"
};

type DndCombatantEffectsPanelProps = {
  ruleset: RulesetId;
  encounter: DndEncounterState;
  setEncounter: Dispatch<SetStateAction<DndEncounterState>>;
};

export const DndCombatantEffectsPanel = ({
  ruleset,
  encounter,
  setEncounter
}: DndCombatantEffectsPanelProps) => {
  const conditions = useMemo(() => getDndConditions(ruleset), [ruleset]);
  const [combatantId, setCombatantId] = useState("");
  const [entryType, setEntryType] = useState<"condition" | "custom">("condition");
  const [conditionId, setConditionId] = useState(conditions[0]?.id ?? "");
  const [customName, setCustomName] = useState("Custom effect");
  const [remainingRounds, setRemainingRounds] = useState(1);
  const [hasRoundDuration, setHasRoundDuration] = useState(false);
  const [tickTiming, setTickTiming] = useState<DndEffectTickTiming>("manual");
  const [hasSave, setHasSave] = useState(false);
  const [saveAbility, setSaveAbility] = useState("Constitution");
  const [saveDc, setSaveDc] = useState(10);
  const [saveBonus, setSaveBonus] = useState(0);
  const [result, setResult] = useState("");

  useEffect(() => {
    if (!conditions.some((condition) => condition.id === conditionId)) {
      setConditionId(conditions[0]?.id ?? "");
    }
  }, [conditionId, conditions]);

  useEffect(() => {
    if (combatantId && !encounter.combatants.some((combatant) => combatant.id === combatantId)) {
      setCombatantId("");
      setResult("");
    }
  }, [combatantId, encounter.combatants]);

  const selectedCondition = conditions.find((condition) => condition.id === conditionId) ?? conditions[0];
  const selectedCombatant = encounter.combatants.find((combatant) => combatant.id === combatantId);

  const addEffect = () => {
    if (!selectedCombatant) {
      setResult("Select a combatant first.");
      return;
    }
    const name = entryType === "condition" ? selectedCondition?.name ?? "Condition" : customName;
    const breaksConcentration = entryType === "condition" && incapacitatingConditions.has(name);
    setEncounter((current) => addDndCombatantEffect(current, selectedCombatant.id, {
      id: createClientId("combat-effect"),
      name,
      conditionId: entryType === "condition" ? selectedCondition?.id : undefined,
      remainingRounds: hasRoundDuration ? remainingRounds : undefined,
      tickTiming: hasRoundDuration ? tickTiming : "manual",
      saveAbility: hasSave ? saveAbility : undefined,
      saveDc: hasSave ? saveDc : undefined,
      breaksConcentration
    }));
    setResult(`${name} applied to ${selectedCombatant.name}.${breaksConcentration ? " Concentration ended because the condition includes Incapacitated." : ""}`);
  };

  const rollSave = (effectId: string, effectName: string) => {
    if (!selectedCombatant) return;
    const roll = secureRandomInteger(1, 20);
    setEncounter((current) => {
      const resolved = resolveDndEffectSave(current, selectedCombatant.id, effectId, roll, saveBonus);
      setResult(`${selectedCombatant.name}: ${roll} + ${saveBonus} = ${resolved.total}. ${resolved.succeeded ? `${effectName} ends.` : `${effectName} remains.`}`);
      return resolved.state;
    });
  };

  return (
    <section className="dnd-combatant-effects" aria-labelledby="dnd-combatant-effects-title">
      <header>
        <div>
          <small>Combatant state</small>
          <h2 id="dnd-combatant-effects-title">Conditions &amp; Timed Effects</h2>
        </div>
        <strong>{encounter.combatants.reduce((total, combatant) => total + combatant.effects.length, 0)} active</strong>
      </header>

      <p className="dnd-effect-boundary">
        Condition names and effects come from the selected official ruleset. Durations, save timing, and DCs are entered from the specific spell, feature, monster action, or DM ruling that created the effect.
      </p>

      <div className="dnd-effect-builder">
        <label>Combatant<select value={combatantId} onChange={(event) => { setCombatantId(event.target.value); setResult(""); }}><option value="">Select combatant</option>{encounter.combatants.map((combatant) => <option key={combatant.id} value={combatant.id}>{combatant.name}</option>)}</select></label>
        <label>Entry type<select value={entryType} onChange={(event) => setEntryType(event.target.value as "condition" | "custom")}><option value="condition">Official condition</option><option value="custom">Custom effect</option></select></label>
        {entryType === "condition" ? (
          <label>Condition<select value={conditionId} onChange={(event) => setConditionId(event.target.value)}>{conditions.map((condition) => <option key={condition.id} value={condition.id}>{condition.name}</option>)}</select></label>
        ) : (
          <label>Effect name<input value={customName} onChange={(event) => setCustomName(event.target.value)} /></label>
        )}
        <label className="dnd-encounter-check"><input type="checkbox" checked={hasRoundDuration} onChange={(event) => setHasRoundDuration(event.target.checked)} />Track a round duration</label>
        {hasRoundDuration && <label>Rounds<input min="1" type="number" value={remainingRounds} onChange={(event) => setRemainingRounds(Math.max(1, Math.trunc(Number(event.target.value) || 1)))} /></label>}
        {hasRoundDuration && <label>Decrement<select value={tickTiming} onChange={(event) => setTickTiming(event.target.value as DndEffectTickTiming)}><option value="start">Start of affected turn</option><option value="end">End of affected turn</option><option value="manual">Manual only</option></select></label>}
        <label className="dnd-encounter-check"><input type="checkbox" checked={hasSave} onChange={(event) => setHasSave(event.target.checked)} />Has a save to end</label>
        {hasSave && <label>Save ability<input value={saveAbility} onChange={(event) => setSaveAbility(event.target.value)} /></label>}
        {hasSave && <label>Save DC<input min="1" type="number" value={saveDc} onChange={(event) => setSaveDc(Math.max(1, Math.trunc(Number(event.target.value) || 1)))} /></label>}
        <button disabled={!combatantId} type="button" onClick={addEffect}>Apply effect</button>
      </div>

      {selectedCondition && entryType === "condition" && (
        <article className="dnd-selected-condition">
          <header><strong>{selectedCondition.name}</strong><a href={selectedCondition.sourceUrl} target="_blank" rel="noreferrer">{selectedCondition.sourceReference}</a></header>
          <p>{selectedCondition.summary}</p>
        </article>
      )}

      {selectedCombatant && selectedCombatant.effects.length > 0 && (
        <section className="dnd-effect-roster" aria-label={`Effects on ${selectedCombatant.name}`}>
          <header><strong>{selectedCombatant.name}</strong><label>Save bonus<input type="number" value={saveBonus} onChange={(event) => setSaveBonus(Math.trunc(Number(event.target.value) || 0))} /></label></header>
          <ul>
            {selectedCombatant.effects.map((effect) => (
              <li key={effect.id}>
                <div><strong>{effect.name}</strong><small>{effect.remainingRounds === undefined ? "No automatic duration" : `${effect.remainingRounds} round${effect.remainingRounds === 1 ? "" : "s"} · ${tickLabels[effect.tickTiming]}`}{effect.saveDc ? ` · ${effect.saveAbility} DC ${effect.saveDc}` : ""}</small></div>
                {effect.saveDc && <button type="button" onClick={() => rollSave(effect.id, effect.name)}>Roll save</button>}
                <button type="button" onClick={() => setEncounter((current) => removeDndCombatantEffect(current, selectedCombatant.id, effect.id))}>Remove</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {result && <output aria-live="polite">{result}</output>}
    </section>
  );
};
