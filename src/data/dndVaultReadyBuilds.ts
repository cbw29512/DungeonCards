import type { DndOptimizedBuildProfile } from "../types/dndCharacterVault";
import type { RulesetId } from "../types/ruleCards";
import { dndVaultBarbarianProfiles } from "./dndVaultBarbarianProfiles";
import { dndVaultBardProfiles } from "./dndVaultBardProfiles";
import { dndVaultClericProfiles } from "./dndVaultClericProfiles";
import { dndVaultFighterProfiles } from "./dndVaultFighterProfiles";
import { dndVaultPaladinProfiles } from "./dndVaultPaladinProfiles";
import { dndVaultRangerProfiles } from "./dndVaultRangerProfiles";
import { dndVaultRogueProfiles } from "./dndVaultRogueProfiles";
import { dndVaultWizardProfiles } from "./dndVaultWizardProfiles";

export const dndVaultReadyBuilds: DndOptimizedBuildProfile[] = [
  ...dndVaultBarbarianProfiles,
  ...dndVaultBardProfiles,
  ...dndVaultClericProfiles,
  ...dndVaultFighterProfiles,
  ...dndVaultPaladinProfiles,
  ...dndVaultRangerProfiles,
  ...dndVaultRogueProfiles,
  ...dndVaultWizardProfiles
];

export const getDndVaultReadyBuildById = (
  profileId: string
): DndOptimizedBuildProfile | undefined => dndVaultReadyBuilds.find((profile) => (
  profile.id === profileId
));

export const getDndVaultReadyBuild = (
  ruleset: RulesetId,
  classId: string,
  subclassId: string,
  level: number
): DndOptimizedBuildProfile | undefined => dndVaultReadyBuilds.find((profile) => (
  profile.ruleset === ruleset
  && profile.classId === classId
  && profile.subclassId === subclassId
  && profile.level === level
));

export const countDndVaultReadyBuilds = (ruleset: RulesetId): number =>
  dndVaultReadyBuilds.filter((profile) => profile.ruleset === ruleset).length;
