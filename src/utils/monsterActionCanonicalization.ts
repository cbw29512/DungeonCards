export type MonsterActionLike = {
  name: string;
  summary?: string;
  reachOrRange?: string;
};

const normalizeWords = (value: string): string => value
  .normalize("NFKC")
  .toLocaleLowerCase("en-US")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

const canonicalActionName = (value: string): string => normalizeWords(
  value.replace(/\(\s*Recharge[^)]*\)/gi, " ")
);

const multiattackReferenceName = (value: string): string => normalizeWords(
  value.replace(/\([^)]*\)/g, " ")
);

export const canonicalMonsterActionIdentity = (action: MonsterActionLike): string => [
  canonicalActionName(action.name),
  normalizeWords(action.summary ?? ""),
  normalizeWords(action.reachOrRange ?? "")
].join("|");

export const reconcileMonsterActions = <T extends MonsterActionLike>(
  actions: T[],
  preferReplacement?: (candidate: T, existing: T) => boolean
): T[] => {
  const unique: T[] = [];
  const positions = new Map<string, number>();

  actions.forEach((action) => {
    const identity = canonicalMonsterActionIdentity(action);
    const existingIndex = positions.get(identity);
    if (existingIndex === undefined) {
      positions.set(identity, unique.length);
      unique.push(action);
      return;
    }

    const existing = unique[existingIndex];
    if (preferReplacement?.(action, existing)) unique[existingIndex] = action;
  });

  return unique;
};

export const uniqueMonsterActions = <T extends MonsterActionLike>(actions: T[]): T[] => (
  reconcileMonsterActions(actions)
);

const quickActionScore = (action: MonsterActionLike): number => {
  const summary = action.summary ?? "";
  return (summary.includes("to hit") ? 3 : 0)
    + (summary.includes("saving throw") ? 2 : 0)
    + (/Recharge/i.test(action.name) ? 1 : 0);
};

const multiattackReferences = (multiattack: MonsterActionLike, action: MonsterActionLike): boolean => {
  const referencedName = multiattackReferenceName(action.name);
  if (!referencedName || referencedName === "multiattack") return false;
  const summary = ` ${normalizeWords(multiattack.summary ?? "")} `;
  return summary.includes(` ${referencedName} `);
};

export const selectQuickMonsterActions = <T extends MonsterActionLike>(
  actions: T[],
  limit = 3
): T[] => {
  const maximum = Math.max(0, Math.trunc(limit));
  if (maximum === 0) return [];

  const candidates = uniqueMonsterActions(actions);
  const selected: T[] = [];
  const selectedIdentities = new Set<string>();
  const add = (action: T) => {
    if (selected.length >= maximum) return;
    const identity = canonicalMonsterActionIdentity(action);
    if (selectedIdentities.has(identity)) return;
    selectedIdentities.add(identity);
    selected.push(action);
  };

  const multiattacks = candidates.filter((action) => canonicalActionName(action.name) === "multiattack");
  multiattacks.forEach(add);
  multiattacks.forEach((multiattack) => {
    candidates
      .filter((action) => action !== multiattack && multiattackReferences(multiattack, action))
      .forEach(add);
  });

  [...candidates]
    .sort((left, right) => quickActionScore(right) - quickActionScore(left))
    .forEach(add);

  return selected;
};
