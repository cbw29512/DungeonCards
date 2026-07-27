import type { CocReferenceItem } from "../types/cocShell";

export const cocCombatRunSheet: CocReferenceItem[] = [
  {
    eyebrow: "Position",
    title: "Establish the battlefield",
    summary: "State distances, cover, exits, light, hazards, and who is exposed before dice are rolled.",
    steps: ["Place each participant in a clear zone or range band.", "Identify escape routes and objects that can change the fight.", "Restate positions whenever movement changes the options."]
  },
  {
    eyebrow: "Order",
    title: "Use DEX order",
    summary: "Combatants act from highest DEX to lowest; a readied firearm acts at DEX + 50.",
    steps: ["Give everyone one significant action.", "Track who has already Dodged or Fought Back this round.", "Reset outnumbering reactions at the start of the next round."]
  },
  {
    eyebrow: "Action",
    title: "Resolve one intent at a time",
    summary: "Connect every roll to a goal such as escape, disarm, restrain, protect, or injure.",
    steps: ["Name the acting skill and defender response.", "Apply Build, range, cover, and net Bonus or Penalty dice before rolling.", "Resolve damage, wounds, movement, and spent resources immediately."]
  },
  {
    eyebrow: "Consequences",
    title: "Keep wounds visible",
    summary: "Current HP, Major Wounds, consciousness, dying, and stabilization are separate facts.",
    steps: ["Apply each hit separately after armor.", "Mark a Major Wound when one blow reaches the threshold.", "Track First Aid, Medicine, and dying CON rolls beside HP."]
  },
  {
    eyebrow: "Pressure",
    title: "Make escape a real option",
    summary: "A horror fight should not automatically become a battle to the death.",
    steps: ["State what withdrawal requires.", "Show pursuit risks and possible cover.", "End detailed combat once the opposition is escaped, surrendered, disabled, or uncontested."]
  }
];
