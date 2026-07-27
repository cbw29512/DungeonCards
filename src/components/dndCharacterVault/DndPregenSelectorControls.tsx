import {
  dndPregenDefinitionPath,
  dndPregenLevels,
  dndPregenRulesets
} from "../../data/dndPregenUi";
import { dndReadyPregenRecords } from "../../data/dndReadyPregens";
import { dndVaultReadyBuilds } from "../../data/dndVaultReadyBuilds";
import type { DndPregenClassDefinition } from "../../data/dndPregenCatalog";
import type { RulesetId } from "../../types/ruleCards";

export const DndPregenSelectorControls = ({
  definitions,
  level,
  pathId,
  ruleset,
  onChangeLevel,
  onChangePath,
  onChangeRuleset
}: {
  definitions: DndPregenClassDefinition[];
  level: number;
  pathId: string;
  ruleset: RulesetId;
  onChangeLevel(level: number): void;
  onChangePath(pathId: string): void;
  onChangeRuleset(ruleset: RulesetId): void;
}) => (
  <>
    <div className="pregen-library__edition" role="group" aria-label="Pregen rules edition">
      {dndPregenRulesets.map((option) => (
        <button aria-pressed={ruleset === option.id} key={option.id} onClick={() => onChangeRuleset(option.id)} type="button">
          {option.label}
        </button>
      ))}
    </div>
    <div className="pregen-library__controls">
      <label>
        Class and public subclass path
        <select value={pathId} onChange={(event) => onChangePath(event.target.value)}>
          {definitions.map((definition) => {
            const vaultReady = dndVaultReadyBuilds.some((profile) => (
              profile.ruleset === ruleset
              && profile.classId === definition.classId
              && profile.subclassId === definition.subclassId
            ));
            const released = dndReadyPregenRecords.some((record) => (
              record.ruleset === ruleset
              && record.classId === definition.classId
              && record.subclassId === definition.subclassId
            ));
            const status = vaultReady ? "Vault Ready" : released ? "Ready" : "Blueprint";
            return (
              <option key={dndPregenDefinitionPath(definition)} value={dndPregenDefinitionPath(definition)}>
                {definition.className} · {definition.subclassName} · {status}
              </option>
            );
          })}
        </select>
      </label>
      <label>
        Character level
        <select value={level} onChange={(event) => onChangeLevel(Number(event.target.value))}>
          {dndPregenLevels.map((candidate) => <option key={candidate} value={candidate}>Level {candidate}</option>)}
        </select>
      </label>
    </div>
  </>
);
