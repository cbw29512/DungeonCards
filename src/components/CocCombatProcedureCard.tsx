import { useMemo, useState } from "react";
import { CocRuleStatus } from "./CocRuleStatus";

const diceLabel = (count: number) => count === 0
  ? "No Build penalty"
  : `${count} Penalty ${count === 1 ? "die" : "dice"}`;

export const CocCombatProcedureCard = () => {
  const [attackerDexterity, setAttackerDexterity] = useState(60);
  const [attackerBuild, setAttackerBuild] = useState(0);
  const [defenderBuild, setDefenderBuild] = useState(1);
  const [priorDefensesThisRound, setPriorDefensesThisRound] = useState(0);
  const [readiedFirearm, setReadiedFirearm] = useState(false);

  const procedure = useMemo(() => {
    const buildDifference = defenderBuild - attackerBuild;
    return {
      initiative: attackerDexterity + (readiedFirearm ? 50 : 0),
      buildDifference,
      maneuverIneffective: buildDifference >= 3,
      maneuverPenaltyDice: Math.max(0, Math.min(2, buildDifference)),
      laterMeleeAttackBonus: priorDefensesThisRound >= 1
    };
  }, [attackerBuild, attackerDexterity, defenderBuild, priorDefensesThisRound, readiedFirearm]);

  return (
    <article className="coc-card coc-card--interactive">
      <header className="coc-card__header">
        <div>
          <small>Combat procedure</small>
          <h2>Round, Maneuver & Outnumbering</h2>
        </div>
        <span className="coc-card__stamp">DEX</span>
      </header>

      <p className="coc-card__summary">
        Establish DEX order, calculate a Fighting Maneuver's Build modifier, and track when later melee attackers gain the outnumbering Bonus die.
      </p>

      <div className="coc-control-grid coc-control-grid--two">
        <label>
          Attacker DEX
          <input min="1" max="100" type="number" value={attackerDexterity} onChange={(event) => setAttackerDexterity(Math.max(1, Math.min(100, Math.trunc(Number(event.target.value) || 1))))} />
        </label>
        <label>
          Attacker Build
          <input min="-2" max="6" type="number" value={attackerBuild} onChange={(event) => setAttackerBuild(Math.max(-2, Math.min(6, Math.trunc(Number(event.target.value) || 0))))} />
        </label>
        <label>
          Defender Build
          <input min="-2" max="10" type="number" value={defenderBuild} onChange={(event) => setDefenderBuild(Math.max(-2, Math.min(10, Math.trunc(Number(event.target.value) || 0))))} />
        </label>
        <label>
          Defender reactions already used this round
          <input min="0" max="20" type="number" value={priorDefensesThisRound} onChange={(event) => setPriorDefensesThisRound(Math.max(0, Math.min(20, Math.trunc(Number(event.target.value) || 0))))} />
        </label>
      </div>

      <label className="coc-check-control">
        <input type="checkbox" checked={readiedFirearm} onChange={(event) => setReadiedFirearm(event.target.checked)} />
        Acting with a readied firearm
      </label>

      <div className="coc-record-grid">
        <span><small>Action order</small><strong>DEX {procedure.initiative}</strong></span>
        <span><small>Maneuver Build</small><strong>{procedure.maneuverIneffective ? "Ineffective" : diceLabel(procedure.maneuverPenaltyDice)}</strong></span>
        <span><small>Later melee attacks</small><strong>{procedure.laterMeleeAttackBonus ? "Gain 1 Bonus die" : "Normal"}</strong></span>
        <span><small>Round scope</small><strong>One significant action</strong></span>
      </div>

      <ul className="coc-procedure-reasons">
        <li>Combatants act in descending DEX order; a readied firearm acts at DEX + 50.</li>
        <li>Use Fighting (Brawl) for a maneuver. The defender may Dodge or Fight Back.</li>
        <li>{procedure.maneuverIneffective
          ? "The defender is three or more Build higher, so this maneuver cannot affect them."
          : `${diceLabel(procedure.maneuverPenaltyDice)} applies because the defender is ${Math.max(0, procedure.buildDifference)} Build higher.`}</li>
        <li>{procedure.laterMeleeAttackBonus
          ? "The defender has already Dodged or Fought Back this round, so later melee attackers gain one Bonus die."
          : "The first melee attack is normal unless another modifier applies. Firearms never gain the outnumbering Bonus die."}</li>
      </ul>

      <CocRuleStatus sourceId="coc-combat-order" />
      <CocRuleStatus sourceId="coc-fighting-maneuvers" />
      <CocRuleStatus sourceId="coc-outnumbered" />
    </article>
  );
};
