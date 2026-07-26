import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { encounterMonsterCatalog } from "../data/encounterMonsterCatalog";
import type { RulesetId } from "../types/ruleCards";
import { createClientId } from "../utils/createId";
import { createDndCombatant, type DndEncounterState } from "../utils/dndEncounter";
import {
  buildDndMonsterEncounterDefaults,
  filterDndEncounterMonsters
} from "../utils/dndMonsterEncounterImport";
import {
  buildDndMonsterLiveReference,
  type DndMonsterLiveReference
} from "../utils/dndMonsterLiveReference";
import { secureRandomInteger } from "../utils/randomInteger";
import "../styles/dnd-monster-encounter-importer.css";

type DndMonsterEncounterImporterProps = {
  ruleset: RulesetId;
  encounter: DndEncounterState;
  setEncounter: Dispatch<SetStateAction<DndEncounterState>>;
  setReferences: Dispatch<SetStateAction<Record<string, DndMonsterLiveReference>>>;
};

export const DndMonsterEncounterImporter = ({
  ruleset,
  encounter,
  setEncounter,
  setReferences
}: DndMonsterEncounterImporterProps) => {
  const [query, setQuery] = useState("");
  const visible = useMemo(
    () => filterDndEncounterMonsters(encounterMonsterCatalog, ruleset, query),
    [query, ruleset]
  );
  const [monsterId, setMonsterId] = useState(visible[0]?.id ?? "");
  const selected = visible.find((entry) => entry.id === monsterId) ?? visible[0];
  const defaults = selected ? buildDndMonsterEncounterDefaults(selected) : undefined;
  const liveReference = selected ? buildDndMonsterLiveReference(selected) : undefined;
  const [maximumHitPoints, setMaximumHitPoints] = useState(defaults?.maximumHitPoints ?? 1);
  const [currentHitPoints, setCurrentHitPoints] = useState(defaults?.maximumHitPoints ?? 1);
  const [speedFeet, setSpeedFeet] = useState(defaults?.speedFeet ?? 30);
  const [dexterityModifier, setDexterityModifier] = useState(defaults?.dexterityModifier ?? 0);
  const [initiative, setInitiative] = useState(10 + (defaults?.dexterityModifier ?? 0));
  const [quantity, setQuantity] = useState(1);
  const [rollSeparately, setRollSeparately] = useState(true);
  const [result, setResult] = useState("");

  useEffect(() => {
    if (!visible.some((entry) => entry.id === monsterId)) {
      setMonsterId(visible[0]?.id ?? "");
    }
  }, [monsterId, visible]);

  useEffect(() => {
    if (!defaults) return;
    const hp = defaults.maximumHitPoints ?? 1;
    const speed = defaults.speedFeet ?? 30;
    const dexterity = defaults.dexterityModifier ?? 0;
    setMaximumHitPoints(hp);
    setCurrentHitPoints(hp);
    setSpeedFeet(speed);
    setDexterityModifier(dexterity);
    setInitiative(10 + dexterity);
    setResult("");
  }, [defaults?.monsterId]);

  const rollInitiative = () => setInitiative(secureRandomInteger(1, 20) + dexterityModifier);

  const addMonsters = () => {
    if (!defaults || !liveReference) return;
    const additions = Array.from({ length: quantity }, (_, index) => {
      const id = createClientId("srd-monster");
      const numberedName = quantity === 1 ? defaults.name : `${defaults.name} ${index + 1}`;
      const combatantInitiative = rollSeparately
        ? secureRandomInteger(1, 20) + dexterityModifier
        : initiative;
      return {
        id,
        combatant: createDndCombatant({
          id,
          name: numberedName,
          side: "enemy",
          initiative: combatantInitiative,
          dexterityModifier,
          speedFeet,
          surprised: false,
          ruleset,
          maximumHitPoints,
          currentHitPoints
        })
      };
    });
    setEncounter((current) => ({ ...current, combatants: [...current.combatants, ...additions.map(({ combatant }) => combatant)] }));
    setReferences((current) => ({
      ...current,
      ...Object.fromEntries(additions.map(({ id }) => [id, {
        ...liveReference,
        actions: liveReference.actions.map((action) => ({ ...action }))
      }]))
    }));
    setResult(`${quantity} ${defaults.name}${quantity === 1 ? "" : " entries"} added from ${defaults.sourceReference}.`);
  };

  return (
    <section className="dnd-monster-importer" aria-labelledby="dnd-monster-importer-title">
      <header>
        <div><small>Complete SRD catalog</small><h2 id="dnd-monster-importer-title">Add a Monster to Initiative</h2></div>
        <strong>{visible.length} matching</strong>
      </header>

      <p>
        DM Forge reads explicit HP, walking Speed, Dexterity, AC, saves, senses, and action sections from the sourced stat block. Parsed values remain editable before the monster enters the encounter.
      </p>

      <div className="dnd-monster-importer__selection">
        <label>Search<input type="search" placeholder="Name, type, size, or CR" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <label>Monster<select value={monsterId} onChange={(event) => setMonsterId(event.target.value)}>{visible.map((entry) => <option key={entry.id} value={entry.id}>{entry.name} · CR {entry.cr}</option>)}</select></label>
      </div>

      {defaults ? (
        <>
          <article className="dnd-monster-importer__reference">
            <header><div><small>{defaults.size} {defaults.type} · CR {defaults.challenge}</small><strong>{defaults.name}</strong></div><a href="?system=dnd&page=compendium">Open SRD Compendium</a></header>
            <p>{defaults.sourceReference}</p>
            {defaults.issues.length > 0 && <ul>{defaults.issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>}
          </article>

          <div className="dnd-monster-importer__values">
            <label>Maximum HP<input min="1" type="number" value={maximumHitPoints} onChange={(event) => { const hp = Math.max(1, Math.trunc(Number(event.target.value) || 1)); setMaximumHitPoints(hp); setCurrentHitPoints((current) => Math.min(current, hp)); }} /></label>
            <label>Current HP<input min="0" max={maximumHitPoints} type="number" value={currentHitPoints} onChange={(event) => setCurrentHitPoints(Math.min(maximumHitPoints, Math.max(0, Math.trunc(Number(event.target.value) || 0))))} /></label>
            <label>Walking Speed<input min="0" step="5" type="number" value={speedFeet} onChange={(event) => setSpeedFeet(Math.max(0, Math.trunc(Number(event.target.value) || 0)))} /></label>
            <label>DEX modifier<input min="-10" max="20" type="number" value={dexterityModifier} onChange={(event) => setDexterityModifier(Math.trunc(Number(event.target.value) || 0))} /></label>
            <label>Initiative<input type="number" value={initiative} onChange={(event) => setInitiative(Math.trunc(Number(event.target.value) || 0))} /></label>
            <label>Quantity<input min="1" max="20" type="number" value={quantity} onChange={(event) => setQuantity(Math.min(20, Math.max(1, Math.trunc(Number(event.target.value) || 1))))} /></label>
          </div>

          <div className="dnd-monster-importer__actions">
            <label className="dnd-encounter-check"><input type="checkbox" checked={rollSeparately} onChange={(event) => setRollSeparately(event.target.checked)} />Roll Initiative separately for each copy</label>
            <button disabled={rollSeparately} type="button" onClick={rollInitiative}>Roll shared Initiative</button>
            <button type="button" onClick={addMonsters}>Add {quantity} to encounter</button>
          </div>
        </>
      ) : (
        <p className="dnd-monster-importer__empty">No monsters match this search in the selected ruleset.</p>
      )}

      {result && <output aria-live="polite">{result}</output>}
    </section>
  );
};