import type { DndOptimizedBuildProfile } from "../types/dndCharacterVault";
import type { RulesetId } from "../types/ruleCards";
import { dndBarbarianPregenRecords } from "./dndBarbarianPregens";
import {
  barbarianChoices2014,
  barbarianChoices2024,
  optimizeBarbarian2024
} from "./dndVaultBarbarianAdvancement";
import { barbarianMagicItemsForLevel } from "./dndVaultBarbarianMagicItems";

export const dndVaultBarbarianProfiles: DndOptimizedBuildProfile[] = dndBarbarianPregenRecords.map((baseCharacter) => {
  const is2024 = baseCharacter.ruleset === "srd-5.2.1-2024";
  const character = is2024 ? optimizeBarbarian2024(baseCharacter) : baseCharacter;
  return {
    id: `vault-v2-${character.id}`,
    buildSlotId: character.buildSlotId,
    ruleset: character.ruleset,
    classId: character.classId,
    subclassId: character.subclassId,
    level: character.level,
    role: "striker",
    complexity: character.level <= 4 ? "beginner" : character.level <= 10 ? "standard" : "advanced",
    buildGoal: is2024
      ? "Enter Rage quickly, use Reckless Attack to enable Frenzy, and deliver reliable greataxe pressure without losing mental defenses."
      : "Exploit Rage, Reckless Attack, Half-Orc critical dice, and selective Frenzy while managing Exhaustion.",
    optimizationNotes: [
      is2024
        ? "Great Weapon Master and Strength 20 are completed before Constitution and Wisdom-save defenses."
        : "Public 2014 SRD ASIs outperform the available Grappler feat for this greataxe Berserker.",
      "The item package improves unarmored Armor Class, accuracy, flight, saving throws, and effective Strength.",
      is2024
        ? "Frenzy adds damage without Exhaustion, so Reckless Attack is the default offensive setup."
        : "Frenzy is reserved for decisive encounters because each use causes one Exhaustion level when Rage ends."
    ],
    tactics: [
      is2024
        ? "Use Adrenaline Rush before Rage when a Bonus Action Dash is needed to reach a target; otherwise enter Rage immediately."
        : "Close distance before entering Rage whenever possible so the first Rage turn includes a qualifying attack.",
      "Use Reckless Attack when the extra hit chance is worth granting attackers Advantage until the next turn.",
      is2024
        ? "After Reckless Attack, place Frenzy damage on the first Strength-based hit and use Brutal Strike only when its control effect matters more than Advantage."
        : "Use Frenzy only when the encounter is important enough to justify post-Rage Exhaustion.",
      "Protect Winged Boots and Bracers of Defense attunement; swap to defensive alternatives only when flight is unnecessary."
    ],
    advancementChoices: is2024
      ? barbarianChoices2024(character.level)
      : barbarianChoices2014(character.level),
    magicItems: barbarianMagicItemsForLevel(character.ruleset, character.level),
    character,
    sheetVersion: 2,
    reviewStatus: "verified",
    reviewedAt: "2026-07-27"
  };
});

export const getDndVaultBarbarianProfile = (
  ruleset: RulesetId,
  level: number
): DndOptimizedBuildProfile | undefined => dndVaultBarbarianProfiles.find((profile) => (
  profile.ruleset === ruleset && profile.level === level
));
