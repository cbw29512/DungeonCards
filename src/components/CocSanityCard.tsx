import { useState } from "react";
import type { CocPercentileResult } from "../types/coc";
import {
  applyCocSanityLoss,
  isCocSanityRollSuccessful,
  type CocSanityLossState
} from "../utils/cocSanity";
import { rollDiceFormula } from "../utils/rollDice";
import { rollCocPercentile } from "../utils/cocPercentile";
import { secureRandomInteger } from "../utils/randomInteger";
import { CocRuleStatus } from "./CocRuleStatus";

export const CocSanityCard = () => {
  const [sanity, setSanity] = useState(60);
  const [intelligence, setIntelligence] = useState(70);
  const [successLossFormula, setSuccessLossFormula] = useState("0");
  const [failureLossFormula, setFailureLossFormula] = useState("1d6");
  const [investigatorIsAlone, setInvestigatorIsAlone] = useState(false);
  const [sanityRoll, setSanityRoll] = useState<number>();
  const [sanitySucceeded, setSanitySucceeded] = useState<boolean>();
  const [lossState, setLossState] = useState<CocSanityLossState>();
  const [intResult, setIntResult] = useState<CocPercentileResult>();
  const [insanityHours, setInsanityHours] = useState<number>();
  const [boutTableRoll, setBoutTableRoll] = useState<number>();
  const [boutDurationRounds, setBoutDurationRounds] = useState<number>();
  const [error, setError] = useState<string>();

  const resetFollowUp = () => {
    setIntResult(undefined);
    setInsanityHours(undefined);
    setBoutTableRoll(undefined);
    setBoutDurationRounds(undefined);
  };

  const clearCheck = () => {
    setSanityRoll(undefined);
    setSanitySucceeded(undefined);
    setLossState(undefined);
    resetFollowUp();
  };

  const makeSanityCheck = () => {
    try {
      const roll = secureRandomInteger(1, 100);
      const succeeded = isCocSanityRollSuccessful(roll, sanity);
      const formula = succeeded ? successLossFormula : failureLossFormula;
      const loss = rollDiceFormula(formula).total;
      if (loss < 0) throw new Error("Sanity loss cannot be negative.");
      const nextLossState = applyCocSanityLoss(sanity, loss, !succeeded);

      setSanityRoll(roll);
      setSanitySucceeded(succeeded);
      setLossState(nextLossState);
      setSanity(nextLossState.currentSanity);
      resetFollowUp();
      setError(undefined);
    } catch (caught) {
      console.error("CoC Sanity check failed", { sanity, successLossFormula, failureLossFormula, caught });
      setError(caught instanceof Error ? caught.message : "The Sanity check failed.");
    }
  };

  const makeIntelligenceCheck = () => {
    try {
      if (!lossState?.temporaryInsanityCheckRequired) {
        throw new Error("An Intelligence check is only required after losing 5 or more Sanity from one check.");
      }
      const result = rollCocPercentile(intelligence);
      setIntResult(result);
      if (result.meetsDifficulty) {
        setInsanityHours(rollDiceFormula("1d10").total);
        setBoutTableRoll(rollDiceFormula("1d10").total);
        setBoutDurationRounds(rollDiceFormula("1d10").total);
      } else {
        setInsanityHours(undefined);
        setBoutTableRoll(undefined);
        setBoutDurationRounds(undefined);
      }
      setError(undefined);
    } catch (caught) {
      console.error("CoC temporary insanity INT check failed", { intelligence, lossState, caught });
      setError(caught instanceof Error ? caught.message : "The Intelligence check failed.");
    }
  };

  return (
    <article className="coc-card coc-card--interactive">
      <header className="coc-card__header">
        <div>
          <small>Investigator procedure</small>
          <h2>Sanity Check</h2>
        </div>
        <span className="coc-card__stamp">SAN</span>
      </header>

      <p className="coc-card__summary">
        Enter the listed success/failure loss, roll against current Sanity, apply any involuntary action, then resolve temporary insanity when 5 or more SAN is lost at once.
      </p>

      <div className="coc-control-grid coc-control-grid--two">
        <label>
          Current Sanity
          <input min="0" max="100" type="number" value={sanity} onChange={(event) => {
            setSanity(Math.max(0, Math.min(100, Math.trunc(Number(event.target.value) || 0))));
            clearCheck();
          }} />
        </label>
        <label>
          INT
          <input min="1" max="100" type="number" value={intelligence} onChange={(event) => {
            setIntelligence(Math.max(1, Math.min(100, Math.trunc(Number(event.target.value) || 1))));
            resetFollowUp();
          }} />
        </label>
        <label>
          Loss on success
          <input type="text" value={successLossFormula} onChange={(event) => {
            setSuccessLossFormula(event.target.value);
            clearCheck();
          }} />
        </label>
        <label>
          Loss on failure
          <input type="text" value={failureLossFormula} onChange={(event) => {
            setFailureLossFormula(event.target.value);
            clearCheck();
          }} />
        </label>
      </div>

      <label className="coc-check-control">
        <input type="checkbox" checked={investigatorIsAlone} onChange={(event) => setInvestigatorIsAlone(event.target.checked)} />
        Investigator is alone if a bout of madness occurs
      </label>

      <button className="coc-roll-button" type="button" onClick={makeSanityCheck}>Make Sanity check</button>

      {sanityRoll !== undefined && sanitySucceeded !== undefined && lossState && (
        <section className="coc-roll-result" aria-live="polite">
          <strong className="coc-roll-result__total">{sanityRoll}</strong>
          <h3>{sanitySucceeded ? "Sanity roll succeeds" : "Sanity roll fails"}</h3>
          <p>{lossState.sanityLost} Sanity lost. Current Sanity: {lossState.currentSanity}.</p>
          {lossState.involuntaryActionRequired && (
            <p>Any SAN loss causes a momentary involuntary action chosen by the Keeper, such as screaming, fainting briefly, freezing, or pulling a trigger.</p>
          )}
          {!lossState.involuntaryActionRequired && <p>No SAN was lost, so no involuntary action is triggered.</p>}
          {lossState.temporaryInsanityCheckRequired && !intResult && (
            <button type="button" onClick={makeIntelligenceCheck}>Roll INT for temporary insanity</button>
          )}
          {intResult && (
            <>
              <p>INT roll: {intResult.roll} — {intResult.meetsDifficulty ? "success" : "failure"}.</p>
              {intResult.meetsDifficulty ? (
                <>
                  <p>Temporary insanity lasts {insanityHours} hour{insanityHours === 1 ? "" : "s"}.</p>
                  <p>
                    Bout table roll: {boutTableRoll}. {investigatorIsAlone
                      ? "Summarize what happened while the investigator was alone and describe how they are found afterward."
                      : `Play the bout round by round for ${boutDurationRounds} round${boutDurationRounds === 1 ? "" : "s"}.`}
                  </p>
                  <p>During the temporary-insanity period, the Keeper may introduce delusions. The investigator may request a reality check by making a Sanity roll.</p>
                </>
              ) : (
                <p>The investigator's mind closes itself to the full horror and they remain sane for now.</p>
              )}
            </>
          )}
        </section>
      )}

      <CocRuleStatus sourceId="coc-sanity-check" />
      {error && <p className="coc-error" role="alert">{error}</p>}
    </article>
  );
};
