import { useState } from "react";
import { dndPregenClassDefinitions } from "../data/dndPregenCatalog";
import type { RulesetId } from "../types/ruleCards";
import {
  getDndPregenBuildSlot,
  summarizeDndPregenBuilds
} from "../utils/dndPregenCatalog";

const rulesets: Array<{ id: RulesetId; label: string }> = [
  { id: "srd-5.1-2014", label: "2014 / SRD 5.1" },
  { id: "srd-5.2.1-2024", label: "2024 / SRD 5.2.1" }
];

const levels = Array.from({ length: 20 }, (_, index) => index + 1);

const readySheetRequirements = [
  "Ability scores, modifiers, proficiency bonus, and saving throws",
  "Species, background, skills, languages, and tool proficiencies",
  "Armor Class, Hit Points, Speed, Initiative, and senses",
  "Attacks, damage, action economy, and class-resource trackers",
  "Prepared or known spells, spell slots, save DC, and spell attacks",
  "Equipment, carried weight, currency, and consumables",
  "Level-earned class, subclass, feat, and advancement choices",
  "Printable quick-play sheet plus full sourced reference"
];

export const DndPregenLibrary = () => {
  const [ruleset, setRuleset] = useState<RulesetId>("srd-5.2.1-2024");
  const [classId, setClassId] = useState("fighter");
  const [level, setLevel] = useState(1);

  const definitions = dndPregenClassDefinitions.filter((definition) => definition.ruleset === ruleset);
  const selectedDefinition = definitions.find((definition) => definition.classId === classId) ?? definitions[0];
  const selectedSlot = selectedDefinition
    ? getDndPregenBuildSlot(ruleset, selectedDefinition.classId, level)
    : undefined;
  const summary = summarizeDndPregenBuilds(ruleset);

  const changeRuleset = (nextRuleset: RulesetId) => {
    setRuleset(nextRuleset);
    const nextDefinitions = dndPregenClassDefinitions.filter((definition) => definition.ruleset === nextRuleset);
    if (!nextDefinitions.some((definition) => definition.classId === classId)) {
      setClassId(nextDefinitions[0]?.classId ?? "fighter");
    }
  };

  return (
    <section className="pregen-library" aria-labelledby="pregen-library-title">
      <header className="pregen-library__hero">
        <div>
          <p className="pregen-library__eyebrow">Pregen Foundry · licensed build matrix</p>
          <h2 id="pregen-library-title">Every public class path. Every level. No fake completion.</h2>
          <p>
            This foundation reserves one tested build slot for each of the twelve SRD classes at levels 1–20 in both supported editions.
            A slot becomes <strong>Ready to play</strong> only after its complete character record, choices, combat actions, spells, gear, and printable sheet pass review.
          </p>
        </div>
        <div className="pregen-library__totals" aria-label="Selected edition pregen totals">
          <strong>{summary.total}</strong>
          <span>planned sheets</span>
          <small>{summary.classes} classes × {summary.levels} levels</small>
        </div>
      </header>

      <div className="pregen-library__edition" role="group" aria-label="Pregen rules edition">
        {rulesets.map((option) => (
          <button
            aria-pressed={ruleset === option.id}
            key={option.id}
            onClick={() => changeRuleset(option.id)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="pregen-library__controls">
        <label>
          Class and public subclass path
          <select value={selectedDefinition?.classId ?? ""} onChange={(event) => setClassId(event.target.value)}>
            {definitions.map((definition) => (
              <option key={definition.classId} value={definition.classId}>
                {definition.className} · {definition.subclassName}
              </option>
            ))}
          </select>
        </label>
        <label>
          Character level
          <select value={level} onChange={(event) => setLevel(Number(event.target.value))}>
            {levels.map((candidate) => <option key={candidate} value={candidate}>Level {candidate}</option>)}
          </select>
        </label>
      </div>

      {selectedDefinition && selectedSlot && (
        <article className="pregen-library__selection">
          <div className="pregen-library__selection-heading">
            <div>
              <p>{ruleset === "srd-5.1-2014" ? "2014" : "2024"} pregen blueprint</p>
              <h3>Level {level} {selectedDefinition.className}</h3>
              <span>{selectedDefinition.subclassName}</span>
            </div>
            <span className="pregen-library__status" data-status={selectedSlot.deliveryStatus}>
              Blueprint · sheet data pending
            </span>
          </div>

          <dl className="pregen-library__facts">
            <div><dt>Build ID</dt><dd><code>{selectedSlot.id}</code></dd></div>
            <div><dt>Subclass starts</dt><dd>Level {selectedDefinition.subclassUnlockLevel}</dd></div>
            <div><dt>At this level</dt><dd>{selectedSlot.subclassActive ? "Subclass features are active" : "Class features only; subclass path is reserved"}</dd></div>
            <div><dt>Public scope</dt><dd>SRD / free-rules content only</dd></div>
          </dl>

          <a href={selectedDefinition.sourceUrl} rel="noreferrer" target="_blank">
            Open {selectedDefinition.sourceLabel}
          </a>
        </article>
      )}

      <div className="pregen-library__columns">
        <section>
          <h3>Ready-to-play gate</h3>
          <p>Each sheet must contain all of the following before its status can change from Blueprint.</p>
          <ol className="pregen-library__requirements">
            {readySheetRequirements.map((requirement) => <li key={requirement}>{requirement}</li>)}
          </ol>
        </section>

        <aside className="pregen-library__boundary">
          <h3>Subclass publishing boundary</h3>
          <p>
            The public catalog can ship the subclass path included in each SRD. Other official subclasses from paid books are not copied into this repository.
          </p>
          <p>
            Future expansion can add original compatible subclasses or a private, user-owned import layer that never publishes protected text.
          </p>
          <dl>
            <div><dt>Public blueprints</dt><dd>{summary.blueprints}</dd></div>
            <div><dt>Ready to play</dt><dd>{summary.readyToPlay}</dd></div>
          </dl>
        </aside>
      </div>
    </section>
  );
};
