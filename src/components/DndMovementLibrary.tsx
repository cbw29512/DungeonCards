import { useMemo, useState } from "react";
import { getDndMovementProcedures } from "../data/dndMovement";
import type { DndMovementProcedure } from "../types/dndMovement";
import { RULESET_LABELS, type RulesetId } from "../types/ruleCards";
import { DndMovementCalculators } from "./DndMovementCalculators";
import "../styles/dnd-movement.css";

const ProcedureCard = ({ procedure }: { procedure: DndMovementProcedure }) => (
  <article className="dnd-movement-procedure">
    <header><div><small>{procedure.category} · {RULESET_LABELS[procedure.edition]}</small><h2>{procedure.title}</h2></div></header>
    <p>{procedure.summary}</p>
    <ol>{procedure.steps.map((step) => <li key={step}>{step}</li>)}</ol>
    <footer><a href={procedure.sourceUrl} rel="noreferrer" target="_blank">{procedure.sourceReference}</a></footer>
  </article>
);

export const DndMovementLibrary = () => {
  const [ruleset, setRuleset] = useState<RulesetId>("srd-5.2.1-2024");
  const [query, setQuery] = useState("");
  const procedures = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return getDndMovementProcedures(ruleset).filter((procedure) => !normalized || [
      procedure.title,
      procedure.category,
      procedure.summary,
      ...procedure.steps
    ].some((value) => value.toLowerCase().includes(normalized)));
  }, [query, ruleset]);

  return (
    <section className="dnd-movement-library">
      <header className="dnd-movement-library__heading">
        <p>Movement and special actions</p>
        <h1>Position, hide, grapple, shove, and move with the correct edition.</h1>
        <span>The procedure changes are substantial enough that DM Forge never presents a blended “generic 5e” answer. Select the ruleset in play before using the calculators or cards.</span>
      </header>

      <div className="dnd-movement-library__controls">
        <fieldset><legend>Ruleset</legend>{(Object.keys(RULESET_LABELS) as RulesetId[]).map((option) => (
          <button aria-pressed={ruleset === option} key={option} type="button" onClick={() => setRuleset(option)}>{RULESET_LABELS[option]}</button>
        ))}</fieldset>
        <label><span>Search procedures</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="grapple, cover, jump, Hide…" type="search" /></label>
      </div>

      <DndMovementCalculators key={ruleset} ruleset={ruleset} />

      <div className="dnd-movement-library__result" aria-live="polite"><strong>{procedures.length} procedures</strong><span>{RULESET_LABELS[ruleset]} only</span></div>
      {procedures.length > 0 ? <div className="dnd-movement-grid">{procedures.map((procedure) => <ProcedureCard key={procedure.id} procedure={procedure} />)}</div>
        : <p className="dnd-movement-library__empty">No procedures match this search.</p>}
    </section>
  );
};
