import type {
  RuleCard,
  RuleCardKind,
  RuleCardVariant,
  RuleRollMode,
  RuleRollPart,
  RulesetId
} from "../types/ruleCards";

const QUICK_ROLL_EXCLUSIONS = new Set(["scorching-ray", "eldritch-blast"]);

const withoutId = ({ id: _id, ...part }: RuleRollMode): RuleRollPart => part;

const cloneVariant = (
  variant: RuleCardVariant,
  modes: RuleRollMode[],
  tag: string,
  detailPrefix?: string
): RuleCardVariant => ({
  ...variant,
  detail: detailPrefix ? `${detailPrefix} ${variant.detail}` : variant.detail,
  tags: [...new Set([...variant.tags, tag])],
  modes
});

const buildVariantMap = (
  card: RuleCard,
  selectModes: (variant: RuleCardVariant) => RuleRollMode[]
): Partial<Record<RulesetId, RuleCardVariant>> => {
  const entries = Object.entries(card.variants).flatMap(([ruleset, variant]) => {
    if (!variant) return [];
    const modes = selectModes(variant);
    return modes.length > 0
      ? [[ruleset, cloneVariant(variant, modes, "split-card")]]
      : [];
  });

  return Object.fromEntries(entries);
};

const effectKind = (card: RuleCard): RuleCardKind => {
  const modes = Object.values(card.variants).flatMap((variant) => variant?.modes ?? []);
  if (modes.length > 0 && modes.every((mode) => mode.kind === "healing")) return "spell-healing";
  if (modes.some((mode) => mode.kind === "damage")) return "spell-damage";
  return "spell";
};

const effectName = (card: RuleCard, kind: RuleCardKind): string => {
  if (kind === "spell-healing") return `${card.name} Healing`;
  if (kind === "spell-damage") return `${card.name} Damage`;
  return card.name;
};

const buildQuickVariants = (card: RuleCard): Partial<Record<RulesetId, RuleCardVariant>> => {
  if (QUICK_ROLL_EXCLUSIONS.has(card.id)) return {};

  const entries = Object.entries(card.variants).flatMap(([ruleset, variant]) => {
    if (!variant) return [];
    const attack = variant.modes.find((mode) => mode.kind === "attack");
    const damage = variant.modes.find((mode) => mode.kind === "damage");
    if (!attack || !damage) return [];

    const quickMode: RuleRollMode = {
      ...attack,
      id: "quick-roll",
      label: "Attack + Potential Damage",
      secondaryRoll: withoutId(damage)
    };
    const quickVariant = cloneVariant(
      variant,
      [quickMode],
      "quick",
      "Quick Roll shows attack and potential damage separately; apply damage only on a hit."
    );
    return [[ruleset, quickVariant]];
  });

  return Object.fromEntries(entries);
};

export const splitSpellCards = (cards: RuleCard[]): RuleCard[] => cards.flatMap((card) => {
  const effectVariants = buildVariantMap(
    card,
    (variant) => variant.modes.filter((mode) => mode.kind !== "attack")
  );
  const attackVariants = buildVariantMap(
    card,
    (variant) => variant.modes.filter((mode) => mode.kind === "attack")
  );
  const quickVariants = buildQuickVariants(card);
  const kind = effectKind({ ...card, variants: effectVariants });
  const split: RuleCard[] = [];

  if (Object.keys(effectVariants).length > 0) {
    split.push({
      ...card,
      name: effectName(card, kind),
      kind,
      variants: effectVariants
    });
  }

  if (Object.keys(attackVariants).length > 0) {
    split.push({
      id: `${card.id}-attack`,
      name: `${card.name} Attack`,
      kind: "attack",
      imageEmoji: "🎯",
      variants: attackVariants
    });
  }

  if (Object.keys(quickVariants).length > 0) {
    split.push({
      id: `${card.id}-quick`,
      name: `${card.name} Quick Roll`,
      kind: "quick-roll",
      imageEmoji: card.imageEmoji,
      variants: quickVariants
    });
  }

  return split;
});