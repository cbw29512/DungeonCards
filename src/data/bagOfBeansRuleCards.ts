import type { RuleCard, RuleRollMode, RuleTableEntry } from "../types/ruleCards";
import { bagOfBeans2014, bagOfBeans2024 } from "./bagOfBeansTables";

const plantMode = (table: RuleTableEntry[]): RuleRollMode => ({
  id: "plant",
  label: "Plant one bean",
  kind: "table",
  formula: "1d100",
  choices: [{ id: "effect", label: "Roll planted effect", formula: "1d100", table }]
});

const dumpMode: RuleRollMode = {
  id: "dump",
  label: "Dump beans",
  kind: "damage",
  formula: "5d4"
};

export const bagOfBeansRuleCards: RuleCard[] = [{
  id: "bag-of-beans",
  name: "Bag of Beans",
  kind: "magic-item",
  imageEmoji: "🫘",
  variants: {
    "srd-5.1-2014": {
      ruleset: "srd-5.1-2014",
      source: "srd",
      sourceReference: "SRD 5.1 • Bag of Beans",
      summary: "Rare • Found with 3d4 beans • Plant one or dump the bag",
      detail: "Dumping deals 5d4 Fire in a 10-foot radius (DC 15 Dexterity, half on success). A planted bean produces its d100 effect after 1 minute.",
      tags: ["magic-item", "dm", "random", "d100"],
      modes: [plantMode(bagOfBeans2014), dumpMode]
    },
    "srd-5.2.1-2024": {
      ruleset: "srd-5.2.1-2024",
      source: "srd",
      sourceReference: "SRD 5.2.1 • Bag of Beans",
      summary: "Rare • Found with 3d4 beans • Plant one or dump one or more",
      detail: "Dumping deals 5d4 Force in a 10-foot-radius Sphere (DC 15 Dexterity, half on success). A planted bean produces its d100 effect after 1 minute.",
      tags: ["magic-item", "dm", "random", "d100"],
      modes: [plantMode(bagOfBeans2024), dumpMode]
    }
  }
}];