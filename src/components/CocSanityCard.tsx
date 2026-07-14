import { useState } from "react";
import type { CocPercentileResult } from "../types/coc";
import { rollCocPercentile } from "../utils/cocPercentile";
import { applyCocSanityLoss } from "../utils/cocSanity";
import { rollDiceFormula } from "../utils/rollDice";
import { CocRuleStatus } from "./CocRuleStatus";

export const CocSanityCard = () => {
  const [sanity, setSanity] = useState(60);
  const [intelligence, setIntelligence] = useState(70);
  const [successLossFormula, setSuccessLossFormula] = useState("0");
  const [failureLossFormula, setFailureLossFormula] = useState("1d6");
  const [sanityResult, setSanityResult] = useState<CocPercentileResult>();
  const [sanityLost, setSanityLost] = useState<number>();
  const [intResult, setIntResult] = useState<CocPercentileResult>();
  const [insanityHours, setInsanityHours] = useState<number>();
  const [boutRounds, setBoutRounds] = useState<number>();
  const [error, setError] = useState<string>();

  const resetFollowUp = () => {
    setIntResult(undefined);
    setInsanityHours(undefined);
    setBoutRounds(undefined);
  };

  const makeSanityCheck = () => {
    try {
      const result = rollCocPercentile(Math.max(1, sanity));
      const formula = result.meetsDifficulty ? successLossFormula : failureLossFormula;
      const loss = rollDiceFormula(formula).total;
      if (loss < 0) throw new Error("Sanity loss cannot be negative.");
      const lossState = applyCocSanityLoss(sanity, loss);

      setSanityResult(result);
      setSanityLost(loss);
      setSanity(lossState.currentSanity);
      resetFollowUp();
      setError(undefined);
    } catch (caught) {
      console.error("CoC Sanity check failed", { sanity, successLossFormula, failureLossFormula, caught });
      setError(caught instanceof Error ? caught.message : "The Sanity check failed.");
    }
  };

  const makeIntelligenceCheck = () => {
    try {
      if (sanityLost === undefined || sanityLost < 5) {
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
      console.error("CoC temporary insanity INT check failed", { intelligence, sanityLost, caught });
      setError(caught instanceof Error ? caught.message : "The Intelligence check failed.");
    }
  };

  const lossState = sanityLost === undefined ? undefined : applyCocSanityLoss(
    sanityResult ? sanity + sanityLost : sanity,
    sanityLost
  );

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
          <input min="1" max="100" type="number" value={sanity} onChange={(event) => {
            setSanity(Math.max(1, Math.min(100, Math.trunc(Number(event.target.value) || 1))));
            setSanityResult(undefined);
            setSanityLost(undefined);
            resetFollowUp();
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
          <input type="text" value={successLossFormula} onChange={(event) => setSuccessLossFormula(event.target.value)} />
        </label>
        <label>
          Loss on failure
          <input type="text" value={failureLossFormula} onChange={(event) => setFailureLossFormula(event.target.value)} />
        </label>
      </div>

      <button className="coc-roll-button" type="button" onClick={makeSanityCheck}>Make Sanity check</button>

      {sanityResult && sanityLost !== undefined && lossState && (
        <section className="coc-roll-result" aria-live="polite">
          <strong className="coc-roll-result__total">{sanityResult.roll}</strong>
          <h3>{sanityResult.meetsDifficulty ? "Sanity roll succeeds" : "Sanity roll fails"}</h3>
          <p>{sanityLost} Sanity lost. Current Sanity: {sanity}.</p>
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