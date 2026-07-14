import { useState } from "react";
import type { CocPercentileResult } from "../types/coc";
import { rollCocPercentile } from "../utils/cocPercentile";
import {
  applyCocSanityLoss,
  isCocSanityRollSuccessful,
  type CocSanityLossState
} from "../utils/cocSanity";
import { rollDiceFormula } from "../utils/rollDice";
import { secureRandomInteger } from "../utils/randomInteger";
import { CocRuleStatus } from "./CocRuleStatus";

export const CocSanityCard = () => {
  const [sanity, setSanity] = useState(60);
  const [intelligence, setIntelligence] = useState(70);
  const [successLossFormula, setSuccessLossFormula] = useState("0");
  const [failureLossFormula, setFailureLossFormula] = useState("1d6");
  const [sanityRoll, setSanityRoll] = useState<number>();
  const [sanitySucceeded, setSanitySucceeded] = useState<boolean>();
  const [lossState, setLossState] = useState<CocSanityLossState>();
  const [intResult, setIntResult] = useState<CocPercentileResult>();
  const [insanityHours, setInsanityHours] = useState<number>();
  const [boutRounds, setBoutRounds] = useState<number>();
  const [error, setError] = useState<string>();

  const resetFollowUp = () => {
    setIntResult(undefined);
    setInsanityHours(undefined);
    setBoutRounds(undefined);
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
      const nextLossState = applyCocSanityLoss(sanity, loss);

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
        setBoutRounds(rollDiceFormula("1d10").total);
      } else {
        setInsanityHours(undefined);
        setBoutRounds(undefined);
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
        Enter the listed success/failure loss, roll against current Sanity, then follow the involuntary-action and temporary-insanity prompts when triggered.
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

      <button className="coc-roll-button" type="button" onClick={makeSanityCheck}>Make Sanity check</button>

      {sanityRoll !== undefined && sanitySucceeded !== undefined && lossState && (
        <section className="coc-roll-result" aria-live="polite">
          <strong className="coc-roll-result__total">{sanityRoll}</strong>
          <h3>{sanitySucceeded ? "Sanity roll succeeds" : "Sanity roll fails"}</h3>
          <p>{lossState.sanityLost} Sanity lost. Current Sanity: {lossState.currentSanity}.</p>
          {lossState.involuntaryActionRequired && (
            <p>The Keeper determines a momentary involuntary action.</p>
          )}
          {lossState.temporaryInsanityCheckRequired && !intResult && (
            <button type="button" onClick={makeIntelligenceCheck}>Roll INT for temporary insanity</button>
          )}
          {intResult && (
            <>
              <p>INT roll: {intResult.roll} — {intResult.meetsDifficulty ? "success" : "failure"}.</p>
              {intResult.meetsDifficulty ? (
                <p>
                  Temporary insanity lasts {insanityHours} hour{insanityHours === 1 ? "" : "s"}. The immediate bout lasts {boutRounds} round{boutRounds === 1 ? "" : "s"}; the Keeper chooses or rolls an appropriate bout result.
                </p>
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