import { parseDiceFormula } from "./diceParser";

export const buildCriticalBonusFormula = (formula: string): string | null => {
  try {
    const parsed = parseDiceFormula(formula);
    if (!parsed.diceTerms.length) return null;
    return parsed.diceTerms.map((term, index) => {
      const sign = term.sign < 0 ? "-" : index === 0 ? "" : "+";
      const keep = term.keep ? `k${term.keep.kind === "highest" ? "h" : "l"}${term.keep.count}` : "";
      return `${sign}${term.count}d${term.sides}${keep}`;
    }).join("");
  } catch {
    return null;
  }
};

export const parseSrdInitiativeBonus = (rawText: string): number | undefined => {
  const modifier = rawText.match(/\bDEX\s+\d+\s*\(\s*([+-]\d+)\s*\)/i);
  if (modifier) return Number(modifier[1]);

  const score = rawText.match(/\bDEX\s+(\d+)\b/i);
  if (!score) return undefined;
  return Math.floor((Number(score[1]) - 10) / 2);
};
