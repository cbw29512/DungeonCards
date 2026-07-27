import type {
  CardDefinition,
  CardFamily,
  CardReview,
  CardSourceReference,
  CardVisibility,
  DndGameSystemId
} from "../types/cardPlatform";
import type { CardActionDefinition, CardResourceDefinition } from "../types/cardPlatformActions";
import type { DndCharacterSource } from "../types/dndCharacter";
import type { DndOptimizedBuildProfile } from "../types/dndCharacterVault";
import { gameSystemIdForRuleset } from "./cardPlatformGameSystem";

export const safeVaultCardId = (value: string): string => (
  value.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-|-$/g, "") || "entry"
);

export const vaultGameSystemId = (profile: DndOptimizedBuildProfile): DndGameSystemId => (
  gameSystemIdForRuleset(profile.ruleset)
);

export const vaultReview = (profile: DndOptimizedBuildProfile): CardReview => {
  if (profile.reviewStatus === "verified" && !profile.reviewedAt) {
    return { status: "rules-reviewed", notes: ["Verified build lacked a review date during card generation."] };
  }
  return {
    status: profile.reviewStatus,
    reviewedAt: profile.reviewedAt
  };
};

export const vaultSource = (
  profile: DndOptimizedBuildProfile,
  source?: DndCharacterSource
): CardSourceReference => {
  const selected = source ?? profile.character.sources[0];
  if (!selected) return {
    kind: "original",
    title: "DM Forge Character Vault build data",
    edition: profile.ruleset,
    publicDistributionAllowed: true
  };
  return {
    kind: selected.scope === "public-srd"
      ? "srd"
      : selected.scope === "user-owned"
        ? "user-owned-private"
        : "original",
    title: selected.label,
    url: selected.url,
    edition: profile.ruleset,
    license: selected.scope === "public-srd" ? "CC BY 4.0" : undefined,
    publicDistributionAllowed: selected.scope !== "user-owned"
  };
};

export const vaultVisibility = (source: CardSourceReference): CardVisibility => (
  source.kind === "user-owned-private" ? "private" : "player-safe"
);

export const buildVaultCard = (
  profile: DndOptimizedBuildProfile,
  input: {
    id: string;
    family: CardFamily;
    title: string;
    subtitle?: string;
    summary: string;
    detail?: string;
    tags: string[];
    actions?: CardActionDefinition[];
    resources?: CardResourceDefinition[];
    source?: DndCharacterSource;
    sourceReference?: CardSourceReference;
    visibility?: CardVisibility;
  }
): CardDefinition => {
  const source = input.sourceReference ?? vaultSource(profile, input.source);
  return {
    schemaVersion: 2,
    id: `vault:${vaultGameSystemId(profile)}:${safeVaultCardId(profile.id)}:${input.id}`,
    gameSystemId: vaultGameSystemId(profile),
    family: input.family,
    visibility: input.visibility ?? vaultVisibility(source),
    content: {
      title: input.title,
      subtitle: input.subtitle,
      summary: input.summary,
      detail: input.detail,
      tags: [...new Set(["character-vault", profile.classId, profile.subclassId, ...input.tags])]
    },
    source,
    review: vaultReview(profile),
    actions: input.actions ?? [],
    resources: input.resources ?? [],
    linkedCardIds: [],
    print: { format: "standard-card", sizeId: "poker-2.5x3.5", faces: "front-back" }
  };
};
