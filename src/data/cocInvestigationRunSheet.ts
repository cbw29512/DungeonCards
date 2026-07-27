import type { CocReferenceItem } from "../types/cocShell";

export const cocInvestigationRunSheet: CocReferenceItem[] = [
  {
    eyebrow: "1 · Frame",
    title: "Open with a question",
    summary: "Every scene should create a mystery, decision, or approaching danger.",
    steps: ["State where the investigators are and what is immediately wrong.", "Name visible people, exits, evidence, and time pressure.", "Ask what they do before requesting a roll."]
  },
  {
    eyebrow: "2 · Examine",
    title: "Give the essential lead",
    summary: "Do not hide the entire scenario behind one die roll.",
    steps: ["Give essential information when they search or question the correct target.", "Roll for speed, extra context, secrecy, or safety.", "On failure, provide the lead with a cost or complication."]
  },
  {
    eyebrow: "3 · Connect",
    title: "Turn clues into choices",
    summary: "A clue matters when it points somewhere, changes a belief, or creates a decision.",
    steps: ["Restate the new fact in plain language.", "Show which previous clue it supports or contradicts.", "Offer at least two plausible next actions whenever possible."]
  },
  {
    eyebrow: "4 · Escalate",
    title: "Advance the opposition",
    summary: "Time moves even when the investigators hesitate.",
    steps: ["Advance a deadline, pursuit, ritual, injury, suspicion, or disappearing witness.", "Let noisy failures reveal the investigators to the threat.", "Escalate consequences without erasing earlier success."]
  },
  {
    eyebrow: "5 · Confront",
    title: "Clarify the stakes",
    summary: "Before a dangerous roll, everyone should understand what can change.",
    steps: ["State the immediate objective.", "Describe the danger, escape route, and collateral risk.", "Resolve only the uncertain part; do not reroll established facts."]
  },
  {
    eyebrow: "6 · Close",
    title: "Leave a usable record",
    summary: "End with a clean handoff to the next scene.",
    steps: ["List confirmed facts and unresolved questions.", "Name active leads, threats, injuries, and deadlines.", "Update evidence, attitudes, SAN, HP, MP, ammunition, and checked skills."]
  }
];
