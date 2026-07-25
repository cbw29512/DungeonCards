import { cocRulesCoverage } from "./rulesCoverageCoc";
import { dndRulesCoverage } from "./rulesCoverageDnd";

export const rulesCoverageCatalog = [
  ...dndRulesCoverage,
  ...cocRulesCoverage
];
