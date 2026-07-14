import { useMemo, useState } from "react";
import type { CocCreaturePreview, CocPercentileResult } from "../types/coc";
import { rollCocPercentile } from "../utils/cocPercentile";
import { rollDiceFormula } from "../utils/rollDice";

type CocCreatureDossierProps = {
  creature: CocCreaturePreview;
};

type AttackOutcome = {
  name: string;
  roll: CocPercentileResult;
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
  const woundState = useMemo(() => {
    if (defeated) return "Defeated";
    if (currentHitPoints <= Math.floor(creature.hitPoints / 2)) return "Severely wounded";
    if (currentHitPoints < creature.hitPoints) return "Wounded";
    return "Uninjured";
  }, [creature.hitPoints, currentHitPoints, defeated]);

  const rollAttack = (attackId: string) => {
    try {
      const attack = creature.attacks.find((candidate) => candidate.id === attackId);
      if (!attack) throw new Error("The selected creature attack was not found.");

      const roll = rollCocPercentile(attack.skill);
      const damage = roll.meetsDifficulty ? rollDiceFormula(attack.damageFormula).total : undefined;
      setAttackOutcome({ name: attack.name, roll, damage, notes: attack.notes });
      setDodgeResult(undefined);
      setError(undefined);
    } catch (caught) {
      console.error("CoC creature attack failed", { creatureId: creature.id, attackId, caught });
      setError(caught instanceof Error ? caught.message : "The creature attack failed.");
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
            <span className={defeated ? "is-danger" : ""}>{woundState}</span>
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
                <span><strong>Failed Sanity loss</strong><small>{creature.sanityLossFormula}</small></span>
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
                {attackOutcome.damage !== undefined && <em>{attackOutcome.damage} damage</em>}
                <p>{attackOutcome.notes}</p>
              </>
            )}
            {dodgeResult && (
              <>
                <small>Dodge</small>
                <strong>{dodgeResult.roll}</strong>
                <span>{dodgeResult.meetsDifficulty ? "Dodge succeeds" : "Dodge fails"}</span>
              </>
            )}
            {sanityLoss !== undefined && (
              <>
                <small>Failed Sanity check</small>
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
      </div>

      {error && <p className="coc-error" role="alert">{error}</p>}
    </article>
  );
};
