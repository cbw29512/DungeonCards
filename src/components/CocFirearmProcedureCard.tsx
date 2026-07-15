import { useState } from "react";
import type { CocPercentileResult } from "../types/coc";
import {
  resolveCocHandgunProcedure,
  type CocCoverDiveResult
} from "../utils/cocFirearm";
import { rollCocPercentile } from "../utils/cocPercentile";
import { CocRuleStatus } from "./CocRuleStatus";

const modeLabel = {
  normal: "Normal roll",
  bonus: "One Bonus die",
  "double-bonus": "Two Bonus dice",
  penalty: "One Penalty die",
  "double-penalty": "Two Penalty dice"
} as const;

export const CocFirearmProcedureCard = () => {
  const [skill, setSkill] = useState(55);
  const [dexterity, setDexterity] = useState(60);
  const [distanceFeet, setDistanceFeet] = useState(15);
  const [shotsThisRound, setShotsThisRound] = useState<1 | 2 | 3>(1);
  const [coverDiveResult, setCoverDiveResult] = useState<CocCoverDiveResult>("none");
  const [ammunition, setAmmunition] = useState(6);
  const [results, setResults] = useState<CocPercentileResult[]>([]);
  const [error, setError] = useState<string>();

  const procedure = resolveCocHandgunProcedure({
    dexterity,
    distanceFeet,
    shotsThisRound,
    coverDiveResult
  });

  const fire = () => {
    try {
      if (ammunition < shotsThisRound) {
        throw new Error(`Only ${ammunition} round${ammunition === 1 ? " remains" : "s remain"}; ${shotsThisRound} were selected.`);
      }
      setResults(Array.from(
        { length: shotsThisRound },
        () => rollCocPercentile(skill, "regular", procedure.rollMode)
      ));
      setAmmunition((current) => current - shotsThisRound);
      setError(undefined);
    } catch (caught) {
      console.error("CoC handgun procedure failed", {
        skill,
        dexterity,
        distanceFeet,
        shotsThisRound,
        coverDiveResult,
        caught
      });
      setError(caught instanceof Error ? caught.message : "The handgun procedure failed.");
    }
  };

  const clearResults = () => setResults([]);

  return (
    <article className="coc-card coc-card--interactive">
      <header className="coc-card__header">
        <div>
          <small>Firearm procedure</small>
          <h2>Handgun Attack Setup</h2>
        </div>
        <span className="coc-card__stamp">GUN</span>
      </header>

      <p className="coc-card__summary">
        Enter the scene conditions. The card derives readied initiative, point-blank range, multiple-shot penalties, dive-for-cover effects, and the final net dice modifier.
      </p>

      <div className="coc-control-grid coc-control-grid--two">
        <label>
          Firearms (Handgun)
          <input min="1" max="100" type="number" value={skill} onChange={(event) => {
            setSkill(Math.max(1, Math.min(100, Math.trunc(Number(event.target.value) || 1))));
            clearResults();
          }} />
        </label>
        <label>
          DEX
          <input min="1" max="100" type="number" value={dexterity} onChange={(event) => {
            setDexterity(Math.max(1, Math.min(100, Math.trunc(Number(event.target.value) || 1))));
            clearResults();
          }} />
        </label>
        <label>
          Distance in feet
          <input min="0" type="number" value={distanceFeet} onChange={(event) => {
            setDistanceFeet(Math.max(0, Number(event.target.value) || 0));
            clearResults();
          }} />
        </label>
        <label>
          Shots this round
          <select value={shotsThisRound} onChange={(event) => {
            setShotsThisRound(Number(event.target.value) as 1 | 2 | 3);
            clearResults();
          }}>
            <option value="1">1 shot</option>
            <option value="2">2 shots</option>
            <option value="3">3 shots</option>
          </select>
        </label>
        <label>
          Target's dive for cover
          <select value={coverDiveResult} onChange={(event) => {
            setCoverDiveResult(event.target.value as CocCoverDiveResult);
            clearResults();
          }}>
            <option value="none">Did not dive</option>
            <option value="failed">Dived, Dodge failed</option>
            <option value="successful">Dived, Dodge succeeded</option>
          </select>
        </label>
      </div>

      <div className="coc-record-grid">
        <span><small>Readied initiative</small><strong>DEX {procedure.readiedInitiativeDex}</strong></span>
        <span><small>Point blank</small><strong>Within {procedure.pointBlankRangeFeet} ft</strong></span>
        <span><small>Current range</small><strong>{procedure.pointBlank ? "Point blank" : "Beyond point blank"}</strong></span>
        <span><small>Net modifier</small><strong>{modeLabel[procedure.rollMode]}</strong></span>
      </div>

      <ul className="coc-procedure-reasons">
        {procedure.reasons.map((reason) => <li key={reason}>{reason}</li>)}
      </ul>

      <div className="coc-ammo" aria-label={`${ammunition} of 6 rounds remaining`}>
        {Array.from({ length: 6 }, (_, index) => (
          <span className={index < ammunition ? "is-loaded" : ""} key={index} aria-hidden="true" />
        ))}
        <strong>{ammunition}/6</strong>
      </div>

      <div className="coc-button-row">
        <button className="coc-roll-button" type="button" onClick={fire}>Resolve {shotsThisRound} shot{shotsThisRound === 1 ? "" : "s"}</button>
        <button type="button" onClick={() => {
          setAmmunition(6);
          clearResults();
          setError(undefined);
        }}>Reload</button>
      </div>

      {results.length > 0 && (
        <section className="coc-roll-result" aria-live="polite">
          <h3>Shot results</h3>
          <div className="coc-shot-results">
            {results.map((result, index) => (
              <span key={`${result.roll}-${index}`}>
                <small>Shot {index + 1}</small>
                <strong>{result.roll}</strong>
                <em>{result.successLevel.replace("-", " ")}</em>
              </span>
            ))}
          </div>
          {procedure.targetForfeitsNextAttack && (
            <p>The target forfeits its next attack because it chose to dive for cover, whether the Dodge roll succeeded or failed.</p>
          )}
        </section>
      )}

      <CocRuleStatus sourceId="coc-firearm-procedure" />
      {error && <p className="coc-error" role="alert">{error}</p>}
    </article>
  );
};