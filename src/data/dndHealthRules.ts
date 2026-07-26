import type { RulesetId } from "../types/ruleCards";

export const dndHealthRuleSources: Record<RulesetId, { reference: string; url: string; notes: string[] }> = {
  "srd-5.1-2014": {
    reference: "Basic Rules 2014 · Combat: Damage and Healing",
    url: "https://www.dndbeyond.com/sources/dnd/basic-rules-2014/combat#DamageandHealing",
    notes: [
      "Death Saves succeed on 10 or higher; three successes stabilize and three failures kill.",
      "A natural 1 counts as two failures; a natural 20 restores 1 HP.",
      "Temporary Hit Points do not stack, do not count as healing, and do not restore consciousness at 0 HP."
    ]
  },
  "srd-5.2.1-2024": {
    reference: "Free Rules 2024 · Playing the Game: Damage and Healing",
    url: "https://www.dndbeyond.com/sources/dnd/br-2024/playing-the-game#DamageandHealing",
    notes: [
      "Death Saves succeed on 10 or higher; three successes stabilize and three failures kill.",
      "A natural 1 counts as two failures; a natural 20 restores 1 HP.",
      "Bloodied means current HP is half the maximum or lower and has no effect by itself."
    ]
  }
};
