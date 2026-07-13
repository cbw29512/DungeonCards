import type { RuleTableEntry } from "../types/ruleCards";

export const wandOfWonderTable: RuleTableEntry[] = [
  { min: 1, max: 20, result: "Cast a random spell: roll 1d10—1–2 Darkness, 3–4 Faerie Fire, 5–6 Fireball, 7–8 Slow, 9–10 Stinking Cloud." },
  { min: 21, max: 25, result: "You are Stunned until the start of your next turn, believing something awesome happened." },
  { min: 26, max: 30, result: "Cast Gust of Wind in a line from you to the chosen point." },
  { min: 31, max: 35, result: "You take 1d6 Psychic damage." },
  { min: 36, max: 40, result: "Heavy rain fills a 120-foot-high, 60-foot-radius Cylinder for 1 minute; the area is Lightly Obscured." },
  { min: 41, max: 45, result: "Six hundred oversized butterflies fill a 60-foot-high, 30-foot-radius Cylinder for 10 minutes; the area is Heavily Obscured." },
  { min: 46, max: 50, result: "Cast Lightning Bolt in a line from you to the chosen point." },
  { min: 51, max: 55, result: "The nearest creature is enlarged as by Enlarge/Reduce; if invalid, you are enlarged instead." },
  { min: 56, max: 60, result: "A creature appears for 1 hour: roll 1d4—1 Rhinoceros, 2 Elephant, 3–4 Rat." },
  { min: 61, max: 64, result: "Grass covers a 60-foot-radius circle and grows to ten times normal size for 1 minute." },
  { min: 65, max: 68, result: "The GM chooses an unattended object within 120 feet, no larger than 10 feet, to vanish into the Ethereal Plane." },
  { min: 69, max: 72, result: "You shrink as by Enlarge/Reduce for 1 minute." },
  { min: 73, max: 77, result: "Leaves grow from the nearest creature and fall off after 24 hours unless removed." },
  { min: 78, max: 82, result: "Colorful light fills a 30-foot Emanation; creatures make DC 15 Constitution saves or are Blinded for 1 minute, repeating each turn." },
  { min: 83, max: 87, result: "Cast Invisibility on yourself." },
  { min: 88, max: 92, result: "A stream of 1d4 × 10 one-GP gems shoots in a 30-foot line; each gem deals 1 Bludgeoning damage divided among creatures in the line." },
  { min: 93, max: 97, result: "Cast Polymorph on the nearest creature: roll 1d4—1 Black Bear, 2 Giant Wasp, 3–4 Frog." },
  { min: 98, max: 100, result: "Nearest creature makes DC 15 Constitution saves against progressive Restrained then Petrified conditions." }
];