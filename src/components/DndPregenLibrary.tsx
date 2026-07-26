import { useState } from "react";
import { DndPregenValidationPanel } from "./DndPregenValidationPanel";
import { dndPregenClassDefinitions } from "../data/dndPregenCatalog";
import {
  dndPregenDefinitionPath,
  dndPregenLevels,
  dndPregenReadyRequirements,
  dndPregenRulesets
} from "../data/dndPregenUi";
import type { RulesetId } from "../types/ruleCards";
import { createDndCharacterBlueprint, validateDndCharacterRecord } from "../utils/dndCharacterRecord";
import { getDndPregenBuildSlot, summarizeDndPregenBuilds } from "../utils/dndPregenCatalog";

export const DndPregenLibrary = () => {
  const [ruleset, setRuleset] = useState<RulesetId>("srd-5.2.1-2024");
  const [pathId, setPathId] = useState("fighter:champion");
  const [level, setLevel] = useState(1);
  const definitions = dndPregenClassDefinitions.filter((definition) => definition.ruleset === ruleset);
  const selectedDefinition = definitions.find((definition) => dndPregenDefinitionPath(definition) === pathId) ?? definitions[0];
  const selectedSlot = selectedDefinition
    ? getDndPregenBuildSlot(ruleset, selectedDefinition.classId, selectedDefinition.subclassId, level)
    : undefined;
  const selectedBlueprint = selectedSlot ? createDndCharacterBlueprint(selectedSlot) : undefined;
  const readiness = selectedBlueprint ? validateDndCharacterRecord(selectedBlueprint) : undefined;
  const summary = summarizeDndPregenBuilds(ruleset);

  const changeRuleset = (nextRuleset: RulesetId) => {
    setRuleset(nextRuleset);
    const nextDefinitions = dndPregenClassDefinitions.filter((definition) => definition.ruleset === nextRuleset);
    if (!nextDefinitions.some((definition) => dndPregenDefinitionPath(definition) === pathId)) {
      setPathId(nextDefinitions[0] ? dndPregenDefinitionPath(nextDefinitions[0]) : "fighter:champion");
    }
  };

  return (
    <section className="pregen-library" aria-labelledby="pregen-library-title">
      <header className="pregen-library__hero">
        <div>
          <p className="pregen-library__eyebrow">Pregen Foundry · licensed build matrix</p>
          <h2 id="pregen-library-title">Every public class path. Every level. No fake completion.</h2>
          <p>
            This foundation reserves one tested build slot for each public SRD class and subclass path at levels 1–20 in both supported editions.
            A slot becomes <strong>Ready to play</strong> only after its complete character record, choices, combat actions, spells, gear, and printable sheet pass review.
          </p>
        </div>
        <div className="pregen-library__totals" aria-label="Selected edition pregen totals">
          <strong>{summary.total}</strong><span>planned sheets</span>
          <small>{summary.classes} classes · {summary.subclasses} subclasses · {summary.levels} levels</small>
        </div>
      </header>

      <div className="pregen-library__edition" role="group" aria-label="Pregen rules edition">
        {dndPregenRulesets.map((option) => (
          <button aria-pressed={ruleset === option.id} key={option.id} onClick={() => changeRuleset(option.id)} type="button">
            {option.label}
          </button>
        ))}
      </div>

      <div className="pregen-library__controls">
        <label>
          Class and public subclass path
          <select value={selectedDefinition ? dndPregenDefinitionPath(selectedDefinition) : ""} onChange={(event) => setPathId(event.target.value)}>
            {definitions.map((definition) => (
              <option key={dndPregenDefinitionPath(definition)} value={dndPregenDefinitionPath(definition)}>
                {definition.className} · {definition.subclassName}
              </option>
            ))}
          </select>
        </label>
        <label>
          Character level
          <select value={level} onChange={(event) => setLevel(Number(event.target.value))}>
            {dndPregenLevels.map((candidate) => <option key={candidate} value={candidate}>Level {candidate}</option>)}
          </select>
        </label>
      </div>

      {selectedDefinition && selectedSlot && readiness && (
        <article className="pregen-library__selection">
          <div className="pregen-library__selection-heading">
            <div>
              <p>{ruleset === "srd-5.1-2014" ? "2014" : "2024"} pregen blueprint</p>
              <h3>Level {level} {selectedDefinition.className}</h3>
              <span>{selectedDefinition.subclassName}</span>
            </div>
            <span className="pregen-library__status" data-status={readiness.ready ? "ready-to-play" : "blueprint"}>
              {readiness.ready ? "Ready to play" : "Blueprint · validation incomplete"}
            </span>
          </div>
          <dl className="pregen-library__facts">
            <div><dt>Build ID</dt><dd><code>{selectedSlot.id}</code></dd></div>
            <div><dt>Subclass starts</dt><dd>Level {selectedDefinition.subclassUnlockLevel}</dd></div>
            <div><dt>At this level</dt><dd>{selectedSlot.subclassActive ? "Subclass features are active" : "Class features only; subclass path is reserved"}</dd></div>
            <div><dt>Public scope</dt><dd>SRD / free-rules content only</dd></div>
          </dl>
          <DndPregenValidationPanel readiness={readiness} />
          <a href={selectedDefinition.sourceUrl} rel="noreferrer" target="_blank">Open {selectedDefinition.sourceLabel}</a>
        </article>
      )}

      <div className="pregen-library__columns">
        <section>
          <h3>Ready-to-play gate</h3>
          <p>Each sheet must contain all of the following before its status can change from Blueprint.</p>
          <ol className="pregen-library__requirements">
            {dndPregenReadyRequirements.map((requirement) => <li key={requirement}>{requirement}</li>)}
          </ol>
        </section>
        <aside className="pregen-library__boundary">
          <h3>Subclass publishing boundary</h3>
          <p>The public catalog can ship subclass paths included in each SRD. Other official subclasses from paid books are not copied into this repository.</p>
          <p>Future expansion can add original compatible subclasses or a private, user-owned import layer that never publishes protected text.</p>
          <dl>
            <div><dt>Public blueprints</dt><dd>{summary.blueprints}</dd></div>
            <div><dt>Ready to play</dt><dd>{summary.readyToPlay}</dd></div>
          </dl>
        </aside>
      </div>
    </section>
  );
};
