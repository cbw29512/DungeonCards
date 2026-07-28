import { cocAnimalCreatureCatalog } from "./cocAnimalCreatureCatalog";
import { cocEntityCreatureCatalog } from "./cocEntityCreatureCatalog";
import { cocHumanCreatureCatalog } from "./cocHumanCreatureCatalog";
import { cocUnnaturalCreatureCatalog } from "./cocUnnaturalCreatureCatalog";

/**
 * Public-safe creature and NPC catalog for the Percentile Horror workspace.
 * Every record is original DM Forge content rather than copied sourcebook material.
 */
export const cocCreatureCatalog = [
  ...cocHumanCreatureCatalog,
  ...cocAnimalCreatureCatalog,
  ...cocUnnaturalCreatureCatalog,
  ...cocEntityCreatureCatalog
].sort((left, right) => left.name.localeCompare(right.name));

export const cocCreatureKinds = ["human", "animal", "unnatural", "entity"] as const;
export const cocCreatureThreatLevels = ["low", "moderate", "severe", "catastrophic"] as const;
