import { useMemo, useState } from "react";
import type { CocCreaturePreview, CocPercentileResult } from "../types/coc";
import { rollCocPercentile } from "../utils/cocPercentile";
import { rollDiceFormula } from "../utils/rollDice";
import { CocRuleStatus } from "./CocRuleStatus";

type CocCreatureDossierProps = {
  creature: CocCreaturePreview;
};

type AttackOutcome = {
  name: string;
  roll: CocPercentileResult;
  damageFormula: string;
  damage?: number;
  notes: string;
};

export const CocCreatureDossier = ({ creature }: CocCreatureDossierProps) => {
  const [currentHitPoints, setCurrentHitPoints] = useState(creature.hitPoints);
  const [currentMagicPoints, setCurrentMagicPoints] = useState(creature.magicPoints);
  const [attackOutcome, setAttackOutcome] = useState<AttackOutcome>();
  const [dodgeResult, setDodgeResult] = useState<CocPercentileResult>();
  const [sanityLoss, setSanityLoss] = useState<number>();
  const [error, setError] = useState<string>();

  const defeated = currentHitPoints <= 0;
  const healthState = useMemo(() => {
    if (defeated) return "0 HP";
    if (currentHitPoints <= Math.floor(creature.hitPoints / 2)) return "Half HP or less";
    if (currentHitPoints < creature.hitPoints) return "HP reduced";
    return "Full HP";
  }, [creature.hitPoints, currentHitPoints, defeated]);

  const rollAttack = (attackId: string) => {
    try {
      const attack = creature.attacks.find((candidate) => candidate.id === attackId);
      if (!attack) throw new Error("The selected creature attack was not found.");

      const roll = rollCocPercentile(attack.skill);
      setAttackOutcome({
        name: attack.name,
        roll,
        damageFormula: attack.damageFormula,
        notes: attack.notes
      });
      setDodgeResult(undefined);
      setError(undefined);
    } catch (caught) {
      console.error("CoC creature attack failed", { creatureId: creature.id, attackId, caught });
      setError(caught instanceof Error ? caught.message : "The creature attack failed.");
    }
  };

  const rollAttackDamage = () => {
    try {
      if (!attackOutcome?.roll.meetsDifficulty) {
        throw new Error("A failed attack does not roll damage.");
      }
      const damage = rollDiceFormula(attackOutcome.damageFormula).total;
      setAttackOutcome((current) => current ? { ...current, damage } : current);
      setError(undefined);
    } catch (caught) {
      console.error("CoC creature base damage failed", { creatureId: creature.id, caught });
      setError(caught instanceof Error ? caught.message : "The damage roll failed.");
    }
  };

  const rollDodge = () => {
    try {
      setDodgeResult(rollCocPercentile(creature.dodge));
      setAttackOutcome(undefined);
      setError(undefined);
    } catch (caught) {
      console.error("CoC creature Dodge failed", { creatureId: creature.id, caught });
      setError(caught instanceof Error ? caught.message : "The Dodge roll failed.");
    }
  };

  const rollSanityLoss = () => {
    try {
      setSanityLoss(rollDiceFormula(creature.sanityLossFormula).total);
      setError(undefined);
    } catch (caught) {
      console.error("CoC creature Sanity loss failed", { creatureId: creature.id, caught });
      setError(caught instanceof Error ? caught.message : "The Sanity loss roll failed.");
    }
  };

  return (
    <article className={`coc-dossier${defeated ? " is-defeated" : ""}`}>
      <header className="coc-dossier__header">
        <div>
          <small>{creature.keeperTag}</small>
          <h2>{creature.name}</h2>
          <p>{creature.classification}</p>
        </div>
        <span className="coc-dossier__classification">KEEPER EYES ONLY</span>
      </header>

      <div className="coc-dossier__body">
        <section className="coc-dossier__identity">
          <div className="coc-creature-silhouette" aria-hidden="true">
            <span>◉</span>
          </div>
          <blockquote>{creature.description}</blockquote>
          <div className="coc-condition-strip">
            <span className={defeated ? "is-danger" : ""}>{healthState}</span>
            <span>Armor {creature.armor}</span>
            <span>Move {creature.move}</span>
            <span>Build {creature.build}</span>
          </div>
        </section>

        <section className="coc-characteristics" aria-label="Creature characteristics">
          {Object.entries(creature.characteristics).map(([name, value]) => (
            <div key={name}>
              <small>{name}</small>
              <strong>{value}</strong>
              <span>{Math.floor(value / 2)} / {Math.floor(value / 5)}</span>
            </div>
          ))}
        </section>

        <section className="coc-resource-ledger coc-resource-ledger--large">
          <span><small>Hit Points</small><strong>{currentHitPoints}/{creature.hitPoints}</strong></span>
          <span><small>Magic Points</small><strong>{currentMagicPoints}/{creature.magicPoints}</strong></span>
          <span><small>Damage Bonus</small><strong>{creature.damageBonus}</strong></span>
          <span><small>Dodge</small><strong>{creature.dodge}%</strong></span>
        </section>

        <section className="coc-dossier__controls">
          <div>
            <h3>Encounter tracking</h3>
            <div className="coc-button-row coc-button-row--wrap">
              <button type="button" onClick={() => setCurrentHitPoints((value) => Math.max(0, value - 1))}>–1 HP</button>
              <button type="button" onClick={() => setCurrentHitPoints((value) => Math.max(0, value - 5))}>–5 HP</button>
              <button type="button" onClick={() => setCurrentHitPoints((value) => Math.min(creature.hitPoints, value + 1))}>+1 HP</button>
              <button type="button" onClick={() => setCurrentMagicPoints((value) => Math.max(0, value - 1))}>–1 MP</button>
              <button type="button" onClick={() => {
                setCurrentHitPoints(creature.hitPoints);
                setCurrentMagicPoints(creature.magicPoints);
                setAttackOutcome(undefined);
                setDodgeResult(undefined);
                setSanityLoss(undefined);
              }}>Reset</button>
            </div>
            <small>HP thresholds shown here are neutral trackers, not automated Major Wound rulings.</small>
          </div>

          <div>
            <h3>Combat actions</h3>
            <div className="coc-attack-list">
              {creature.attacks.map((attack) => (
                <button type="button" key={attack.id} onClick={() => rollAttack(attack.id)} disabled={defeated}>
                  <span><strong>{attack.name}</strong><small>{attack.skill}% · {attack.damageFormula}</small></span>
                  <em>Roll</em>
                </button>
              ))}
              <button type="button" onClick={rollDodge} disabled={defeated}>
                <span><strong>Dodge</strong><small>{creature.dodge}%</small></span>
                <em>Roll</em>
              </button>
              <button type="button" onClick={rollSanityLoss}>
                <span><strong>Prototype failed SAN loss</strong><small>{creature.sanityLossFormula}</small></span>
                <em>Roll</em>
              </button>
            </div>
          </div>
        </section>

        {(attackOutcome || dodgeResult || sanityLoss !== undefined) && (
          <section className="coc-dossier__result" aria-live="polite">
            {attackOutcome && (
              <>
                <small>{attackOutcome.name}</small>
                <strong>{attackOutcome.roll.roll}</strong>
                <span>{attackOutcome.roll.meetsDifficulty ? "Attack succeeds" : "Attack misses"}</span>
                {attackOutcome.roll.meetsDifficulty && attackOutcome.damage === undefined && (
                  <button type="button" onClick={rollAttackDamage}>Roll listed base damage</button>
                )}
                {attackOutcome.damage !== undefined && <em>{attackOutcome.damage} listed base damage</em>}
                {(attackOutcome.roll.successLevel === "extreme" || attackOutcome.roll.successLevel === "critical") && (
                  <p>Special damage for this success level is not automated until the combat damage audit is certified.</p>
                )}
                <p>{attackOutcome.notes}</p>
              </>
            )}
            {dodgeResult && (
              <>
                <small>Dodge</small>
                <strong>{dodgeResult.roll}</strong>
                <span>{dodgeResult.meetsDifficulty ? "Dodge roll succeeds" : "Dodge roll fails"}</span>
                <p>An opposed combat resolver must still compare this result with the attack and apply the correct tie rule.</p>
              </>
            )}
            {sanityLoss !== undefined && (
              <>
                <small>Prototype failed Sanity loss</small>
                <strong>{sanityLoss}</strong>
                <span>Sanity lost</span>
              </>
            )}
          </section>
        )}

        <section className="coc-dossier__traits">
          <h3>Observed traits and Keeper cues</h3>
          <ul>{creature.traits.map((trait) => <li key={trait}>{trait}</li>)}</ul>
        </section>

        <CocRuleStatus sourceId="coc-original-creature-preview" />
      </div>

      {error && <p className="coc-error" role="alert">{error}</p>}
    </article>
  );
};