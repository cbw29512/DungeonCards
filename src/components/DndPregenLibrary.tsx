import { useState } from "react";
import { DndPregenCharacterSheet } from "./DndPregenCharacterSheet";
import { DndPregenValidationPanel } from "./DndPregenValidationPanel";
import { dndPregenClassDefinitions } from "../data/dndPregenCatalog";
import {
  countDndReadyPregens,
  dndReadyPregenRecords,
  getDndReadyPregenRecord
} from "../data/dndReadyPregens";
import {
  countDndVaultReadyBuilds,
  dndVaultReadyBuilds,
  getDndVaultReadyBuild
} from "../data/dndVaultReadyBuilds";
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
  const selectedReadyRecord = selectedDefinition
    ? getDndReadyPregenRecord(ruleset, selectedDefinition.classId, selectedDefinition.subclassId, level)
    : undefined;
  const selectedVaultBuild = selectedDefinition
    ? getDndVaultReadyBuild(ruleset, selectedDefinition.classId, selectedDefinition.subclassId, level)
    : undefined;
  const selectedRecord = selectedVaultBuild?.character
    ?? selectedReadyRecord
    ?? (selectedSlot ? createDndCharacterBlueprint(selectedSlot) : undefined);
  const readiness = selectedRecord ? validateDndCharacterRecord(selectedRecord) : undefined;
  const summary = summarizeDndPregenBuilds(ruleset);
  const releasedCount = countDndReadyPregens(ruleset);
  const vaultReadyCount = countDndVaultReadyBuilds(ruleset);

  const changeRuleset = (nextRuleset: RulesetId) => {
    setRuleset(nextRuleset);
    const nextDefinitions = dndPregenClassDefinitions.filter((definition) => definition.ruleset === nextRuleset);
    if (!nextDefinitions.some((definition) => dndPregenDefinitionPath(definition) === pathId)) {
      setPathId(nextDefinitions[0] ? dndPregenDefinitionPath(nextDefinitions[0]) : "fighter:champion");
    }
  };

  const releaseStatus = selectedVaultBuild
    ? "Vault Ready"
    : readiness?.ready
      ? "Ready to play"
      : "Blueprint · validation incomplete";
  const statusId = selectedVaultBuild ? "vault-ready" : readiness?.ready ? "ready-to-play" : "blueprint";

  return (
    <section className="pregen-library" aria-labelledby="pregen-library-title">
      <header className="pregen-library__hero">
        <div>
          <p className="pregen-library__eyebrow">Character Vault · licensed build matrix</p>
          <h2 id="pregen-library-title">Pick an edition, class path, and level. Print. Play.</h2>
          <p>
            Every slot is keyed by edition, class, subclass, and level. <strong>Vault Ready</strong> adds optimized advancement, tactics, and tier-appropriate magic items to the complete playable sheet.
          </p>
        </div>
        <div className="pregen-library__totals" aria-label="Selected edition pregen totals">
          <strong>{summary.total}</strong><span>planned sheets</span>
          <small>{vaultReadyCount} Vault Ready · {releasedCount} playable · {summary.total - releasedCount} blueprints</small>
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
            {definitions.map((definition) => {
              const pathVaultReady = dndVaultReadyBuilds.some((profile) => (
                profile.ruleset === ruleset
                && profile.classId === definition.classId
                && profile.subclassId === definition.subclassId
              ));
              const pathReleased = dndReadyPregenRecords.some((record) => (
                record.ruleset === ruleset
                && record.classId === definition.classId
                && record.subclassId === definition.subclassId
              ));
              const pathStatus = pathVaultReady ? "Vault Ready" : pathReleased ? "Ready" : "Blueprint";
              return (
                <option key={dndPregenDefinitionPath(definition)} value={dndPregenDefinitionPath(definition)}>
                  {definition.className} · {definition.subclassName} · {pathStatus}
                </option>
              );
            })}
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
              <p>{ruleset === "srd-5.1-2014" ? "2014" : "2024"} {selectedVaultBuild ? "optimized Vault build" : readiness.ready ? "playable release" : "blueprint"}</p>
              <h3>Level {level} {selectedDefinition.className}</h3>
              <span>{selectedDefinition.subclassName}</span>
            </div>
            <span className="pregen-library__status" data-status={statusId}>{releaseStatus}</span>
          </div>
          <dl className="pregen-library__facts">
            <div><dt>Build ID</dt><dd><code>{selectedSlot.id}</code></dd></div>
            <div><dt>Subclass starts</dt><dd>Level {selectedDefinition.subclassUnlockLevel}</dd></div>
            <div><dt>At this level</dt><dd>{selectedSlot.subclassActive ? "Subclass features are active" : "Class features only; subclass path is reserved"}</dd></div>
            <div><dt>Optimization</dt><dd>{selectedVaultBuild ? `${selectedVaultBuild.role} · ${selectedVaultBuild.complexity}` : "Vault migration pending"}</dd></div>
          </dl>
          <DndPregenValidationPanel readiness={readiness} />
          <a href={selectedDefinition.sourceUrl} rel="noreferrer" target="_blank">Open {selectedDefinition.sourceLabel}</a>
        </article>
      )}

      {selectedRecord && readiness?.ready && (
        <DndPregenCharacterSheet record={selectedRecord} build={selectedVaultBuild} />
      )}

      <div className="pregen-library__columns">
        <section>
          <h3>Release gates</h3>
          <ol className="pregen-library__requirements">
            {dndPregenReadyRequirements.map((requirement) => <li key={requirement}>{requirement}</li>)}
          </ol>
        </section>
        <aside className="pregen-library__boundary">
          <h3>Publishing boundary</h3>
          <p>Public releases use SRD, free-rules, or original material. Paid-book subclasses and feats require a private user-owned import layer or separate licensing.</p>
          <dl>
            <div><dt>Public blueprints</dt><dd>{summary.total - releasedCount}</dd></div>
            <div><dt>Ready to play</dt><dd>{releasedCount}</dd></div>
            <div><dt>Vault Ready</dt><dd>{vaultReadyCount}</dd></div>
          </dl>
        </aside>
      </div>
    </section>
  );
};
