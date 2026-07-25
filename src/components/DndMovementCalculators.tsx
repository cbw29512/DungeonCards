import { useMemo, useState } from "react";
import type { CoverDegree, MovementMode } from "../types/dndMovement";
import type { RulesetId } from "../types/ruleCards";
import {
  calculate2024GrappleShoveDc,
  calculateJumpDistances,
  calculateMovementCost,
  getCoverBenefit
} from "../utils/dndMovement";

export const DndMovementCalculators = ({ ruleset }: { ruleset: RulesetId }) => {
  const [distance, setDistance] = useState(15);
  const [mode, setMode] = useState<MovementMode>("walk");
  const [difficult, setDifficult] = useState(false);
  const [matchingSpeed, setMatchingSpeed] = useState(false);
  const [strengthScore, setStrengthScore] = useState(14);
  const [strengthModifier, setStrengthModifier] = useState(2);
  const [proficiencyBonus, setProficiencyBonus] = useState(2);
  const [cover, setCover] = useState<CoverDegree>("none");

  const movementCost = useMemo(
    () => calculateMovementCost(distance, mode, difficult, matchingSpeed),
    [distance, mode, difficult, matchingSpeed]
  );
  const jumps = useMemo(
    () => calculateJumpDistances(strengthScore, strengthModifier),
    [strengthScore, strengthModifier]
  );
  const coverBenefit = useMemo(() => getCoverBenefit(cover), [cover]);
  const grappleDc = calculate2024GrappleShoveDc(strengthModifier, proficiencyBonus);

  return (
    <div className="dnd-movement-tools">
      <section className="dnd-movement-tool">
        <header><small>Movement cost</small><h2>How much Speed is spent?</h2></header>
        <div className="dnd-movement-tool__controls">
          <label><span>Distance traveled</span><input min="0" type="number" value={distance} onChange={(event) => setDistance(Number(event.target.value))} /></label>
          <label><span>Movement mode</span><select value={mode} onChange={(event) => setMode(event.target.value as MovementMode)}>
            <option value="walk">Walk</option><option value="crawl">Crawl</option><option value="climb">Climb</option><option value="swim">Swim</option>
          </select></label>
          <label className="dnd-movement-check"><input checked={difficult} type="checkbox" onChange={(event) => setDifficult(event.target.checked)} /><span>Difficult Terrain</span></label>
          {mode !== "walk" && <label className="dnd-movement-check"><input checked={matchingSpeed} type="checkbox" onChange={(event) => setMatchingSpeed(event.target.checked)} /><span>Use matching {mode} Speed</span></label>}
        </div>
        <output aria-live="polite"><strong>{movementCost} ft.</strong><span>of Speed required to move {Math.max(0, distance)} ft.</span></output>
      </section>

      <section className="dnd-movement-tool">
        <header><small>Jump distance</small><h2>Strength-based jumps</h2></header>
        <div className="dnd-movement-tool__controls dnd-movement-tool__controls--two">
          <label><span>Strength score</span><input type="number" value={strengthScore} onChange={(event) => setStrengthScore(Number(event.target.value))} /></label>
          <label><span>Strength modifier</span><input type="number" value={strengthModifier} onChange={(event) => setStrengthModifier(Number(event.target.value))} /></label>
        </div>
        <dl className="dnd-movement-tool__metrics">
          <div><dt>Running long</dt><dd>{jumps.runningLongJump} ft.</dd></div>
          <div><dt>Standing long</dt><dd>{jumps.standingLongJump} ft.</dd></div>
          <div><dt>Running high</dt><dd>{jumps.runningHighJump} ft.</dd></div>
          <div><dt>Standing high</dt><dd>{jumps.standingHighJump} ft.</dd></div>
        </dl>
        <p>Each foot jumped still costs 1 foot of movement. Running values require the edition’s 10-foot approach.</p>
      </section>

      <section className="dnd-movement-tool">
        <header><small>Cover</small><h2>Apply the strongest degree only</h2></header>
        <label><span>Degree of cover</span><select value={cover} onChange={(event) => setCover(event.target.value as CoverDegree)}>
          <option value="none">No cover</option><option value="half">Half Cover</option><option value="three-quarters">Three-Quarters Cover</option><option value="total">Total Cover</option>
        </select></label>
        <output aria-live="polite"><strong>{coverBenefit.summary}</strong><span>{coverBenefit.canBeTargetedDirectly ? "Direct targeting remains possible." : "Check area effects and indirect effects separately."}</span></output>
      </section>

      <section className="dnd-movement-tool">
        <header><small>Grapple and shove</small><h2>{ruleset === "srd-5.2.1-2024" ? "Unarmed Strike save DC" : "Opposed ability contest"}</h2></header>
        {ruleset === "srd-5.2.1-2024" ? <>
          <div className="dnd-movement-tool__controls dnd-movement-tool__controls--two">
            <label><span>Strength modifier</span><input type="number" value={strengthModifier} onChange={(event) => setStrengthModifier(Number(event.target.value))} /></label>
            <label><span>Proficiency Bonus</span><input min="0" type="number" value={proficiencyBonus} onChange={(event) => setProficiencyBonus(Number(event.target.value))} /></label>
          </div>
          <output aria-live="polite"><strong>DC {grappleDc}</strong><span>Target chooses a Strength or Dexterity saving throw.</span></output>
        </> : <p>Roll your Strength (Athletics) against the target’s Strength (Athletics) or Dexterity (Acrobatics), chosen by the target. Use the procedure cards below for escape and movement rules.</p>}
      </section>
    </div>
  );
};
