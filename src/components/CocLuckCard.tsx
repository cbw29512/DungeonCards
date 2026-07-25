import { useMemo, useState } from "react";
import { createClientId } from "../utils/createId";
import {
  rollLuck,
  rollStartingLuck,
  selectGroupLuckInvestigators,
  spendTrackedLuck,
  type CocLuckInvestigator,
  type CocLuckRollResult
} from "../utils/cocLuck";
import "../styles/coc-luck.css";

const LUCK_SOURCE = "https://cthulhuwiki.chaosium.com/rules/opposed-skill-rolls.html";
const STARTING_LUCK_SOURCE = "https://cthulhuwiki.chaosium.com/investigators/step-two-secondary-attributes.html";
const clampLuckInput = (value: number): number => Math.min(100, Math.max(0, Math.trunc(value) || 0));

const LuckSourceBoundary = () => (
  <section className="coc-luck-source-boundary">
    <strong>Verified against official free rules</strong>
    <a href={LUCK_SOURCE} rel="noreferrer" target="_blank">Luck Rolls and Group Luck · Chaosium wiki</a>
    <a href={STARTING_LUCK_SOURCE} rel="noreferrer" target="_blank">Starting Luck · Chaosium wiki</a>
  </section>
);

const LuckResult = ({ result }: { result?: CocLuckRollResult }) => result ? (
  <section className={`coc-luck-result coc-luck-result--${result.success ? "success" : "failure"}`} aria-live="polite">
    <small>Rolled against Luck {result.luck}</small>
    <strong>{result.roll}</strong>
    <span>{result.success ? "Luck succeeds" : "Luck fails"}</span>
  </section>
) : null;

export const CocLuckCard = () => {
  const [currentLuck, setCurrentLuck] = useState(50);
  const [luckResult, setLuckResult] = useState<CocLuckRollResult>();
  const [startingDice, setStartingDice] = useState<number[]>();
  const [spendAmount, setSpendAmount] = useState(0);
  const [spendMessage, setSpendMessage] = useState<string>();

  const generateStartingLuck = () => {
    const generated = rollStartingLuck();
    setStartingDice(generated.dice);
    setCurrentLuck(generated.luck);
    setLuckResult(undefined);
    setSpendMessage(undefined);
  };

  const trackSpend = () => {
    const result = spendTrackedLuck(currentLuck, spendAmount);
    setCurrentLuck(result.remainingLuck);
    setSpendAmount(0);
    setLuckResult(undefined);
    setSpendMessage(result.spent > 0
      ? `Recorded ${result.spent} Luck spent. ${result.remainingLuck} Luck remains.`
      : "No Luck was spent.");
  };

  return (
    <article className="coc-card coc-card--interactive coc-luck-card">
      <header className="coc-card__header">
        <div><small>Investigator resource</small><h2>Luck</h2></div>
        <span className="coc-card__stamp">D100</span>
      </header>

      <p className="coc-card__summary">Use Luck only when external chance or fate is in question and no skill or characteristic is more appropriate.</p>

      <div className="coc-luck-current">
        <label>Current Luck<input min="0" max="100" type="number" value={currentLuck} onChange={(event) => {
          setCurrentLuck(clampLuckInput(Number(event.target.value)));
          setLuckResult(undefined);
          setSpendMessage(undefined);
        }} /></label>
        <button className="coc-roll-button" type="button" onClick={() => setLuckResult(rollLuck(currentLuck))}>Roll Luck</button>
      </div>

      <LuckResult result={luckResult} />

      <section className="coc-luck-starting">
        <div><small>Investigator creation</small><strong>Starting Luck = 3D6 × 5</strong></div>
        <button type="button" onClick={generateStartingLuck}>Generate starting Luck</button>
        {startingDice && <p aria-live="polite">Dice: {startingDice.join(" + ")} · Starting Luck {currentLuck}</p>}
      </section>

      <section className="coc-luck-spending">
        <header><small>Optional owned-source rule</small><strong>Manual Luck spending tracker</strong></header>
        <p>This bookkeeping control does not state when spending is permitted or what restrictions apply. Consult your owned Keeper Rulebook before using it.</p>
        <div>
          <label>Points to record<input min="0" max={currentLuck} type="number" value={spendAmount} onChange={(event) => setSpendAmount(clampLuckInput(Number(event.target.value)))} /></label>
          <button type="button" onClick={trackSpend}>Record spending</button>
        </div>
        {spendMessage && <p aria-live="polite">{spendMessage}</p>}
      </section>

      <LuckSourceBoundary />
    </article>
  );
};

export const CocGroupLuckCard = () => {
  const [investigators, setInvestigators] = useState<CocLuckInvestigator[]>([
    { id: createClientId("luck-investigator"), name: "Investigator 1", luck: 50 },
    { id: createClientId("luck-investigator"), name: "Investigator 2", luck: 45 }
  ]);
  const [result, setResult] = useState<CocLuckRollResult>();
  const selection = useMemo(() => selectGroupLuckInvestigators(investigators), [investigators]);

  const replaceInvestigators = (updater: (current: CocLuckInvestigator[]) => CocLuckInvestigator[]) => {
    setInvestigators(updater);
    setResult(undefined);
  };
  const update = (id: string, patch: Partial<CocLuckInvestigator>) => replaceInvestigators((current) => current.map((investigator) =>
    investigator.id === id ? { ...investigator, ...patch } : investigator
  ));

  return (
    <article className="coc-card coc-card--interactive coc-group-luck-card">
      <header className="coc-card__header">
        <div><small>Keeper group procedure</small><h2>Group Luck</h2></div>
        <span className="coc-card__stamp">LOWEST</span>
      </header>
      <p className="coc-card__summary">When the Keeper calls for Group Luck, an investigator with the lowest current Luck among those present makes the roll for everyone.</p>

      <div className="coc-group-luck-roster">
        {investigators.map((investigator) => (
          <div key={investigator.id} className={selection.investigators.some((candidate) => candidate.id === investigator.id) ? "is-lowest" : ""}>
            <label>Name<input value={investigator.name} onChange={(event) => update(investigator.id, { name: event.target.value })} /></label>
            <label>Luck<input min="0" max="100" type="number" value={investigator.luck} onChange={(event) => update(investigator.id, { luck: clampLuckInput(Number(event.target.value)) })} /></label>
            <button disabled={investigators.length === 1} type="button" onClick={() => replaceInvestigators((current) => current.filter((candidate) => candidate.id !== investigator.id))}>Remove</button>
          </div>
        ))}
      </div>

      <button type="button" onClick={() => replaceInvestigators((current) => [...current, {
        id: createClientId("luck-investigator"),
        name: `Investigator ${current.length + 1}`,
        luck: 50
      }])}>Add investigator</button>

      <section className="coc-group-luck-selection" aria-live="polite"><strong>Who rolls?</strong><p>{selection.summary}</p></section>
      <button className="coc-roll-button" type="button" onClick={() => setResult(rollLuck(selection.lowestLuck))}>Roll Group Luck</button>
      <LuckResult result={result} />
      <LuckSourceBoundary />
    </article>
  );
};
