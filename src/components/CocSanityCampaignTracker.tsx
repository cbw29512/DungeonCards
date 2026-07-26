import { useState } from "react";
import { cocSanityCampaignSources } from "../data/cocSanityCampaignSources";
import { createClientId } from "../utils/createId";
import {
  addSanityCampaignEffect,
  resolveMonthlyPsychoanalysis,
  rollIndefiniteCareMonths,
  toggleSanityCampaignEffect,
  type CocPsychoanalysisOutcome,
  type CocSanityCampaignEffect,
  type CocSanityCampaignEffectType
} from "../utils/cocSanityCampaign";
import { secureRandomInteger } from "../utils/randomInteger";
import { CocRuleStatus } from "./CocRuleStatus";
import "../styles/coc-sanity-campaign.css";

const source = (sourceId: string) => {
  const record = cocSanityCampaignSources.find((candidate) => candidate.id === sourceId);
  if (!record) throw new Error(`Sanity campaign source not found: ${sourceId}`);
  return record;
};

const effectLabels: Record<CocSanityCampaignEffectType, string> = {
  phobia: "Phobia",
  mania: "Mania",
  backstory: "Backstory change",
  delusion: "Delusion",
  other: "Other campaign effect"
};

export const CocSanityCampaignTracker = () => {
  const [currentSanity, setCurrentSanity] = useState(50);
  const [indefiniteActive, setIndefiniteActive] = useState(false);
  const [careMonths, setCareMonths] = useState<number>();
  const [monthsCompleted, setMonthsCompleted] = useState(0);
  const [psychoanalysisSkill, setPsychoanalysisSkill] = useState(50);
  const [analystAvailable, setAnalystAvailable] = useState(true);
  const [treatmentResult, setTreatmentResult] = useState<CocPsychoanalysisOutcome>();
  const [effectType, setEffectType] = useState<CocSanityCampaignEffectType>("phobia");
  const [effectDescription, setEffectDescription] = useState("");
  const [effects, setEffects] = useState<CocSanityCampaignEffect[]>([]);

  const beginCare = () => {
    setCareMonths(rollIndefiniteCareMonths());
    setMonthsCompleted(0);
    setTreatmentResult(undefined);
    setAnalystAvailable(true);
  };

  const runMonthlyTreatment = () => {
    const outcome = resolveMonthlyPsychoanalysis(
      currentSanity,
      psychoanalysisSkill,
      secureRandomInteger(1, 100)
    );
    setTreatmentResult(outcome);
    setCurrentSanity(outcome.nextSanity);
    if (outcome.treatmentConcludes) setAnalystAvailable(false);
  };

  const addEffect = () => {
    setEffects((current) => addSanityCampaignEffect(current, {
      id: createClientId("sanity-effect"),
      type: effectType,
      description: effectDescription,
      active: true
    }));
    if (effectDescription.trim()) setEffectDescription("");
  };

  const careComplete = careMonths !== undefined && monthsCompleted >= careMonths;

  return (
    <article className="coc-card coc-card--interactive coc-sanity-campaign">
      <header className="coc-card__header">
        <div>
          <small>Campaign state</small>
          <h2>Ongoing Sanity Record</h2>
        </div>
        <span className="coc-card__stamp">CASE</span>
      </header>

      <p className="coc-card__summary">
        Record lasting effects, treatment, and care duration without hiding the boundary between public procedures and the owned-rule trigger for indefinite insanity.
      </p>

      <section className="coc-sanity-owned-boundary">
        <header><small>Owned-source decision</small><strong>Has indefinite insanity begun?</strong></header>
        <p>The free official wiki does not state the trigger. Consult the Keeper Rulebook, then activate this tracker manually.</p>
        <label className="coc-check-control">
          <input type="checkbox" checked={indefiniteActive} onChange={(event) => {
            setIndefiniteActive(event.target.checked);
            setTreatmentResult(undefined);
          }} />
          Indefinite insanity is active according to the owned rules source
        </label>
      </section>

      <div className="coc-control-grid coc-control-grid--two">
        <label>Current Sanity<input min="0" max="99" type="number" value={currentSanity} onChange={(event) => {
          setCurrentSanity(Math.min(99, Math.max(0, Math.trunc(Number(event.target.value) || 0))));
          setTreatmentResult(undefined);
        }} /></label>
        <label>Psychoanalysis skill<input min="1" max="100" type="number" value={psychoanalysisSkill} onChange={(event) => {
          setPsychoanalysisSkill(Math.min(100, Math.max(1, Math.trunc(Number(event.target.value) || 1))));
          setTreatmentResult(undefined);
        }} /></label>
      </div>

      <section className="coc-care-clock">
        <header><small>Institutional or similar care</small><strong>{careMonths === undefined ? "Duration not generated" : `${monthsCompleted} of ${careMonths} months completed`}</strong></header>
        <div className="coc-button-row coc-button-row--compact">
          <button disabled={!indefiniteActive} type="button" onClick={beginCare}>{careMonths === undefined ? "Roll 1D6 care months" : "Reroll care duration"}</button>
          <button disabled={!indefiniteActive || careMonths === undefined || careComplete} type="button" onClick={() => {
            setMonthsCompleted((current) => careMonths === undefined ? current : Math.min(careMonths, current + 1));
            setTreatmentResult(undefined);
          }}>Complete one month</button>
        </div>
        {careComplete && <p className="coc-care-clock__complete" aria-live="polite">The recorded care duration is complete. The Keeper resolves the investigator's current state using the owned rules source.</p>}
      </section>

      <section className="coc-monthly-treatment">
        <header><small>Once per game month</small><strong>Psychoanalysis</strong></header>
        <p>Sanity recovery and the care-duration clock are separate. Psychoanalysis alone does not shorten indefinite insanity.</p>
        <button className="coc-roll-button" disabled={!analystAvailable} type="button" onClick={runMonthlyTreatment}>Roll monthly Psychoanalysis</button>
        {!analystAvailable && <button type="button" onClick={() => {
          setAnalystAvailable(true);
          setTreatmentResult(undefined);
        }}>Start with a different analyst</button>}
        {treatmentResult && (
          <section className="coc-compact-result" aria-live="polite">
            <small>Roll {treatmentResult.roll} · {treatmentResult.successLevel}</small>
            <strong>{treatmentResult.sanityChange > 0 ? `+${treatmentResult.sanityChange}` : treatmentResult.sanityChange}</strong>
            <span>SAN {treatmentResult.nextSanity}</span>
            <p>{treatmentResult.summary}</p>
          </section>
        )}
        <CocRuleStatus source={source("coc-psychoanalysis-recovery")} />
      </section>

      <section className="coc-sanity-effects">
        <header><small>Persistent record</small><strong>Phobias, manias, backstory, and delusions</strong></header>
        <div className="coc-control-grid coc-control-grid--two">
          <label>Effect type<select value={effectType} onChange={(event) => setEffectType(event.target.value as CocSanityCampaignEffectType)}>
            {Object.entries(effectLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select></label>
          <label>Description<input value={effectDescription} onChange={(event) => setEffectDescription(event.target.value)} /></label>
        </div>
        <button type="button" onClick={addEffect}>Add campaign effect</button>
        {effects.length === 0 ? (
          <p className="coc-sanity-effects__empty">No lasting campaign effects recorded.</p>
        ) : (
          <ul>
            {effects.map((effect) => (
              <li className={effect.active ? "is-active" : "is-resolved"} key={effect.id}>
                <span><small>{effectLabels[effect.type]}</small><strong>{effect.description}</strong></span>
                <button type="button" onClick={() => setEffects((current) => toggleSanityCampaignEffect(current, effect.id))}>{effect.active ? "Mark resolved" : "Reactivate"}</button>
                <button type="button" onClick={() => setEffects((current) => current.filter((candidate) => candidate.id !== effect.id))}>Remove</button>
              </li>
            ))}
          </ul>
        )}
        <CocRuleStatus source={source("coc-sanity-lasting-effects")} />
      </section>
    </article>
  );
};
