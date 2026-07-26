import { useState } from "react";
import { rollDiceFormula } from "../utils/rollDice";
import { secureRandomInteger } from "../utils/randomInteger";
import { CocInvestigatorBuilder } from "./CocInvestigatorBuilder";
import { CocGroupLuckCard, CocLuckCard } from "./CocLuckCard";
import { CocRuleStatus } from "./CocRuleStatus";

export const CocImprovementCard = () => {
  const [skillName, setSkillName] = useState("Spot Hidden");
  const [skillValue, setSkillValue] = useState(45);
  const [checked, setChecked] = useState(true);
  const [result, setResult] = useState("Mark a skill after a successful use, then roll when the Keeper calls for improvement checks.");

  const rollImprovement = () => {
    if (!checked) {
      setResult(`${skillName || "This skill"} is not checked, so it does not receive an improvement roll.`);
      return;
    }
    const roll = secureRandomInteger(1, 100);
    if (roll <= skillValue) {
      setChecked(false);
      setResult(`Improvement roll ${roll} is not over ${skillValue}. ${skillName || "The skill"} does not increase; erase the check mark.`);
      return;
    }
    const increase = rollDiceFormula("1d10").total;
    const next = skillValue + increase;
    setSkillValue(next);
    setChecked(false);
    setResult(`Improvement roll ${roll} is over ${skillValue}. Add ${increase}; ${skillName || "the skill"} is now ${next}. Erase the check mark.`);
  };

  return (
    <>
      <CocInvestigatorBuilder />
      <article className="coc-card coc-card--interactive">
        <header className="coc-card__header">
          <div>
            <small>Investigator development</small>
            <h2>Skill Improvement</h2>
          </div>
          <span className="coc-card__stamp">XP</span>
        </header>

        <p className="coc-card__summary">
          A skill may be checked once after a successful use. When the Keeper calls for improvement, roll over the current value to gain 1D10.
        </p>

        <div className="coc-control-grid coc-control-grid--two">
          <label>Skill name<input type="text" value={skillName} onChange={(event) => setSkillName(event.target.value)} /></label>
          <label>Current skill<input min="1" type="number" value={skillValue} onChange={(event) => setSkillValue(Math.max(1, Math.trunc(Number(event.target.value) || 1)))} /></label>
        </div>

        <label className="coc-check-control"><input type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} />Skill was successfully used and checked</label>
        <button className="coc-roll-button" type="button" onClick={rollImprovement}>Roll improvement</button>
        <section className="coc-roll-result" aria-live="polite"><p>{result}</p></section>
        <CocRuleStatus sourceId="coc-skill-improvement" />
      </article>
      <CocLuckCard />
      <CocGroupLuckCard />
    </>
  );
};
