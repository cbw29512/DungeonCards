const experienceParenthetical = /\s*\([^)]*(?:\bXP\b|experience)[^)]*\)/gi;

export const formatMonsterChallengeRating = (value: string): string => {
  const cleaned = value
    .replace(/^\s*(?:CR|Challenge(?: Rating)?)\s*/i, "")
    .replace(experienceParenthetical, "")
    .replace(/\s+(?:XP|experience)\b.*$/i, "")
    .trim();

  return cleaned || "—";
};

export const stripMonsterExperienceText = (value: string): string => value
  .replace(experienceParenthetical, "")
  .replace(/\b((?:CR|Challenge(?: Rating)?)\s+[^\n]+?)\s+(?:XP|experience)\b[^\n]*/gi, "$1")
  .replace(/[ \t]+\n/g, "\n")
  .replace(/[ \t]{2,}/g, " ")
  .trim();
