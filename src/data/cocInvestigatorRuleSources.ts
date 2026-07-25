import type { CocRuleSourceRecord } from "../types/coc";

const PRIMARY_REVIEW = "DM Forge official-source audit · 2026-07-25";
const VERIFIED_AT = "2026-07-25";

export const cocInvestigatorRuleSources: CocRuleSourceRecord[] = [
  {
    id: "coc-investigator-characteristics",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Simplified investigator characteristics",
    sourceTitle: "The Call of Cthulhu RPG Wiki — Investigator Characteristics",
    sourceUrl: "https://cthulhuwiki.chaosium.com/investigators/step-one-investigator-characteristics.html",
    chapterOrSection: "Investigator Characteristics / Half and Fifth Values",
    implementationSummary: "Assign 40, 50, 50, 50, 60, 60, 70, and 80 among STR, CON, POW, DEX, APP, SIZ, INT, and EDU. Half and Fifth values are the Regular value divided by 2 or 5, rounding down.",
    status: "verified",
    primaryReviewer: PRIMARY_REVIEW,
    verifiedAt: VERIFIED_AT,
    notes: [
      "The builder validates the exact public fixed array rather than silently accepting duplicate or missing values.",
      "The detailed paid-book generation methods and age adjustments are not reproduced."
    ]
  },
  {
    id: "coc-investigator-secondary",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Investigator secondary attributes",
    sourceTitle: "The Call of Cthulhu RPG Wiki — Secondary Attributes",
    sourceUrl: "https://cthulhuwiki.chaosium.com/investigators/step-two-secondary-attributes.html",
    chapterOrSection: "Damage Bonus and Build / HP / MOV / SAN / MP / Luck",
    implementationSummary: "Calculate HP as floor((CON + SIZ) / 10), SAN from POW, MP as one-fifth POW, human MOV as 8, and Damage Bonus and Build from STR + SIZ using the published human bands.",
    status: "verified",
    primaryReviewer: PRIMARY_REVIEW,
    verifiedAt: VERIFIED_AT,
    notes: [
      "Starting Luck remains implemented and audited by the separate Luck source record.",
      "The builder is scoped to the simplified human-investigator workflow."
    ]
  },
  {
    id: "coc-investigator-occupation",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Simplified custom occupation and skill allocation",
    sourceTitle: "The Call of Cthulhu RPG Wiki — Occupation and Skills",
    sourceUrl: "https://cthulhuwiki.chaosium.com/investigators/step-three-occupation-and-skills.html",
    chapterOrSection: "Occupation and Skills",
    implementationSummary: "Choose eight occupation skills plus Credit Rating and assign one 70, two 60s, three 50s, and three 40s. Choose four nonoccupation personal-interest skills and add 20 to each base value. Beginning investigators do not assign creation points to Cthulhu Mythos.",
    status: "verified",
    primaryReviewer: PRIMARY_REVIEW,
    verifiedAt: VERIFIED_AT,
    notes: [
      "The public builder supports custom occupation skill names instead of republishing expanded paid-book occupation catalogs.",
      "Detailed occupation options and expanded creation methods remain in owned sources."
    ]
  }
];
