import type { CardDefinition } from "../types/cardPlatform";
import type { DndAbilityId } from "../types/dndCharacter";
import type { DndOptimizedBuildProfile } from "../types/dndCharacterVault";
import { buildVaultCard, safeVaultCardId } from "./dndCharacterCardShared";

const abilityModifier = (score: number): number => Math.floor((score - 10) / 2);
const proficiencyBonus = (level: number): number => 2 + Math.floor((level - 1) / 4);
const signed = (value: number): string => value >= 0 ? `+${value}` : `${value}`;

const attackBonus = (
  profile: DndOptimizedBuildProfile,
  ability: DndAbilityId,
  proficient: boolean
): number => abilityModifier(profile.character.abilityScores[ability])
  + (proficient ? proficiencyBonus(profile.level) : 0);

export const generateDndAttackCards = (
  profile: DndOptimizedBuildProfile
): CardDefinition[] => profile.character.attacks.map((attack, index) => {
  const bonus = attackBonus(profile, attack.attackAbility, attack.proficient);
  return buildVaultCard(profile, {
    id: `attack:${index}-${safeVaultCardId(attack.id)}`,
    family: "character-action",
    title: attack.name,
    subtitle: `${attack.rangeOrReach} · ${attack.damageType}`,
    summary: `Attack ${signed(bonus)}; damage ${attack.damageFormula} ${attack.damageType}.`,
    detail: attack.notes,
    tags: ["attack", attack.attackAbility, safeVaultCardId(attack.damageType)],
    actions: [
      {
        id: "attack-roll",
        kind: "roll",
        label: `Attack with ${attack.name}`,
        rollSystem: "d20",
        formula: `d20${signed(bonus)}`,
        allowsAdvantage: true,
        notes: attack.rangeOrReach
      },
      {
        id: "damage-roll",
        kind: "roll",
        label: `Roll ${attack.name} damage`,
        rollSystem: "dice-formula",
        formula: attack.damageFormula,
        notes: attack.damageType
      }
    ]
  });
});

export const generateDndResourceCards = (
  profile: DndOptimizedBuildProfile
): CardDefinition[] => profile.character.resources.map((resource, index) => (
  buildVaultCard(profile, {
    id: `resource:${index}-${safeVaultCardId(resource.id)}`,
    family: "character-action",
    title: resource.name,
    subtitle: `${resource.refresh.replaceAll("-", " ")} refresh`,
    summary: resource.maximum === "unlimited"
      ? `${resource.name} is available without a numeric use limit.`
      : `Track up to ${resource.maximum} uses of ${resource.name}.`,
    detail: resource.notes,
    tags: ["resource", resource.refresh],
    actions: [{
      id: "use-resource",
      kind: "procedure",
      label: `Use ${resource.name}`,
      steps: [resource.notes ?? `Spend one use of ${resource.name} when its feature permits.`]
    }],
    resources: [{
      id: "uses",
      label: resource.name,
      maximum: resource.maximum,
      initial: resource.maximum === "unlimited" ? 0 : resource.maximum,
      refresh: resource.refresh,
      unit: "uses",
      notes: resource.notes
    }]
  })
));
