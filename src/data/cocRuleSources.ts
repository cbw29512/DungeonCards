import type {
  CocQuickReferenceCard,
  CocRuleSourceRecord,
  CocRuleVerificationStatus
} from "../types/coc";

const WIKI_GAME_SYSTEM = "https://cthulhuwiki.chaosium.com/rules/game-system.html";
const WIKI_SANITY = "https://cthulhuwiki.chaosium.com/rules/sanity.html";
const WIKI_COMBAT = "https://cthulhuwiki.chaosium.com/rules/combat.html";
const WIKI_WOUNDS = "https://cthulhuwiki.chaosium.com/rules/hit-points-wounds-and-healing.html";
const WIKI_MAGIC = "https://cthulhuwiki.chaosium.com/rules/magic.html";
const WIKI_REWARDS = "https://cthulhuwiki.chaosium.com/rules/rewards-of-success.html";
const PROJECT_URL = "https://github.com/cbw29512/DungeonCards/issues/7";
const PRIMARY_REVIEW = "DM Forge official-source audit · 2026-07-24";
const VERIFIED_AT = "2026-07-24";

export const cocRuleVerificationLabels: Record<CocRuleVerificationStatus, string> = {
  prototype: "Original demonstration content",
  "needs-review": "Source reviewed · further review recommended",
  verified: "Verified against official free rules",
  disputed: "Rule disputed"
};

const verified = (record: Omit<CocRuleSourceRecord, "status" | "primaryReviewer" | "verifiedAt">): CocRuleSourceRecord => ({
  ...record,
  status: "verified",
  primaryReviewer: PRIMARY_REVIEW,
  verifiedAt: VERIFIED_AT
});

export const cocRuleSources: CocRuleSourceRecord[] = [
  verified({
    id: "coc-percentile-core",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Percentile checks, difficulty, criticals, and fumbles",
    sourceTitle: "The Call of Cthulhu RPG Wiki — The Game System",
    sourceUrl: WIKI_GAME_SYSTEM,
    chapterOrSection: "Reading D100 / Skill Rolls and Difficulty Levels",
    implementationSummary: "Read 00 and 0 as 100. Regular succeeds at or below the full value, Hard at or below one-half, and Extreme at or below one-fifth. A roll of 01 is critical; fumbles begin at 96 for skills below 50 and at 100 for skills of 50 or more.",
    notes: [
      "The percentile engine keeps 2014/2024 D&D rules entirely separate from this system.",
      "The selected difficulty is evaluated after the success level is determined."
    ]
  }),
  verified({
    id: "coc-bonus-penalty-dice",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Bonus and Penalty dice",
    sourceTitle: "The Call of Cthulhu RPG Wiki — The Game System",
    sourceUrl: WIKI_GAME_SYSTEM,
    chapterOrSection: "Bonus and Penalty Dice",
    implementationSummary: "Bonus and Penalty dice cancel one-for-one. Roll one shared units die with the required tens dice, keeping the lowest candidate for Bonus dice or the highest candidate for Penalty dice.",
    notes: ["DM Forge supports up to two net Bonus or Penalty dice."]
  }),
  verified({
    id: "coc-pushed-roll",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Pushed rolls",
    sourceTitle: "The Call of Cthulhu RPG Wiki — Skill Rolls and Difficulty Levels",
    sourceUrl: WIKI_GAME_SYSTEM,
    chapterOrSection: "Pushing a Roll",
    implementationSummary: "After an eligible failed non-combat skill roll, the player changes the approach and accepts raised stakes. The Keeper may foreshadow the dire consequence before the second roll. Combat rolls cannot be pushed.",
    notes: ["The exact fictional justification remains a Keeper ruling."]
  }),
  verified({
    id: "coc-opposed-rolls",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Generic opposed rolls",
    sourceTitle: "The Call of Cthulhu RPG Wiki — The Game System",
    sourceUrl: WIKI_GAME_SYSTEM,
    chapterOrSection: "Opposed Skill Rolls",
    implementationSummary: "Compare success levels. The higher level wins. If levels match, the higher skill value wins. If both skills match, roll a separate D100 for each side and the lower result wins.",
    notes: [
      "Two failed rolls produce no winner rather than inventing a success.",
      "Equal tie-break rolls are rolled again."
    ]
  }),
  verified({
    id: "coc-sanity-check",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Sanity loss, involuntary action, and temporary insanity",
    sourceTitle: "The Call of Cthulhu RPG Wiki — Sanity",
    sourceUrl: WIKI_SANITY,
    chapterOrSection: "Sanity / Insanity Summary",
    implementationSummary: "Apply the success or failure SAN loss. Any SAN loss causes a momentary involuntary action. Losing 5 or more from one Sanity roll requires an INT roll; success causes temporary insanity for 1D10 hours and a bout of madness, while failure means the mind closes itself to the horror for now.",
    notes: [
      "When others are present, the bout is played round by round for 1D10 rounds.",
      "When alone, the Keeper may summarize the lost time and describe how the investigator is found.",
      "During temporary insanity, delusions may be challenged with a reality check using a Sanity roll."
    ]
  }),
  verified({
    id: "coc-combat-order",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Combat order and significant actions",
    sourceTitle: "The Call of Cthulhu RPG Wiki — Combat",
    sourceUrl: WIKI_COMBAT,
    chapterOrSection: "Combat Order",
    implementationSummary: "Combatants act in descending DEX order. A round lasts long enough for everyone to take one significant action. A character with a readied firearm acts at DEX plus 50 for that shot.",
    notes: ["The Keeper controls the narrative flow while ensuring everyone receives an action."]
  }),
  verified({
    id: "coc-close-combat-responses",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Fighting Back and Dodge",
    sourceTitle: "The Call of Cthulhu RPG Wiki — Combat",
    sourceUrl: WIKI_COMBAT,
    chapterOrSection: "Close Combat",
    implementationSummary: "The attacker must achieve a higher success level than Dodge, so Dodge wins equal levels. A defender Fighting Back must achieve a higher level than the attacker, so the initiating attacker wins equal levels.",
    notes: ["Generic opposed-roll tie rules are not used for close combat."]
  }),
  verified({
    id: "coc-fighting-maneuvers",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Fighting maneuvers and Build",
    sourceTitle: "The Call of Cthulhu RPG Wiki — Combat",
    sourceUrl: WIKI_COMBAT,
    chapterOrSection: "Fighting Maneuvers",
    implementationSummary: "Use Fighting (Brawl) for a non-damage goal such as disarming, knocking down, or restraining. If the attacker has lower Build, apply one Penalty die per point of difference, to a maximum of two. A target three or more Build above the attacker cannot be affected by the maneuver.",
    notes: ["The defender may Dodge or Fight Back normally."]
  }),
  verified({
    id: "coc-outnumbered",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Outnumbered close combat",
    sourceTitle: "The Call of Cthulhu RPG Wiki — Combat",
    sourceUrl: WIKI_COMBAT,
    chapterOrSection: "Outnumbered",
    implementationSummary: "After a defender has fought back or dodged once in the current round, each later melee attack against that defender receives one Bonus die. This does not apply to firearms.",
    notes: ["Track defensive reactions per round, not per attacker."]
  }),
  verified({
    id: "coc-extreme-damage",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Extreme damage",
    sourceTitle: "The Call of Cthulhu RPG Wiki — Combat",
    sourceUrl: WIKI_COMBAT,
    chapterOrSection: "Extreme Damage",
    implementationSummary: "Extreme blunt attacks use maximum weapon damage plus maximum damage bonus. Extreme impaling attacks use maximum weapon damage plus maximum damage bonus plus an additional weapon-damage roll.",
    notes: ["The structured damage engine keeps ordinary, Extreme blunt, and Extreme impaling outcomes separate."]
  }),
  verified({
    id: "coc-firearm-procedure",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Readied firearms, handgun shots, point blank, and dive for cover",
    sourceTitle: "The Call of Cthulhu RPG Wiki — Combat",
    sourceUrl: WIKI_COMBAT,
    chapterOrSection: "Firearms Rules",
    implementationSummary: "A readied firearm acts at DEX plus 50. Firing two or three handgun shots applies one Penalty die to each shot. Point blank is within one-fifth DEX in feet and grants one Bonus die. A successful dive for cover applies one Penalty die; choosing to dive costs the target's next attack whether the Dodge roll succeeds or fails.",
    notes: [
      "The card distinguishes no dive, a failed Dodge, and a successful Dodge.",
      "Weapon-specific range bands, reload times, and malfunction values must come from an authorized equipment record."
    ]
  }),
  verified({
    id: "coc-hit-points-wounds",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Hit Points, Major Wounds, dying, and instant death",
    sourceTitle: "The Call of Cthulhu RPG Wiki — Hit Points, Wounds, and Healing",
    sourceUrl: WIKI_WOUNDS,
    chapterOrSection: "Hit Points / Major Wound",
    implementationSummary: "Damage never reduces HP below zero. One blow dealing at least half maximum HP causes a Major Wound and requires a CON roll to remain conscious. One blow equal to or above maximum HP causes instant death. Zero HP with a Major Wound means dying; zero HP without one means unconscious but not dying.",
    notes: [
      "A dying character makes a CON roll at the end of the following round and every round thereafter until stabilized or dead.",
      "The Major Wound threshold rounds up for odd maximum HP because damage is a whole number."
    ]
  }),
  verified({
    id: "coc-healing",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "First Aid, Medicine, and natural healing",
    sourceTitle: "The Call of Cthulhu RPG Wiki — Hit Points, Wounds, and Healing",
    sourceUrl: WIKI_WOUNDS,
    chapterOrSection: "Healing",
    implementationSummary: "Successful First Aid heals 1 HP and can rouse an unconscious character. On a dying character it stabilizes long enough for Medicine. Medicine takes at least one hour with suitable equipment and heals 1D3 HP. Characters without a Major Wound recover 1 HP per day; Major Wounds use weekly CON healing rolls.",
    notes: [
      "A successful weekly Major Wound healing roll restores 1D3 HP; Extreme success restores 2D3 HP.",
      "The Major Wound ends on an Extreme healing success or when current HP reaches at least half maximum HP."
    ]
  }),
  verified({
    id: "coc-magic-casting",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Magic Points and first-time spell casting",
    sourceTitle: "The Call of Cthulhu RPG Wiki — Magic",
    sourceUrl: WIKI_MAGIC,
    chapterOrSection: "Magic Points / Casting Roll / Casting Time",
    implementationSummary: "A newly learned spell requires a Hard POW roll the first time it is cast. After a failed first attempt, the caster may pay the costs again and push the roll. A failed pushed roll still casts the spell but brings dire consequences. Later castings do not require the casting roll. Instantaneous spells act at DEX plus 50; one-round spells activate on DEX in the present round.",
    notes: [
      "Most spells spend Magic Points; further Magic Point loss at zero is taken from HP one-for-one.",
      "Individual spell effects and costs remain in authorized rules sources."
    ]
  }),
  verified({
    id: "coc-skill-improvement",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Skill checks and improvement rolls",
    sourceTitle: "The Call of Cthulhu RPG Wiki — Rewards of Success",
    sourceUrl: WIKI_REWARDS,
    chapterOrSection: "Roll for Skill Increases",
    implementationSummary: "Mark a skill after a successful use, at most once per skill. When the Keeper calls for improvement rolls, roll D100 for each marked skill. A result over the current skill increases it by 1D10; then erase the check mark.",
    notes: ["The more capable an investigator becomes, the less likely a further increase becomes."]
  }),
  {
    id: "coc-original-weapon-preview",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Original weapon interaction demonstration",
    sourceTitle: "DM Forge original demonstration content",
    sourceUrl: PROJECT_URL,
    chapterOrSection: "Public development demonstration",
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
    ruleName: "Original ritual interaction demonstration",
    sourceTitle: "DM Forge original demonstration content",
    sourceUrl: PROJECT_URL,
    chapterOrSection: "Public development demonstration",
    implementationSummary: "Demonstrates Magic Point spending, Sanity cost, duration, and active-state controls using an invented ritual.",
    status: "prototype",
    notes: [
      "This is not an official Call of Cthulhu spell.",
      "Use the verified magic procedure for first casting and timing rules."
    ]
  },
  {
    id: "coc-original-creature-preview",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Original creature dossier demonstration",
    sourceTitle: "DM Forge original demonstration content",
    sourceUrl: PROJECT_URL,
    chapterOrSection: "Public development demonstration",
    implementationSummary: "Demonstrates a combat-ready dossier, attacks, damage, Dodge, Sanity loss, armor, HP, MP, and encounter tracking using an invented creature.",
    status: "prototype",
    notes: [
      "This is not an official Mythos creature or official stat block.",
      "The surrounding combat procedures are verified separately."
    ]
  }
];

export const cocQuickReferenceCards: CocQuickReferenceCard[] = [
  {
    id: "coc-reference-pushed-roll",
    stamp: "PUSH",
    title: "Pushed Roll",
    text: "After an eligible failed non-combat roll, change the approach and accept raised stakes. The Keeper may foreshadow the dire consequence before the second roll.",
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
    title: "Sanity Loss",
    text: "Any SAN loss causes a momentary involuntary action. Five or more loss from one check triggers an INT roll for temporary insanity.",
    sourceId: "coc-sanity-check"
  },
  {
    id: "coc-reference-close-combat",
    stamp: "FIGHT",
    title: "Fight Back or Dodge",
    text: "Dodge wins equal success levels. The initiating attacker wins an equal result against Fight Back.",
    sourceId: "coc-close-combat-responses"
  },
  {
    id: "coc-reference-maneuver",
    stamp: "MNVR",
    title: "Fighting Maneuver",
    text: "Compare Build. The attacker takes one Penalty die per point of disadvantage, maximum two. A target three or more Build higher cannot be affected.",
    sourceId: "coc-fighting-maneuvers"
  },
  {
    id: "coc-reference-outnumbered",
    stamp: "MOB",
    title: "Outnumbered",
    text: "After the defender has Dodged or Fought Back once this round, each later melee attack against them gains one Bonus die. Firearms are excluded.",
    sourceId: "coc-outnumbered"
  },
  {
    id: "coc-reference-healing",
    stamp: "AID",
    title: "First Aid & Medicine",
    text: "First Aid heals 1 HP and can stabilize dying. Medicine takes at least one hour and heals 1D3 HP with suitable equipment.",
    sourceId: "coc-healing"
  },
  {
    id: "coc-reference-magic",
    stamp: "POW",
    title: "First Spell Casting",
    text: "A newly learned spell uses a Hard POW roll. A failed push still casts the spell but brings dire consequences; later castings need no casting roll.",
    sourceId: "coc-magic-casting"
  },
  {
    id: "coc-reference-improvement",
    stamp: "XP",
    title: "Skill Improvement",
    text: "Roll D100 for each checked skill when the Keeper calls for improvement. Roll over the skill to gain 1D10, then erase the check.",
    sourceId: "coc-skill-improvement"
  }
];

export const getCocRuleSource = (sourceId: string): CocRuleSourceRecord => {
  const source = cocRuleSources.find((candidate) => candidate.id === sourceId);
  if (!source) throw new Error(`Call of Cthulhu rule source not found: ${sourceId}`);
  return source;
};
