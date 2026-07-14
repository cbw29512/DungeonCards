import type {
  CocQuickReferenceCard,
  CocRuleSourceRecord,
  CocRuleVerificationStatus
} from "../types/coc";

const WIKI_GAME_SYSTEM = "https://cthulhuwiki.chaosium.com/rules/game-system.html";
const WIKI_SANITY = "https://cthulhuwiki.chaosium.com/rules/sanity.html";
const WIKI_COMBAT = "https://cthulhuwiki.chaosium.com/rules/combat.html";
const WIKI_WOUNDS = "https://cthulhuwiki.chaosium.com/rules/hit-points-wounds-and-healing.html";
const PROJECT_URL = "https://github.com/cbw29512/DungeonCards/issues/7";
const PRIMARY_REVIEW = "OpenAI implementation review · 2026-07-14";

export const cocRuleVerificationLabels: Record<CocRuleVerificationStatus, string> = {
  prototype: "Prototype content",
  "needs-review": "Primary source reviewed · independent review pending",
  verified: "Rules verified",
  disputed: "Rule disputed"
};

export const cocRuleSources: CocRuleSourceRecord[] = [
  {
    id: "coc-percentile-core",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Percentile checks and difficulty levels",
    sourceTitle: "The Call of Cthulhu RPG Wiki — The Game System",
    sourceUrl: WIKI_GAME_SYSTEM,
    chapterOrSection: "Reading D100 / Skill Rolls and Difficulty Levels",
    implementationSummary: "Read 00 and 0 as 100, otherwise combine the tens and units dice. Regular succeeds at or below the full value, Hard at or below one-half, and Extreme at or below one-fifth.",
    status: "needs-review",
    primaryReviewer: PRIMARY_REVIEW,
    notes: [
      "The official Chaosium wiki directly supports D100 reading and the Regular, Hard, and Extreme thresholds.",
      "Critical and Fumble boundaries remain pending direct Keeper Rulebook or Quick-Start PDF review.",
      "Independent second review is required before verified status."
    ]
  },
  {
    id: "coc-bonus-penalty-dice",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Bonus and Penalty dice",
    sourceTitle: "The Call of Cthulhu RPG Wiki — The Game System",
    sourceUrl: WIKI_GAME_SYSTEM,
    chapterOrSection: "Bonus and Penalty Dice",
    implementationSummary: "One Bonus and one Penalty die cancel. Roll one shared units die with additional tens dice, keeping the lower candidate for Bonus dice or the higher candidate for Penalty dice.",
    status: "needs-review",
    primaryReviewer: PRIMARY_REVIEW,
    notes: [
      "The official wiki directly supports cancellation, the shared units die, and lower/higher candidate selection.",
      "The engine supports up to two net dice; the maximum requires Keeper Rulebook or Quick-Start PDF confirmation.",
      "Independent second review remains required."
    ]
  },
  {
    id: "coc-pushed-roll",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Pushed rolls",
    sourceTitle: "The Call of Cthulhu RPG Wiki — The Game System",
    sourceUrl: WIKI_GAME_SYSTEM,
    chapterOrSection: "Skill Rolls and Difficulty Levels",
    implementationSummary: "A player may justify a renewed attempt after an eligible failed skill roll. The stakes rise, and the Keeper may foreshadow the dire consequence before the player chooses whether to make the second roll.",
    status: "needs-review",
    primaryReviewer: PRIMARY_REVIEW,
    notes: [
      "The official combat page separately confirms that combat rolls cannot be pushed.",
      "A complete eligibility matrix still requires the core rulebook review.",
      "Independent second review remains required."
    ]
  },
  {
    id: "coc-opposed-rolls",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Generic opposed rolls",
    sourceTitle: "The Call of Cthulhu RPG Wiki — The Game System",
    sourceUrl: WIKI_GAME_SYSTEM,
    chapterOrSection: "Opposed Skill Rolls",
    implementationSummary: "Compare success levels. The higher level wins. If levels match, the higher skill value wins. If both skills match, roll a separate D100 for each side and the lower result wins.",
    status: "needs-review",
    primaryReviewer: PRIMARY_REVIEW,
    notes: [
      "The implementation treats two failed rolls as no winner rather than inventing a successful outcome.",
      "Equal tie-break rolls request another tie-break rather than inventing a winner.",
      "Independent second review remains required."
    ]
  },
  {
    id: "coc-sanity-check",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Sanity checks and temporary insanity trigger",
    sourceTitle: "The Call of Cthulhu RPG Wiki — Sanity",
    sourceUrl: WIKI_SANITY,
    chapterOrSection: "Sanity / Insanity Summary",
    implementationSummary: "Roll at or below current Sanity for the listed success loss; otherwise apply the listed failure loss. A failed Sanity roll lets the Keeper momentarily control the investigator's next action. Losing 5 or more from one roll requires an INT roll; success triggers temporary insanity for 1D10 hours and a bout of madness.",
    status: "needs-review",
    primaryReviewer: PRIMARY_REVIEW,
    notes: [
      "The card supports Sanity 0 without clamping it to an ordinary skill minimum.",
      "A positive loss after a successful Sanity roll does not by itself trigger the involuntary action.",
      "The card rolls a 1D10 bout-table index but does not reproduce the official bout table or invent a fixed round duration.",
      "Indefinite insanity is not included in this starter-rule slice.",
      "Independent second review remains required."
    ]
  },
  {
    id: "coc-close-combat-responses",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Fighting Back and Dodge",
    sourceTitle: "The Call of Cthulhu RPG Wiki — Combat",
    sourceUrl: WIKI_COMBAT,
    chapterOrSection: "Close Combat",
    implementationSummary: "The attacker must achieve a higher success level than Dodge, so Dodge wins equal levels. A defender Fighting Back must achieve a higher level than the attacker, so the initiating attacker wins equal levels.",
    status: "needs-review",
    primaryReviewer: PRIMARY_REVIEW,
    notes: [
      "The resolver keeps generic opposed-roll ties separate from close-combat ties.",
      "A successful Fight Back is capped at regular damage; complete damage automation is tracked separately.",
      "Independent second review remains required."
    ]
  },
  {
    id: "coc-extreme-damage",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Extreme damage",
    sourceTitle: "The Call of Cthulhu RPG Wiki — Combat",
    sourceUrl: WIKI_COMBAT,
    chapterOrSection: "Extreme Damage",
    implementationSummary: "Extreme blunt attacks use maximum weapon damage plus maximum damage bonus. Extreme impaling attacks use maximum weapon damage plus maximum damage bonus plus an additional weapon-damage roll.",
    status: "needs-review",
    primaryReviewer: PRIMARY_REVIEW,
    notes: [
      "The structured damage engine supports ordinary, Extreme blunt, and Extreme impaling outcomes.",
      "The original handgun prototype now uses the source-backed Extreme impaling procedure.",
      "Critical damage and complex creature attacks remain outside this reviewed slice.",
      "Independent second review remains required."
    ]
  },
  {
    id: "coc-firearm-procedure",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Readied firearms, handgun shots, point blank, and dive for cover",
    sourceTitle: "The Call of Cthulhu RPG Wiki — Combat",
    sourceUrl: WIKI_COMBAT,
    chapterOrSection: "Firearms Rules",
    implementationSummary: "A readied firearm acts at DEX plus 50. Firing two or three handgun shots applies one Penalty die to each shot. Point blank is within one-fifth DEX in feet and grants one Bonus die. A successful dive for cover applies one Penalty die; choosing to dive costs the target's next attack whether the Dodge roll succeeds or fails.",
    status: "needs-review",
    primaryReviewer: PRIMARY_REVIEW,
    notes: [
      "The procedure distinguishes no dive, a failed Dodge, and a successful Dodge.",
      "Only a successful Dodge adds the attack Penalty die, while either attempted dive forfeits the target's next attack.",
      "Range bands beyond point blank, reloading, and full malfunction procedures still require core-rulebook review.",
      "Independent second review remains required."
    ]
  },
  {
    id: "coc-hit-points-wounds",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Hit Points, Major Wounds, dying, and instant death",
    sourceTitle: "The Call of Cthulhu RPG Wiki — Hit Points, Wounds, and Healing",
    sourceUrl: WIKI_WOUNDS,
    chapterOrSection: "Hit Points / Major Wound",
    implementationSummary: "Damage never reduces HP below zero. One blow dealing at least half maximum HP causes a Major Wound and requires a CON roll to remain conscious. One blow equal to or above maximum HP causes instant death. Zero HP with a Major Wound means dying; zero HP without one means unconscious but not dying.",
    status: "needs-review",
    primaryReviewer: PRIMARY_REVIEW,
    notes: [
      "The Major Wound threshold rounds up for odd maximum HP because damage is a whole number.",
      "The card stops at the first CON roll and identifies later dying checks and First Aid without automating round timing.",
      "Independent second review remains required."
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
    text: "After an eligible failed roll, justify a renewed attempt. The Keeper may foreshadow the dire consequence before you choose whether to make the second roll. Combat rolls cannot be pushed.",
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
    text: "Roll at or below current Sanity for the listed success loss; otherwise apply the failure loss. A failed roll lets the Keeper momentarily control the next action, and 5 or more loss triggers an INT roll.",
    sourceId: "coc-sanity-check"
  },
  {
    id: "coc-reference-close-combat",
    stamp: "FIGHT",
    title: "Fight Back or Dodge",
    text: "Dodge wins equal success levels because the attacker must do better. The initiating attacker wins an equal result against Fight Back.",
    sourceId: "coc-close-combat-responses"
  }
];

export const getCocRuleSource = (sourceId: string): CocRuleSourceRecord => {
  const source = cocRuleSources.find((candidate) => candidate.id === sourceId);
  if (!source) throw new Error(`Call of Cthulhu rule source not found: ${sourceId}`);
  return source;
};