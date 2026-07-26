import type { DndAbilityId, DndCharacterRecord } from "../types/dndCharacter";
import {
  dndAbilityModifier,
  dndAttackBonus,
  dndProficiencyBonus,
  dndSpellAttackBonus,
  dndSpellSaveDc
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

const resourceMarks = (maximum: number | "unlimited"): string =>
  maximum === "unlimited" ? "Unlimited" : Array.from({ length: maximum }, () => "○").join(" ");

const refreshLabel = (refresh: DndCharacterRecord["resources"][number]["refresh"]): string =>
  refresh === "none" ? "No refresh required" : `Refresh: ${refresh.replace("-", " ")}`;

export const DndPregenCharacterSheet = ({ record }: { record: DndCharacterRecord }) => {
  const proficiencyBonus = dndProficiencyBonus(record.level);
  const initiative = dndAbilityModifier(record.abilityScores.dex);
  const spellcasting = record.spellcasting.kind === "none" ? undefined : record.spellcasting;
  const spellcastingScore = spellcasting ? record.abilityScores[spellcasting.ability] : undefined;

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

      {spellcasting && spellcastingScore !== undefined && (
        <section className="pregen-sheet__spellcasting" aria-labelledby={`spellcasting-${record.id}`}>
          <header>
            <div>
              <p>Spellcasting</p>
              <h4 id={`spellcasting-${record.id}`}>{abilityLabels[spellcasting.ability]} · {spellcasting.kind === "known" ? "Spells Known" : "Prepared Spells"}</h4>
            </div>
            <dl>
              <div><dt>Save DC</dt><dd>{dndSpellSaveDc(spellcastingScore, record.level)}</dd></div>
              <div><dt>Spell Attack</dt><dd>{signed(dndSpellAttackBonus(spellcastingScore, record.level))}</dd></div>
            </dl>
          </header>
          <div className="pregen-sheet__spell-columns">
            <section>
              <h5>Cantrips</h5>
              <p>{spellcasting.cantrips.join(" · ") || "None"}</p>
            </section>
            <section>
              <h5>{spellcasting.kind === "known" ? "Known Spells" : "Prepared Spells"}</h5>
              <p>{spellcasting.spells.join(" · ") || "None"}</p>
            </section>
          </div>
          <div className="pregen-sheet__slots" aria-label="Spell slots">
            {Object.entries(spellcasting.slotsByLevel)
              .filter((entry): entry is [string, number] => typeof entry[1] === "number" && entry[1] > 0)
              .map(([slotLevel, maximum]) => (
                <div key={slotLevel}>
                  <span>Level {slotLevel}</span>
                  <strong>{Array.from({ length: maximum }, () => "○").join(" ")}</strong>
                </div>
              ))}
          </div>
          {spellcasting.notes && <p className="pregen-sheet__spell-notes">{spellcasting.notes}</p>}
        </section>
      )}

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
                  <div><strong>{resource.name}</strong><span>{resourceMarks(resource.maximum)}</span></div>
                  <small>{refreshLabel(resource.refresh)}{resource.notes ? ` · ${resource.notes}` : ""}</small>
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
          <h4>{record.subclassName} features</h4>
          {record.subclassFeatures.length > 0
            ? <ul>{record.subclassFeatures.map((feature) => <li key={feature}>{feature}</li>)}</ul>
            : <p>The {record.subclassName} path begins at level {record.subclassUnlockLevel}.</p>}
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
