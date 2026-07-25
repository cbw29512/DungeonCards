import { useState } from "react";
import type { RulesetId } from "../types/ruleCards";
import { RULESET_LABELS } from "../types/ruleCards";
import { describeDndExhaustion } from "../utils/dndExhaustion";

export const DndExhaustionTracker = ({ ruleset }: { ruleset: RulesetId }) => {
  const [level, setLevel] = useState(0);
  const state = describeDndExhaustion(ruleset, level);

  return (
    <section className="dnd-exhaustion" aria-label={`${RULESET_LABELS[ruleset]} exhaustion tracker`}>
      <header>
        <div><small>Interactive condition tool</small><h2>Exhaustion tracker</h2></div>
        <span className={state.isDead ? "is-dead" : ""}>Level {state.level}</span>
      </header>
      <div className="dnd-exhaustion__controls">
        <button disabled={level === 0} type="button" onClick={() => setLevel((current) => Math.max(0, current - 1))}>Remove level</button>
        <output aria-live="polite">{state.level} / 6</output>
        <button disabled={level === 6} type="button" onClick={() => setLevel((current) => Math.min(6, current + 1))}>Add level</button>
      </div>
      {ruleset === "srd-5.2.1-2024" && state.level > 0 && (
        <dl className="dnd-exhaustion__metrics">
          <div><dt>d20 Tests</dt><dd>−{state.d20Penalty}</dd></div>
          <div><dt>Speed</dt><dd>−{state.speedPenaltyFeet} ft.</dd></div>
          <div><dt>Death</dt><dd>{state.isDead ? "Yes" : "At level 6"}</dd></div>
        </dl>
      )}
      {state.effects.length > 0 ? (
        <ol className="dnd-exhaustion__effects">
          {state.effects.map((effect, index) => <li key={effect}><strong>{ruleset === "srd-5.1-2014" ? `Level ${index + 1}` : "Current effect"}</strong><span>{effect}</span></li>)}
        </ol>
      ) : <p className="dnd-exhaustion__clear">No Exhaustion effects are active.</p>}
      <p className="dnd-exhaustion__rest">A qualifying Long Rest normally removes one Exhaustion level; use the selected edition’s complete rule for all requirements.</p>
    </section>
  );
};
