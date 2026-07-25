import { useMemo, useState } from "react";
import { getDndConditions } from "../data/dndConditions";
import type { DndConditionRecord } from "../types/dndConditions";
import { RULESET_LABELS, type RulesetId } from "../types/ruleCards";
import { DndExhaustionTracker } from "./DndExhaustionTracker";
import "../styles/dnd-conditions.css";

const ConditionCard = ({ condition }: { condition: DndConditionRecord }) => (
  <article className="dnd-condition-card">
    <header><div><small>{RULESET_LABELS[condition.edition]} condition</small><h2>{condition.name}</h2></div></header>
    <p>{condition.summary}</p>
    <ul>{condition.effects.map((effect) => <li key={effect}>{effect}</li>)}</ul>
    <footer><a href={condition.sourceUrl} rel="noreferrer" target="_blank">{condition.sourceReference}</a></footer>
  </article>
);

export const DndConditionsLibrary = () => {
  const [ruleset, setRuleset] = useState<RulesetId>("srd-5.2.1-2024");
  const [query, setQuery] = useState("");
  const conditions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return getDndConditions(ruleset).filter((condition) => !normalized || [
      condition.name,
      condition.summary,
      ...condition.effects
    ].some((value) => value.toLowerCase().includes(normalized)));
  }, [query, ruleset]);

  return (
    <section className="dnd-conditions-library">
      <header className="dnd-conditions-library__heading">
        <p>Edition-separated combat reference</p>
        <h1>Conditions and Exhaustion—without mixed rules.</h1>
        <span>Select the edition in play. The same condition name can produce different effects, so every card remains tied to one source and ruleset.</span>
      </header>

      <div className="dnd-conditions-library__controls">
        <fieldset>
          <legend>Ruleset</legend>
          {(Object.keys(RULESET_LABELS) as RulesetId[]).map((option) => (
            <button aria-pressed={ruleset === option} key={option} onClick={() => setRuleset(option)} type="button">{RULESET_LABELS[option]}</button>
          ))}
        </fieldset>
        <label><span>Search conditions</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="grappled, sight, speed…" type="search" /></label>
      </div>

      <DndExhaustionTracker key={ruleset} ruleset={ruleset} />

      <div className="dnd-conditions-library__result" aria-live="polite">
        <strong>{conditions.length} conditions</strong><span>{RULESET_LABELS[ruleset]} rules only</span>
      </div>

      {conditions.length > 0 ? (
        <div className="dnd-condition-grid">{conditions.map((condition) => <ConditionCard condition={condition} key={condition.id} />)}</div>
      ) : <p className="dnd-conditions-library__empty">No conditions match this search.</p>}
    </section>
  );
};
