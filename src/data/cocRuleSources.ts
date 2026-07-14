import type {
  CocQuickReferenceCard,
  CocRuleSourceRecord,
  CocRuleVerificationStatus
} from "../types/coc";

const QUICKSTART_URL = "https://www.chaosium.com/cthulhu-quickstart/";
const PROJECT_URL = "https://github.com/cbw29512/DungeonCards/issues/7";

export const cocRuleVerificationLabels: Record<CocRuleVerificationStatus, string> = {
  prototype: "Prototype content",
  "needs-review": "Needs source review",
  verified: "Rules verified",
  disputed: "Rule disputed"
};

export const cocRuleSources: CocRuleSourceRecord[] = [
  {
    id: "coc-percentile-core",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Percentile checks, difficulty, and success levels",
    sourceTitle: "Call of Cthulhu 7th Edition Quick-Start Rules",
    sourceUrl: QUICKSTART_URL,
    chapterOrSection: "Game System / Skill Rolls",
    implementationSummary: "Roll percentile dice against a skill value and classify the result as Critical, Extreme, Hard, Regular, Failure, or Fumble. Hard uses one-half and Extreme uses one-fifth of the skill value.",
    status: "needs-review",
    notes: [
      "The official Quick-Start landing page and PDF source have been located.",
      "Page-level comparison and an independent second review are still required before this record can be marked verified.",
      "Current automated tests cover threshold boundaries, 01, 100, and the skill-50 Fumble boundary."
    ]
  },
  {
    id: "coc-bonus-penalty-dice",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Bonus and Penalty dice",
    sourceTitle: "Call of Cthulhu 7th Edition Quick-Start Rules",
    sourceUrl: QUICKSTART_URL,
    chapterOrSection: "Game System / Bonus and Penalty Dice",
    implementationSummary: "Use one shared units die and additional tens dice. Keep the lowest candidate for net Bonus dice and the highest candidate for net Penalty dice. Opposing Bonus and Penalty dice cancel before rolling, with no more than two net dice applied.",
    status: "needs-review",
    notes: [
      "The engine supports zero, one, or two net Bonus or Penalty dice.",
      "Cancellation and double-zero interpretation have automated boundary tests.",
      "Page-level source review remains required."
    ]
  },
  {
    id: "coc-pushed-roll",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Pushed rolls",
    sourceTitle: "Call of Cthulhu 7th Edition Quick-Start Rules",
    sourceUrl: QUICKSTART_URL,
    chapterOrSection: "Game System / Pushing a Roll",
    implementationSummary: "After an eligible failed roll, the player explains a different or riskier renewed attempt and the Keeper states the consequence of failure before the pushed roll is made.",
    status: "needs-review",
    notes: [
      "The preview currently presents this as reference text only.",
      "Eligibility exclusions and exact consequence procedure require direct page review before automation."
    ]
  },
  {
    id: "coc-sanity-check",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Sanity checks and listed loss",
    sourceTitle: "Call of Cthulhu 7th Edition Quick-Start Rules",
    sourceUrl: QUICKSTART_URL,
    chapterOrSection: "Sanity",
    implementationSummary: "Roll against current Sanity and apply the scenario or creature's listed loss according to whether the check succeeds or fails.",
    status: "needs-review",
    notes: [
      "The preview demonstrates a failed-loss formula but does not yet implement the complete insanity procedure.",
      "Temporary and indefinite insanity rules remain outside this certified slice."
    ]
  },
  {
    id: "coc-close-combat-responses",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Fighting Back and Dodge",
    sourceTitle: "Call of Cthulhu 7th Edition Quick-Start Rules",
    sourceUrl: QUICKSTART_URL,
    chapterOrSection: "Combat / Close Combat",
    implementationSummary: "A defender in close combat may Fight Back or Dodge; the opposed result and tie handling depend on which response is chosen.",
    status: "needs-review",
    notes: [
      "The preview text intentionally avoids encoding tie resolution until direct source review is completed.",
      "A dedicated opposed-combat resolver is still required."
    ]
  },
  {
    id: "coc-original-weapon-preview",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Original weapon interaction prototype",
    sourceTitle: "Dungeon Cards original prototype content",
    sourceUrl: PROJECT_URL,
    chapterOrSection: "Private development preview",
    implementationSummary: "Demonstrates attack, ammunition, reload, malfunction threshold, and damage-card interactions using original sample data.",
    status: "prototype",
    notes: [
      "The sample weapon is not an approved official equipment record.",
      "Its values must not be used as a rules citation."
    ]
  },
  {
    id: "coc-original-spell-preview",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Original ritual interaction prototype",
    sourceTitle: "Dungeon Cards original prototype content",
    sourceUrl: PROJECT_URL,
    chapterOrSection: "Private development preview",
    implementationSummary: "Demonstrates casting, Magic Point spending, Sanity cost, duration, and active-state controls using an invented ritual.",
    status: "prototype",
    notes: [
      "This is not an official Call of Cthulhu spell.",
      "No official spell procedure is certified by this prototype."
    ]
  },
  {
    id: "coc-original-creature-preview",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Original creature dossier prototype",
    sourceTitle: "Dungeon Cards original prototype content",
    sourceUrl: PROJECT_URL,
    chapterOrSection: "Private development preview",
    implementationSummary: "Demonstrates a combat-ready dossier, attacks, damage, Dodge, Sanity loss, armor, HP, MP, and encounter tracking using an invented creature.",
    status: "prototype",
    notes: [
      "This is not an official Mythos creature or official stat block.",
      "Creature automation remains subject to the combat rules audit."
    ]
  }
];

export const cocQuickReferenceCards: CocQuickReferenceCard[] = [
  {
    id: "coc-reference-pushed-roll",
    stamp: "PUSH",
    title: "Pushed Roll",
    text: "After an eligible failed roll, describe a different or riskier renewed attempt. The Keeper states what failure will mean before the pushed roll is made.",
    sourceId: "coc-pushed-roll"
  },
  {
    id: "coc-reference-bonus-penalty",
    stamp: "B/P",
    title: "Bonus & Penalty Dice",
    text: "Bonus and Penalty dice cancel. Roll one shared units die plus the required tens dice, keeping the lowest result for Bonus dice or highest for Penalty dice.",
    sourceId: "coc-bonus-penalty-dice"
  },
  {
    id: "coc-reference-sanity",
    stamp: "SAN",
    title: "Sanity Check",
    text: "Roll against current Sanity and apply the encounter's listed success or failure loss. Additional insanity procedures require their own verified sequence.",
    sourceId: "coc-sanity-check"
  },
  {
    id: "coc-reference-close-combat",
    stamp: "FIGHT",
    title: "Fight Back or Dodge",
    text: "When attacked in close combat, choose to Fight Back or Dodge. Resolve the opposed success levels using the response-specific tie rule.",
    sourceId: "coc-close-combat-responses"
  }
];

export const getCocRuleSource = (sourceId: string): CocRuleSourceRecord => {
  const source = cocRuleSources.find((candidate) => candidate.id === sourceId);
  if (!source) throw new Error(`Call of Cthulhu rule source not found: ${sourceId}`);
  return source;
};