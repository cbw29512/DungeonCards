import type { CocRuleSourceRecord } from "../types/coc";

const PRIMARY_REVIEW = "DM Forge official-source audit · 2026-07-25";
const VERIFIED_AT = "2026-07-25";

export const cocLuckRuleSources: CocRuleSourceRecord[] = [
  {
    id: "coc-luck-rolls",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Luck rolls and Group Luck",
    sourceTitle: "The Call of Cthulhu RPG Wiki — Luck Rolls",
    sourceUrl: "https://cthulhuwiki.chaosium.com/rules/opposed-skill-rolls.html",
    chapterOrSection: "Luck Rolls",
    implementationSummary: "Use a Luck roll only for external chance or fate when no skill or characteristic is more appropriate. Roll D100 at or below current Luck to succeed. For Group Luck, an investigator with the lowest Luck among those present makes the roll for the group.",
    status: "verified",
    primaryReviewer: PRIMARY_REVIEW,
    verifiedAt: VERIFIED_AT,
    notes: [
      "Ties for lowest Luck are presented as a choice among the tied investigators rather than inventing an unsupported tie-breaker.",
      "The group roster is local session bookkeeping and does not store campaign data outside the browser session."
    ]
  },
  {
    id: "coc-starting-luck",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Starting Luck",
    sourceTitle: "The Call of Cthulhu RPG Wiki — Secondary Attributes",
    sourceUrl: "https://cthulhuwiki.chaosium.com/investigators/step-two-secondary-attributes.html",
    chapterOrSection: "Luck",
    implementationSummary: "Calculate an investigator's starting Luck by rolling 3D6 and multiplying the total by 5.",
    status: "verified",
    primaryReviewer: PRIMARY_REVIEW,
    verifiedAt: VERIFIED_AT,
    notes: [
      "The generator exposes all three D6 results and the final multiplied value.",
      "Optional Luck-spending rules are deliberately excluded from this verified record."
    ]
  }
];
