import { DndPregenValidationPanel } from "../DndPregenValidationPanel";
import type { DndPregenClassDefinition } from "../../data/dndPregenCatalog";
import type { DndCharacterValidation } from "../../types/dndCharacter";
import type { DndOptimizedBuildProfile } from "../../types/dndCharacterVault";
import type { RulesetId } from "../../types/ruleCards";
import type { DndPregenBuildSlot } from "../../utils/dndPregenCatalog";

export const DndPregenReleasePanel = ({
  definition,
  level,
  profile,
  readiness,
  ruleset,
  slot
}: {
  definition: DndPregenClassDefinition;
  level: number;
  profile?: DndOptimizedBuildProfile;
  readiness: DndCharacterValidation;
  ruleset: RulesetId;
  slot: DndPregenBuildSlot;
}) => {
  const releaseStatus = profile
    ? "Vault Ready"
    : readiness.ready
      ? "Ready to play"
      : "Blueprint · validation incomplete";
  const statusId = profile ? "vault-ready" : readiness.ready ? "ready-to-play" : "blueprint";
  return (
    <article className="pregen-library__selection">
      <div className="pregen-library__selection-heading">
        <div>
          <p>{ruleset === "srd-5.1-2014" ? "2014" : "2024"} {profile ? "optimized Vault build" : readiness.ready ? "playable release" : "blueprint"}</p>
          <h3>Level {level} {definition.className}</h3>
          <span>{definition.subclassName}</span>
        </div>
        <span className="pregen-library__status" data-status={statusId}>{releaseStatus}</span>
      </div>
      <dl className="pregen-library__facts">
        <div><dt>Build ID</dt><dd><code>{slot.id}</code></dd></div>
        <div><dt>Subclass starts</dt><dd>Level {definition.subclassUnlockLevel}</dd></div>
        <div><dt>At this level</dt><dd>{slot.subclassActive ? "Subclass features are active" : "Class features only; subclass path is reserved"}</dd></div>
        <div><dt>Optimization</dt><dd>{profile ? `${profile.role} · ${profile.complexity}` : "Vault migration pending"}</dd></div>
      </dl>
      <DndPregenValidationPanel readiness={readiness} />
      <a href={definition.sourceUrl} rel="noreferrer" target="_blank">Open {definition.sourceLabel}</a>
    </article>
  );
};
