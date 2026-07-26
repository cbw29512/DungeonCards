import type { CocRuleSourceRecord } from "../types/coc";

const PRIMARY_REVIEW = "DM Forge official-source audit · 2026-07-25";
const VERIFIED_AT = "2026-07-25";

export const cocSanityCampaignSources: CocRuleSourceRecord[] = [
  {
    id: "coc-sanity-lasting-effects",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Lasting effects after temporary insanity",
    sourceTitle: "The Call of Cthulhu RPG Wiki — Sanity",
    sourceUrl: "https://cthulhuwiki.chaosium.com/rules/sanity.html",
    chapterOrSection: "Temporary Insanity / Phobias, Manias, Backstory, and Delusions",
    implementationSummary: "Temporary insanity lasts 1D10 hours. Delusions end when that period ends, while altered backstory entries and phobias or manias gained during the episode remain on the investigator sheet. A reality check is a Sanity roll used to see through a delusion.",
    status: "verified",
    primaryReviewer: PRIMARY_REVIEW,
    verifiedAt: VERIFIED_AT,
    notes: [
      "The campaign tracker records user-entered effects; it does not copy or randomly reproduce closed tables.",
      "The trigger for indefinite insanity is deliberately not inferred from this record."
    ]
  },
  {
    id: "coc-psychoanalysis-recovery",
    system: "call-of-cthulhu",
    edition: "7e",
    ruleName: "Monthly Psychoanalysis and indefinite-insanity care",
    sourceTitle: "The Call of Cthulhu RPG Wiki — Occupation and Skills",
    sourceUrl: "https://cthulhuwiki.chaosium.com/investigators/step-three-occupation-and-skills.html",
    chapterOrSection: "Psychoanalysis",
    implementationSummary: "Once per game month, roll against the analyst's Psychoanalysis skill. Success restores 1D3 Sanity, failure restores none, and a fumble loses 1D6 Sanity and ends treatment by that analyst. Psychoanalysis alone does not shorten indefinite insanity, which requires 1D6 months of institutional or similar care.",
    status: "verified",
    primaryReviewer: PRIMARY_REVIEW,
    verifiedAt: VERIFIED_AT,
    notes: [
      "The tracker separates Sanity recovery from the care-duration clock.",
      "Whether indefinite insanity has begun must be determined from the user's owned rules source."
    ]
  }
];
