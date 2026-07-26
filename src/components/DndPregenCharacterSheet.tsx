import type { DndAbilityId, DndCharacterRecord } from "../types/dndCharacter";
import {
  dndAbilityModifier,
  dndAttackBonus,
  dndProficiencyBonus
} from "../utils/dndCharacterRecord";

const abilityLabels: Record<DndAbilityId, string> = {
  str: "STR",
  dex: "DEX",
  con: "CON",
  int: "INT",
  wis: "WIS",
  cha: "CHA"
};

const signed = (value: number): string => `${value >= 0 ? "+" : ""}${value}`;

export const DndPregenCharacterSheet = ({ record }: { record: DndCharacterRecord }) => {
  const proficiencyBonus = dndProficiencyBonus(record.level);
  const initiative = dndAbilityModifier(record.abilityScores.dex);

  return (
    <article className="pregen-sheet" aria-labelledby={`pregen-sheet-${record.id}`}>
      <header className="pregen-sheet__header">
        <div>
          <p>{record.ruleset === "srd-5.1-2014" ? "2014 / SRD 5.1" : "2024 / SRD 5.2.1"} · Ready to play</p>
          <h3 id={`pregen-sheet-${record.id}`}>{record.name}</h3>
          <span>Level {record.level} {record.species} {record.className} ({record.subclassName}) · {record.background}</span>
        </div>
        <button type="button" onClick={() => window.print()}>Print sheet</button>
      </header>

      <section className="pregen-sheet__combat-summary" aria-label="Combat summary">
        <div><span>AC</span><strong>{record.armorClass}</strong></div>
        <div><span>HP</span><strong>{record.maximumHitPoints}</strong></div>
        <div><span>Speed</span><strong>{record.speedFeet} ft.</strong></div>
        <div><span>Initiative</span><strong>{signed(initiative)}</strong></div>
        <div><span>Proficiency</span><strong>{signed(proficiencyBonus)}</strong></div>
        <div><span>Hit Dice</span><strong>{record.level}d{record.hitDie}</strong></div>
      </section>

      <section className="pregen-sheet__abilities" aria-label="Ability scores">
        {Object.entries(record.abilityScores).map(([ability, score]) => (
          <div key={ability}>
            <span>{abilityLabels[ability as DndAbilityId]}</span>
            <strong>{score}</strong>
            <small>{signed(dndAbilityModifier(score))}</small>
          </div>
        ))}
      </section>

      <div className="pregen-sheet__columns">
        <section>
          <h4>Attacks</h4>
          <div className="pregen-sheet__attack-list">
            {record.attacks.map((attack) => (
              <article key={attack.id}>
                <div><strong>{attack.name}</strong><span>{signed(dndAttackBonus(record.abilityScores[attack.attackAbility], record.level, attack.proficient))} to hit</span></div>
                <p>{attack.damageFormula} {attack.damageType} · {attack.rangeOrReach}</p>
                {attack.notes && <small>{attack.notes}</small>}
              </article>
            ))}
          </div>
        </section>

        <section>
          <h4>Trackable resources</h4>
          {record.resources.length > 0 ? (
            <div className="pregen-sheet__resource-list">
              {record.resources.map((resource) => (
                <article key={resource.id}>
                  <div><strong>{resource.name}</strong><span>{Array.from({ length: resource.maximum }, () => "○").join(" ")}</span></div>
                  <small>Refresh: {resource.refresh.replace("-", " ")}{resource.notes ? ` · ${resource.notes}` : ""}</small>
                </article>
              ))}
            </div>
          ) : <p>No limited-use class resources at this level.</p>}
        </section>
      </div>

      <div className="pregen-sheet__columns">
        <section>
          <h4>Class features</h4>
          <ul>{record.classFeatures.map((feature) => <li key={feature}>{feature}</li>)}</ul>
        </section>
        <section>
          <h4>Champion features</h4>
          {record.subclassFeatures.length > 0
            ? <ul>{record.subclassFeatures.map((feature) => <li key={feature}>{feature}</li>)}</ul>
            : <p>The Champion path begins at level {record.subclassUnlockLevel}.</p>}
        </section>
      </div>

      <div className="pregen-sheet__columns">
        <section>
          <h4>Proficiencies</h4>
          <dl className="pregen-sheet__compact-list">
            <div><dt>Saving Throws</dt><dd>{record.savingThrowProficiencies.map((ability) => abilityLabels[ability]).join(", ")}</dd></div>
            <div><dt>Skills</dt><dd>{record.skillProficiencies.join(", ")}</dd></div>
            <div><dt>Tools</dt><dd>{record.toolProficiencies.join(", ") || "None"}</dd></div>
            <div><dt>Languages</dt><dd>{record.languages.join(", ")}</dd></div>
          </dl>
        </section>
        <section>
          <h4>Advancement choices</h4>
          {record.advancementChoices.length > 0
            ? <ul>{record.advancementChoices.map((choice) => <li key={choice}>{choice}</li>)}</ul>
            : <p>No level-earned ability or feat choice yet.</p>}
        </section>
      </div>

      <div className="pregen-sheet__columns">
        <section>
          <h4>Equipment</h4>
          <p>{record.equipment.join(" · ")}</p>
          <p><strong>Currency:</strong> {record.currencyGp} GP</p>
        </section>
        <section>
          <h4>Quick-play notes</h4>
          <ul>{record.notes.map((note) => <li key={note}>{note}</li>)}</ul>
        </section>
      </div>

      <footer className="pregen-sheet__sources">
        <h4>Sources</h4>
        {record.sources.map((source) => (
          <a href={source.url} key={`${source.label}-${source.url}`} rel="noreferrer" target="_blank">{source.label}</a>
        ))}
      </footer>
    </article>
  );
};
