import { dndPregenClassDefinitions } from "../data/dndPregenCatalog";
import { dndVaultReadyBuilds } from "../data/dndVaultReadyBuilds";
import { srdMonsters } from "../data/srdCompendium";
import type { DndOptimizedBuildProfile } from "../types/dndCharacterVault";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import type { SrdMonsterRecord } from "../types/srdCompendium";
import { getFightBattleProfileIssue } from "./fightBattleValidation";
import { buildCharacterFightProfile, buildSrdMonsterFightProfile } from "./fightProfileAdapters";
import { validateDndOptimizedBuild } from "./dndCharacterVaultValidation";

export const FIGHT_2024_RULESET = "srd-5.2.1-2024" as const;
export const FIGHT_2024_EXPECTED_CLASS_COUNT = 12;
export const FIGHT_2024_EXPECTED_LEVELS_PER_CLASS = 20;
export const FIGHT_2024_EXPECTED_HERO_COUNT = FIGHT_2024_EXPECTED_CLASS_COUNT * FIGHT_2024_EXPECTED_LEVELS_PER_CLASS;
export const FIGHT_2024_EXPECTED_MONSTER_COUNT = 328;

export type Fight2024MonsterSection =
  | "traits"
  | "actions"
  | "bonusActions"
  | "reactions"
  | "legendaryActions";

export type Fight2024CertificationIssue = {
  subjectType: "hero" | "monster";
  subjectId: string;
  subjectName: string;
  category:
    | "missing-build"
    | "invalid-build"
    | "unexecutable-profile"
    | "unparsed-source-section"
    | "unmodeled-source-mechanic";
  detail: string;
  sourceSection?: Fight2024MonsterSection;
};

export type Fight2024CertificationReport = {
  ruleset: typeof FIGHT_2024_RULESET;
  heroTarget: number;
  heroBuildCount: number;
  heroExecutableCount: number;
  heroIssues: Fight2024CertificationIssue[];
  monsterTarget: number;
  monsterSourceCount: number;
  monsterExecutableCount: number;
  monsterFullyModeledCount: number;
  monsterIssues: Fight2024CertificationIssue[];
  complete: boolean;
};

type NamedMechanic = { name: string; description: string };

const normalizeMechanicName = (value: string): string => value
  .toLowerCase()
  .replace(/\s*\([^)]*recharge[^)]*\)/gi, "")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

export const extractFight2024NamedMechanics = (text: string): NamedMechanic[] => {
  const normalized = String(text || "")
    .replace(/\r/g, "")
    .replace(/[\t ]+/g, " ")
    .trim();
  if (!normalized) return [];

  const pattern = /(?:^|\n|(?<=\.\s))([A-Z][A-Za-z0-9'’/&,+\- ]{1,90}(?:\s*\([^\n)]*\))?)\.\s+(?=(?:Melee|Ranged|The\b|Each\b|One\b|Up to\b|A\b|An\b|If\b|When\b|While\b|Roll\b|Make\b|Choose\b|On\b|At\b|As\b|Until\b|After\b|Before\b|Immediately\b))/g;
  const matches = [...normalized.matchAll(pattern)];
  return matches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = index + 1 < matches.length
      ? matches[index + 1].index ?? normalized.length
      : normalized.length;
    return {
      name: match[1].trim(),
      description: normalized.slice(start, end).trim()
    };
  });
};

const heroIssue = (
  profile: DndOptimizedBuildProfile | undefined,
  className: string,
  subclassName: string,
  level: number,
  category: Fight2024CertificationIssue["category"],
  detail: string
): Fight2024CertificationIssue => ({
  subjectType: "hero",
  subjectId: profile?.id ?? `${FIGHT_2024_RULESET}:${className}:${subclassName}:${level}`,
  subjectName: profile?.character.name ?? `${className} ${level} (${subclassName})`,
  category,
  detail
});

const auditHero = (
  profile: DndOptimizedBuildProfile | undefined,
  className: string,
  subclassName: string,
  level: number
): { executable: boolean; issues: Fight2024CertificationIssue[] } => {
  if (!profile) {
    return {
      executable: false,
      issues: [heroIssue(undefined, className, subclassName, level, "missing-build", `Missing reviewed ${className} level ${level} / ${subclassName} pregen.`)]
    };
  }

  const validationIssues = validateDndOptimizedBuild(profile);
  if (validationIssues.length) {
    return {
      executable: false,
      issues: validationIssues.map((detail) => heroIssue(profile, className, subclassName, level, "invalid-build", detail))
    };
  }

  const result = buildCharacterFightProfile(profile.character);
  if (!result.ok) {
    return {
      executable: false,
      issues: result.issues.map((detail) => heroIssue(profile, className, subclassName, level, "unexecutable-profile", detail))
    };
  }

  const issue = getFightBattleProfileIssue(result.profile);
  return issue
    ? { executable: false, issues: [heroIssue(profile, className, subclassName, level, "unexecutable-profile", issue)] }
    : { executable: true, issues: [] };
};

const monsterIssue = (
  monster: SrdMonsterRecord,
  category: Fight2024CertificationIssue["category"],
  detail: string,
  sourceSection?: Fight2024MonsterSection
): Fight2024CertificationIssue => ({
  subjectType: "monster",
  subjectId: monster.id,
  subjectName: monster.name,
  category,
  detail,
  sourceSection
});

const actionEconomyMatches = (
  profile: FightCombatantProfile,
  mechanicName: string,
  economy: "action" | "bonus-action" | "reaction"
): boolean => {
  const target = normalizeMechanicName(mechanicName);
  return Boolean(profile.actions?.some((action) => (
    action.economy === economy && normalizeMechanicName(action.name) === target
  )));
};

const auditSourceSection = (
  monster: SrdMonsterRecord,
  profile: FightCombatantProfile,
  section: Fight2024MonsterSection,
  text: string
): Fight2024CertificationIssue[] => {
  if (!text.trim()) return [];
  const mechanics = extractFight2024NamedMechanics(text);
  if (!mechanics.length) {
    return [monsterIssue(
      monster,
      "unparsed-source-section",
      `${monster.name} has non-empty ${section} source text that did not split into named mechanics.`,
      section
    )];
  }

  if (section === "traits" || section === "legendaryActions") {
    return mechanics.map((mechanic) => monsterIssue(
      monster,
      "unmodeled-source-mechanic",
      `${mechanic.name} is present in the SRD source but is not yet certified as an executable ${section} mechanic.`,
      section
    ));
  }

  const economy = section === "actions" ? "action" : section === "bonusActions" ? "bonus-action" : "reaction";
  return mechanics.flatMap((mechanic) => actionEconomyMatches(profile, mechanic.name, economy)
    ? []
    : [monsterIssue(
        monster,
        "unmodeled-source-mechanic",
        `${mechanic.name} is present in ${section} but has no matching executable ${economy} Fight action.`,
        section
      )]);
};

const auditMonster = (monster: SrdMonsterRecord): {
  executable: boolean;
  fullyModeled: boolean;
  issues: Fight2024CertificationIssue[];
} => {
  const result = buildSrdMonsterFightProfile(monster);
  if (!result.ok) {
    const issues = result.issues.map((detail) => monsterIssue(monster, "unexecutable-profile", detail));
    return { executable: false, fullyModeled: false, issues };
  }

  const battleIssue = getFightBattleProfileIssue(result.profile);
  const executionIssues = battleIssue
    ? [monsterIssue(monster, "unexecutable-profile", battleIssue)]
    : [];
  const sourceIssues = [
    ...auditSourceSection(monster, result.profile, "traits", monster.traits),
    ...auditSourceSection(monster, result.profile, "actions", monster.actions),
    ...auditSourceSection(monster, result.profile, "bonusActions", monster.bonusActions),
    ...auditSourceSection(monster, result.profile, "reactions", monster.reactions),
    ...auditSourceSection(monster, result.profile, "legendaryActions", monster.legendaryActions)
  ];
  const issues = [...executionIssues, ...sourceIssues];
  return {
    executable: !battleIssue,
    fullyModeled: issues.length === 0,
    issues
  };
};

export const buildFight2024CertificationReport = (): Fight2024CertificationReport => {
  const classDefinitions = dndPregenClassDefinitions.filter((definition) => definition.ruleset === FIGHT_2024_RULESET);
  const profiles = dndVaultReadyBuilds.filter((profile) => profile.ruleset === FIGHT_2024_RULESET);
  const heroIssues: Fight2024CertificationIssue[] = [];
  let heroExecutableCount = 0;

  for (const definition of classDefinitions) {
    for (let level = 1; level <= FIGHT_2024_EXPECTED_LEVELS_PER_CLASS; level += 1) {
      const profile = profiles.find((candidate) => (
        candidate.classId === definition.classId
        && candidate.subclassId === definition.subclassId
        && candidate.level === level
      ));
      const audit = auditHero(profile, definition.className, definition.subclassName, level);
      if (audit.executable) heroExecutableCount += 1;
      heroIssues.push(...audit.issues);
    }
  }

  const monsters = srdMonsters.filter((monster) => monster.edition === FIGHT_2024_RULESET);
  const monsterIssues: Fight2024CertificationIssue[] = [];
  let monsterExecutableCount = 0;
  let monsterFullyModeledCount = 0;
  for (const monster of monsters) {
    const audit = auditMonster(monster);
    if (audit.executable) monsterExecutableCount += 1;
    if (audit.fullyModeled) monsterFullyModeledCount += 1;
    monsterIssues.push(...audit.issues);
  }

  const complete = classDefinitions.length === FIGHT_2024_EXPECTED_CLASS_COUNT
    && profiles.length === FIGHT_2024_EXPECTED_HERO_COUNT
    && heroExecutableCount === FIGHT_2024_EXPECTED_HERO_COUNT
    && monsters.length === FIGHT_2024_EXPECTED_MONSTER_COUNT
    && monsterFullyModeledCount === FIGHT_2024_EXPECTED_MONSTER_COUNT
    && heroIssues.length === 0
    && monsterIssues.length === 0;

  return {
    ruleset: FIGHT_2024_RULESET,
    heroTarget: FIGHT_2024_EXPECTED_HERO_COUNT,
    heroBuildCount: profiles.length,
    heroExecutableCount,
    heroIssues,
    monsterTarget: FIGHT_2024_EXPECTED_MONSTER_COUNT,
    monsterSourceCount: monsters.length,
    monsterExecutableCount,
    monsterFullyModeledCount,
    monsterIssues,
    complete
  };
};

export const assertFight2024CertificationComplete = (report = buildFight2024CertificationReport()): void => {
  if (report.complete) return;
  throw new Error(
    `5.5e Fight certification incomplete: heroes ${report.heroExecutableCount}/${report.heroTarget} executable; monsters ${report.monsterFullyModeledCount}/${report.monsterTarget} fully modeled.`
  );
};
