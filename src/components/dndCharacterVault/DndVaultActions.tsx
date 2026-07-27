import type { DndCharacterRecord } from "../../types/dndCharacter";
import type { DndSavedCharacterState } from "../../types/dndCharacterVault";
import {
  dndAttackBonus,
  dndAbilityModifier
} from "../../utils/dndCharacterRecord";

const signed = (value: number): string => `${value >= 0 ? "+" : ""}${value}`;
const resourceMarks = (maximum: number | "unlimited"): string => (
  maximum === "unlimited" ? "Unlimited" : Array.from({ length: maximum }, () => "○").join(" ")
);

export const DndVaultActions = ({
  record,
  savedState
}: {
  record: DndCharacterRecord;
  savedState?: DndSavedCharacterState;
}) => (
  <div className="character-vault__panel-grid">
    <section className="character-vault__card">
      <h4>Attacks &amp; actions</h4>
      <div className="character-vault__action-list">
        {record.attacks.map((attack) => (
          <article key={attack.id}>
            <header>
              <strong>{attack.name}</strong>
              <span>{signed(dndAttackBonus(record.abilityScores[attack.attackAbility], record.level, attack.proficient))} to hit</span>
            </header>
            <p>{attack.damageFormula} {attack.damageType}</p>
            <small>{attack.rangeOrReach}{attack.notes ? ` · ${attack.notes}` : ""}</small>
          </article>
        ))}
      </div>
    </section>

    <section className="character-vault__card">
      <h4>Trackable resources</h4>
      <div className="character-vault__resource-list">
        {record.resources.length === 0 && <p>No limited-use class resources at this level.</p>}
        {record.resources.map((resource) => {
          const remaining = savedState?.resourceState[resource.id];
          const status = resource.maximum === "unlimited"
            ? "Unlimited"
            : remaining === undefined ? resourceMarks(resource.maximum) : `${remaining} / ${resource.maximum}`;
          return (
            <article key={resource.id}>
              <header><strong>{resource.name}</strong><span>{status}</span></header>
              <small>{resource.refresh === "none" ? "No refresh required" : `Refresh: ${resource.refresh.replace("-", " ")}`}{resource.notes ? ` · ${resource.notes}` : ""}</small>
            </article>
          );
        })}
      </div>
    </section>

    <section className="character-vault__card">
      <h4>Saving throws &amp; skills</h4>
      <dl className="character-vault__definition-list">
        <div><dt>Saving Throws</dt><dd>{record.savingThrowProficiencies.map((ability) => `${ability.toUpperCase()} ${signed(dndAbilityModifier(record.abilityScores[ability]))}`).join(", ")}</dd></div>
        <div><dt>Skills</dt><dd>{record.skillProficiencies.join(", ")}</dd></div>
        <div><dt>Senses</dt><dd>{record.senses.join(", ") || "Standard senses"}</dd></div>
      </dl>
    </section>
  </div>
);
