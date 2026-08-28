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

const signedInteger = (value: string): number => Number(value.replace(/[−–—]/g, "-"));

export const parseSrdInitiativeBonus = (rawText: string): number | undefined => {
  const normalized = String(rawText || "")
    .replace(/\r/g, "")
    .replace(/[\t ]+/g, " ")
    .replace(/\n/g, " ")
    .trim();

  const labeledDex = normalized.match(/\bDEX\s+(\d+)\s+(?:\(([+\-−–—]?\d+)\)|([+\-−–—]\d+))/i);
  if (labeledDex) return signedInteger(labeledDex[2] ?? labeledDex[3]);

  const headerThenValues = normalized.match(
    /STR\s+DEX\s+CON\s+INT\s+WIS\s+CHA\s+\d+\s+\([+\-−–—]?\d+\)\s+\d+\s+\(([+\-−–—]?\d+)\)/i
  );
  if (headerThenValues) return signedInteger(headerThenValues[1]);

  const scoreOnly = normalized.match(/\bDEX\s+(\d+)\b/i);
  if (!scoreOnly) return undefined;
  return Math.floor((Number(scoreOnly[1]) - 10) / 2);
};
