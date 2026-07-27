import { useState } from "react";
import { DndPregenCharacterSheet } from "./DndPregenCharacterSheet";
import { DndPregenReleasePanel } from "./dndCharacterVault/DndPregenReleasePanel";
import { DndPregenSelectorControls } from "./dndCharacterVault/DndPregenSelectorControls";
import { DndSavedCharacterPlayMode } from "./dndCharacterVault/DndSavedCharacterPlayMode";
import { DndVaultAccountPanel } from "./dndCharacterVault/DndVaultAccountPanel";
import { dndPregenClassDefinitions } from "../data/dndPregenCatalog";
import { countDndReadyPregens, getDndReadyPregenRecord } from "../data/dndReadyPregens";
import {
  countDndVaultReadyBuilds,
  getDndVaultReadyBuild,
  getDndVaultReadyBuildById
} from "../data/dndVaultReadyBuilds";
import { dndPregenDefinitionPath, dndPregenReadyRequirements } from "../data/dndPregenUi";
import { useDndCharacterVault } from "../hooks/useDndCharacterVault";
import type { RulesetId } from "../types/ruleCards";
import { createDndCharacterBlueprint, validateDndCharacterRecord } from "../utils/dndCharacterRecord";
import { getDndPregenBuildSlot, summarizeDndPregenBuilds } from "../utils/dndPregenCatalog";

export const DndPregenLibrary = () => {
  const [ruleset, setRuleset] = useState<RulesetId>("srd-5.2.1-2024");
  const [pathId, setPathId] = useState("fighter:champion");
  const [level, setLevel] = useState(1);
  const vault = useDndCharacterVault();
  const activeProfile = vault.activeCharacter
    ? getDndVaultReadyBuildById(vault.activeCharacter.baseBuildId)
    : undefined;
  const definitions = dndPregenClassDefinitions.filter((definition) => definition.ruleset === ruleset);
  const selectedDefinition = definitions.find((definition) => dndPregenDefinitionPath(definition) === pathId) ?? definitions[0];
  const selectedSlot = selectedDefinition ? getDndPregenBuildSlot(ruleset, selectedDefinition.classId, selectedDefinition.subclassId, level) : undefined;
  const selectedReadyRecord = selectedDefinition ? getDndReadyPregenRecord(ruleset, selectedDefinition.classId, selectedDefinition.subclassId, level) : undefined;
  const selectedVaultBuild = selectedDefinition ? getDndVaultReadyBuild(ruleset, selectedDefinition.classId, selectedDefinition.subclassId, level) : undefined;
  const selectedRecord = selectedVaultBuild?.character ?? selectedReadyRecord ?? (selectedSlot ? createDndCharacterBlueprint(selectedSlot) : undefined);
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

  return (
    <section className="pregen-library" aria-labelledby="pregen-library-title">
      <header className="pregen-library__hero">
        <div>
          <p className="pregen-library__eyebrow">Character Vault · licensed build matrix</p>
          <h2 id="pregen-library-title">Pick an edition, class path, and level. Save. Print. Play.</h2>
          <p>Every slot is keyed by edition, class, subclass, and level. <strong>Vault Ready</strong> adds optimized advancement, tactics, and tier-appropriate magic items.</p>
        </div>
        <div className="pregen-library__totals" aria-label="Selected edition pregen totals">
          <strong>{summary.total}</strong><span>planned sheets</span>
          <small>{vaultReadyCount} Vault Ready · {releasedCount} playable · {summary.total - releasedCount} blueprints</small>
        </div>
      </header>

      <DndVaultAccountPanel vault={vault} />

      {vault.activeCharacter ? (
        activeProfile ? (
          <DndSavedCharacterPlayMode
            busy={vault.busy}
            character={vault.activeCharacter}
            onClose={vault.closeCharacter}
            onDuplicate={vault.duplicateCharacter}
            onSave={vault.updateCharacter}
            profile={activeProfile}
          />
        ) : (
          <section className="saved-character-play__missing" role="alert">
            <h3>Saved build unavailable</h3>
            <p>This character references an immutable Vault build that is not present in the current catalog. No substitute character was opened.</p>
            <button onClick={vault.closeCharacter} type="button">Close saved character</button>
          </section>
        )
      ) : (
        <>
          <DndPregenSelectorControls definitions={definitions} level={level} onChangeLevel={setLevel} onChangePath={setPathId} onChangeRuleset={changeRuleset} pathId={selectedDefinition ? dndPregenDefinitionPath(selectedDefinition) : ""} ruleset={ruleset} />
          {selectedDefinition && selectedSlot && readiness && <DndPregenReleasePanel definition={selectedDefinition} level={level} profile={selectedVaultBuild} readiness={readiness} ruleset={ruleset} slot={selectedSlot} />}
          {selectedRecord && readiness?.ready && <DndPregenCharacterSheet onSave={selectedVaultBuild ? () => { void vault.saveProfile(selectedVaultBuild); } : undefined} profile={selectedVaultBuild} record={selectedRecord} signedIn={Boolean(vault.session)} />}
          <div className="pregen-library__columns">
            <section><h3>Release gates</h3><ol className="pregen-library__requirements">{dndPregenReadyRequirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ol></section>
            <aside className="pregen-library__boundary">
              <h3>Publishing boundary</h3>
              <p>Public releases use SRD, free-rules, or original material. Paid-book options require a private user-owned import layer or separate licensing.</p>
              <dl><div><dt>Public blueprints</dt><dd>{summary.total - releasedCount}</dd></div><div><dt>Ready to play</dt><dd>{releasedCount}</dd></div><div><dt>Vault Ready</dt><dd>{vaultReadyCount}</dd></div></dl>
            </aside>
          </div>
        </>
      )}
    </section>
  );
};
