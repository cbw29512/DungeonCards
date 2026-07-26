import { useMemo, useState } from "react";
import { cocInvestigatorRuleSources } from "../data/cocInvestigatorRuleSources";
import {
  COC_CHARACTERISTIC_NAMES,
  COC_OCCUPATION_VALUES,
  COC_STANDARD_CHARACTERISTIC_VALUES,
  applyPersonalInterestBoost,
  calculateCocDerivedAttributes,
  calculateCocThresholds,
  isCthulhuMythosSkill,
  shuffleStandardCharacteristics,
  validateOccupationValueAllocation,
  validateStandardCharacteristicAllocation,
  type CocCharacteristicName,
  type CocCharacteristics
} from "../utils/cocInvestigator";
import { CocRuleStatus } from "./CocRuleStatus";
import "../styles/coc-investigator-builder.css";

type OccupationRow = { id: string; skill: string; value: number; locked?: boolean };
type InterestRow = { id: string; skill: string; baseValue: number };

const DEFAULT_CHARACTERISTICS: CocCharacteristics = {
  STR: 60,
  CON: 50,
  POW: 70,
  DEX: 50,
  APP: 40,
  SIZ: 60,
  INT: 80,
  EDU: 50
};

const DEFAULT_OCCUPATION_ROWS: OccupationRow[] = [
  { id: "occupation-1", skill: "", value: 70 },
  { id: "occupation-2", skill: "", value: 60 },
  { id: "occupation-3", skill: "", value: 60 },
  { id: "occupation-4", skill: "", value: 50 },
  { id: "occupation-5", skill: "", value: 50 },
  { id: "occupation-6", skill: "", value: 50 },
  { id: "occupation-7", skill: "", value: 40 },
  { id: "occupation-8", skill: "", value: 40 },
  { id: "credit-rating", skill: "Credit Rating", value: 40, locked: true }
];

const DEFAULT_INTEREST_ROWS: InterestRow[] = [
  { id: "interest-1", skill: "", baseValue: 20 },
  { id: "interest-2", skill: "", baseValue: 20 },
  { id: "interest-3", skill: "", baseValue: 20 },
  { id: "interest-4", skill: "", baseValue: 20 }
];

const source = (sourceId: string) => {
  const record = cocInvestigatorRuleSources.find((candidate) => candidate.id === sourceId);
  if (!record) throw new Error(`Investigator creation source not found: ${sourceId}`);
  return record;
};

const formatBuild = (build: number): string => build > 0 ? `+${build}` : `${build}`;

export const CocInvestigatorBuilder = () => {
  const [name, setName] = useState("New Investigator");
  const [occupation, setOccupation] = useState("Custom occupation");
  const [characteristics, setCharacteristics] = useState<CocCharacteristics>(DEFAULT_CHARACTERISTICS);
  const [occupationRows, setOccupationRows] = useState<OccupationRow[]>(DEFAULT_OCCUPATION_ROWS);
  const [interestRows, setInterestRows] = useState<InterestRow[]>(DEFAULT_INTEREST_ROWS);

  const allocationValid = validateStandardCharacteristicAllocation(characteristics);
  const occupationValuesValid = validateOccupationValueAllocation(occupationRows.map((row) => row.value));
  const derived = useMemo(() => calculateCocDerivedAttributes(characteristics), [characteristics]);
  const occupationNames = occupationRows
    .filter((row) => !row.locked)
    .map((row) => row.skill.trim().toLowerCase())
    .filter(Boolean);
  const duplicateOccupationSkills = new Set(occupationNames).size !== occupationNames.length;
  const mythosOccupation = occupationRows.some((row) => isCthulhuMythosSkill(row.skill));
  const mythosInterest = interestRows.some((row) => isCthulhuMythosSkill(row.skill));

  const updateCharacteristic = (characteristic: CocCharacteristicName, value: number) => {
    setCharacteristics((current) => ({ ...current, [characteristic]: value }));
  };

  const updateOccupationRow = (id: string, patch: Partial<OccupationRow>) => {
    setOccupationRows((current) => current.map((row) => row.id === id ? { ...row, ...patch } : row));
  };

  const updateInterestRow = (id: string, patch: Partial<InterestRow>) => {
    setInterestRows((current) => current.map((row) => row.id === id ? { ...row, ...patch } : row));
  };

  const creationReady = allocationValid
    && occupationValuesValid
    && !duplicateOccupationSkills
    && !mythosOccupation
    && !mythosInterest
    && occupationRows.filter((row) => !row.locked).every((row) => row.skill.trim().length > 0)
    && interestRows.every((row) => row.skill.trim().length > 0);

  return (
    <section className="coc-investigator-builder" aria-labelledby="coc-investigator-builder-title">
      <header className="coc-investigator-builder__header">
        <div>
          <small>Public simplified creation workflow</small>
          <h2 id="coc-investigator-builder-title">Build an Investigator</h2>
          <p>Assign the fixed values, calculate the sheet, and build a custom occupation without importing paid-book catalogs.</p>
        </div>
        <span className={`coc-investigator-builder__status ${creationReady ? "is-ready" : ""}`}>
          {creationReady ? "Sheet ready" : "Finish required fields"}
        </span>
      </header>

      <div className="coc-investigator-builder__identity">
        <label>Investigator name<input value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label>Occupation<input value={occupation} onChange={(event) => setOccupation(event.target.value)} /></label>
      </div>

      <section className="coc-investigator-builder__section">
        <header>
          <div><small>Step 1</small><h3>Assign characteristics</h3></div>
          <button type="button" onClick={() => setCharacteristics(shuffleStandardCharacteristics())}>Shuffle fixed array</button>
        </header>
        <p>Use each value exactly once: {COC_STANDARD_CHARACTERISTIC_VALUES.join(", ")}.</p>
        <div className="coc-characteristic-grid">
          {COC_CHARACTERISTIC_NAMES.map((characteristic) => {
            const thresholds = calculateCocThresholds(characteristics[characteristic]);
            return (
              <label key={characteristic} className="coc-characteristic-control">
                <span>{characteristic}</span>
                <select value={characteristics[characteristic]} onChange={(event) => updateCharacteristic(characteristic, Number(event.target.value))}>
                  {COC_STANDARD_CHARACTERISTIC_VALUES.map((value, index) => (
                    <option key={`${value}-${index}`} value={value}>{value}</option>
                  ))}
                </select>
                <small>Hard {thresholds.hard} · Extreme {thresholds.extreme}</small>
              </label>
            );
          })}
        </div>
        <p className={allocationValid ? "coc-builder-validation is-valid" : "coc-builder-validation is-error"} aria-live="polite">
          {allocationValid ? "The fixed array is assigned correctly." : "Use every fixed characteristic value exactly once."}
        </p>
        <CocRuleStatus source={source("coc-investigator-characteristics")} />
      </section>

      <section className="coc-investigator-builder__section">
        <header><div><small>Step 2</small><h3>Record secondary attributes</h3></div></header>
        <div className="coc-derived-grid">
          <span><small>Hit Points</small><strong>{derived.hitPoints}</strong></span>
          <span><small>Move</small><strong>{derived.move}</strong></span>
          <span><small>Sanity</small><strong>{derived.sanity}</strong></span>
          <span><small>Magic Points</small><strong>{derived.magicPoints}</strong></span>
          <span><small>Damage Bonus</small><strong>{derived.damageBonus}</strong></span>
          <span><small>Build</small><strong>{formatBuild(derived.build)}</strong></span>
        </div>
        <p>STR + SIZ = {derived.strengthAndSize}. Starting Luck is generated separately on the Luck card.</p>
        <CocRuleStatus source={source("coc-investigator-secondary")} />
      </section>

      <section className="coc-investigator-builder__section">
        <header><div><small>Step 3</small><h3>Create the occupation skill package</h3></div></header>
        <p>Name eight appropriate occupation skills. Credit Rating is the ninth entry. Assign one 70, two 60s, three 50s, and three 40s.</p>
        <div className="coc-occupation-grid">
          {occupationRows.map((row, index) => (
            <div key={row.id}>
              <label>
                <span>{row.locked ? "Required" : `Occupation skill ${index + 1}`}</span>
                <input disabled={row.locked} value={row.skill} onChange={(event) => updateOccupationRow(row.id, { skill: event.target.value })} />
              </label>
              <label>
                <span>Value</span>
                <select value={row.value} onChange={(event) => updateOccupationRow(row.id, { value: Number(event.target.value) })}>
                  {[70, 60, 50, 40].map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>
              <small>Hard {calculateCocThresholds(row.value).hard} · Extreme {calculateCocThresholds(row.value).extreme}</small>
            </div>
          ))}
        </div>
        <div className="coc-builder-validation-list" aria-live="polite">
          <p className={occupationValuesValid ? "is-valid" : "is-error"}>{occupationValuesValid ? "Occupation values match the public allocation." : `Required values: ${COC_OCCUPATION_VALUES.join(", ")}.`}</p>
          {duplicateOccupationSkills && <p className="is-error">Occupation skill names must be unique.</p>}
          {mythosOccupation && <p className="is-error">Beginning investigators cannot assign creation values to Cthulhu Mythos.</p>}
        </div>
      </section>

      <section className="coc-investigator-builder__section">
        <header><div><small>Step 4</small><h3>Add personal-interest skills</h3></div></header>
        <p>Choose four nonoccupation skills and add 20 to each listed base value.</p>
        <div className="coc-interest-grid">
          {interestRows.map((row, index) => (
            <div key={row.id}>
              <label><span>Interest skill {index + 1}</span><input value={row.skill} onChange={(event) => updateInterestRow(row.id, { skill: event.target.value })} /></label>
              <label><span>Base</span><input min="0" max="100" type="number" value={row.baseValue} onChange={(event) => updateInterestRow(row.id, { baseValue: Math.min(100, Math.max(0, Math.trunc(Number(event.target.value) || 0))) })} /></label>
              <strong>{applyPersonalInterestBoost(row.baseValue)}</strong>
            </div>
          ))}
        </div>
        {mythosInterest && <p className="coc-builder-validation is-error" aria-live="polite">Beginning investigators cannot add personal-interest points to Cthulhu Mythos.</p>}
        <CocRuleStatus source={source("coc-investigator-occupation")} />
      </section>

      <section className="coc-investigator-summary" aria-label="Investigator creation summary">
        <header><small>Printable handoff</small><h3>{name.trim() || "Unnamed Investigator"}</h3><p>{occupation.trim() || "Unspecified occupation"}</p></header>
        <div>
          {COC_CHARACTERISTIC_NAMES.map((characteristic) => {
            const value = characteristics[characteristic];
            const thresholds = calculateCocThresholds(value);
            return <span key={characteristic}><small>{characteristic}</small><strong>{value}</strong><em>{thresholds.hard}/{thresholds.extreme}</em></span>;
          })}
        </div>
        <p><strong>HP {derived.hitPoints}</strong> · MOV {derived.move} · SAN {derived.sanity} · MP {derived.magicPoints} · DB {derived.damageBonus} · Build {formatBuild(derived.build)}</p>
        <small>Detailed age adjustments, expanded occupations, and alternate creation methods require the Keeper Rulebook or Investigator Handbook.</small>
      </section>
    </section>
  );
};
