import type { CardDefinition } from "../types/cardPlatform";
import type { DndOptimizedBuildProfile } from "../types/dndCharacterVault";
import { buildVaultCard, safeVaultCardId } from "./dndCharacterCardShared";

const parseFeature = (value: string): { title: string; detail?: string } => {
  const separator = value.includes(" — ") ? " — " : value.includes(": ") ? ": " : undefined;
  if (!separator) return { title: value.trim() };
  const [title, ...detail] = value.split(separator);
  return { title: title.trim(), detail: detail.join(separator).trim() || undefined };
};

const namedFeatureCards = (
  profile: DndOptimizedBuildProfile,
  values: string[],
  category: "class-feature" | "subclass-feature"
): CardDefinition[] => values.map((value, index) => {
  const parsed = parseFeature(value);
  return buildVaultCard(profile, {
    id: `feature:${category}:${index}-${safeVaultCardId(parsed.title)}`,
    family: "character-action",
    title: parsed.title,
    subtitle: category === "class-feature" ? profile.character.className : profile.character.subclassName,
    summary: parsed.detail ?? `${parsed.title} is available to this ${profile.character.className} build.`,
    tags: ["feature", category],
    actions: [{
      id: "use-feature",
      kind: "procedure",
      label: `Use ${parsed.title}`,
      steps: [parsed.detail ?? `Apply ${parsed.title} according to the exact-edition source rules.`]
    }]
  });
});

export const generateDndFeatureCards = (
  profile: DndOptimizedBuildProfile
): CardDefinition[] => [
  ...namedFeatureCards(profile, profile.character.classFeatures, "class-feature"),
  ...namedFeatureCards(profile, profile.character.subclassFeatures, "subclass-feature"),
  ...profile.advancementChoices.map((choice, index) => buildVaultCard(profile, {
    id: `feature:advancement:${index}-${safeVaultCardId(choice.id)}`,
    family: "character-action",
    title: choice.name,
    subtitle: `Level ${choice.gainedAtLevel} ${choice.kind.replaceAll("-", " ")}`,
    summary: choice.synergyNote,
    detail: choice.prerequisiteNote,
    tags: ["feature", "advancement", choice.kind, `level-${choice.gainedAtLevel}`],
    actions: [{
      id: "apply-feature",
      kind: "procedure",
      label: `Apply ${choice.name}`,
      steps: [
        choice.synergyNote,
        ...(choice.prerequisiteNote ? [`Prerequisite: ${choice.prerequisiteNote}`] : [])
      ]
    }],
    source: choice.source
  })),
  buildVaultCard(profile, {
    id: "feature:tactics",
    family: "character-action",
    title: `${profile.character.name} Tactics`,
    subtitle: `${profile.role} · ${profile.complexity}`,
    summary: profile.buildGoal,
    detail: profile.optimizationNotes.join(" "),
    tags: ["feature", "tactics", profile.role, profile.complexity],
    actions: [{
      id: "tactics",
      kind: "procedure",
      label: "Run the build plan",
      steps: profile.tactics.length > 0 ? profile.tactics : [profile.buildGoal]
    }]
  })
];