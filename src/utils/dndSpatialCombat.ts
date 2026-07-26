export type DndCreatureSize = "Tiny" | "Small" | "Medium" | "Large" | "Huge" | "Gargantuan";

export type DndGridPosition = {
  x: number;
  y: number;
  size: DndCreatureSize;
};

export type DndActionDistanceRule = {
  kind: "melee" | "ranged";
  normalFeet: number;
  longFeet?: number;
};

export type DndActionDistanceStatus =
  | "melee-reach"
  | "normal-range"
  | "long-range"
  | "out-of-range"
  | "manual-review";

export type DndActionDistanceResult = {
  status: DndActionDistanceStatus;
  distanceFeet: number;
  rule?: DndActionDistanceRule;
  summary: string;
};

const whole = (value: number): number => Math.trunc(Number.isFinite(value) ? value : 0);

export const dndCreatureSpaceSquares = (size: DndCreatureSize): number => {
  if (size === "Large") return 2;
  if (size === "Huge") return 3;
  if (size === "Gargantuan") return 4;
  return 1;
};

export const normalizeDndGridPosition = (position: DndGridPosition): DndGridPosition => ({
  x: whole(position.x),
  y: whole(position.y),
  size: position.size
});

const bounds = (input: DndGridPosition) => {
  const position = normalizeDndGridPosition(input);
  const space = dndCreatureSpaceSquares(position.size);
  return {
    left: position.x,
    right: position.x + space - 1,
    top: position.y,
    bottom: position.y + space - 1
  };
};

const axisGap = (firstStart: number, firstEnd: number, secondStart: number, secondEnd: number): number => {
  if (firstEnd < secondStart) return secondStart - firstEnd;
  if (secondEnd < firstStart) return firstStart - secondEnd;
  return 0;
};

export const calculateDndGridDistanceFeet = (
  first: DndGridPosition,
  second: DndGridPosition
): number => {
  const a = bounds(first);
  const b = bounds(second);
  const horizontal = axisGap(a.left, a.right, b.left, b.right);
  const vertical = axisGap(a.top, a.bottom, b.top, b.bottom);
  return Math.max(horizontal, vertical) * 5;
};

export const calculateDndGridMovementFeet = (
  from: DndGridPosition,
  to: DndGridPosition
): number => {
  const start = normalizeDndGridPosition(from);
  const end = normalizeDndGridPosition(to);
  return Math.max(Math.abs(end.x - start.x), Math.abs(end.y - start.y)) * 5;
};

export const doDndCreatureSpacesOverlap = (
  first: DndGridPosition,
  second: DndGridPosition
): boolean => {
  const a = bounds(first);
  const b = bounds(second);
  return a.left <= b.right && a.right >= b.left && a.top <= b.bottom && a.bottom >= b.top;
};

export const parseDndActionDistanceRule = (
  reachOrRange?: string
): DndActionDistanceRule | undefined => {
  if (!reachOrRange) return undefined;
  const normalized = reachOrRange.replace(/[−–—]/g, "-");
  const reach = normalized.match(/\breach\s+(\d+)\s*ft\.?/i);
  if (reach) return { kind: "melee", normalFeet: Number(reach[1]) };

  const range = normalized.match(/\brange\s+(\d+)(?:\s*\/\s*(\d+))?\s*ft\.?/i);
  if (!range) return undefined;
  return {
    kind: "ranged",
    normalFeet: Number(range[1]),
    longFeet: range[2] ? Number(range[2]) : undefined
  };
};

export const validateDndActionDistance = (
  distanceFeet: number,
  reachOrRange?: string
): DndActionDistanceResult => {
  const distance = Math.max(0, whole(distanceFeet));
  const rule = parseDndActionDistanceRule(reachOrRange);
  if (!rule) {
    return {
      status: "manual-review",
      distanceFeet: distance,
      summary: "This action has no parsed reach or range. Review its sourced text and area shape manually."
    };
  }

  if (rule.kind === "melee") {
    const valid = distance <= rule.normalFeet;
    return {
      status: valid ? "melee-reach" : "out-of-range",
      distanceFeet: distance,
      rule,
      summary: valid
        ? `Target is within the action's ${rule.normalFeet}-foot reach.`
        : `Target is ${distance} feet away, beyond the action's ${rule.normalFeet}-foot reach.`
    };
  }

  if (distance <= rule.normalFeet) {
    return {
      status: "normal-range",
      distanceFeet: distance,
      rule,
      summary: `Target is within normal range (${rule.normalFeet} feet).`
    };
  }

  if (rule.longFeet !== undefined && distance <= rule.longFeet) {
    return {
      status: "long-range",
      distanceFeet: distance,
      rule,
      summary: `Target is beyond normal range but within long range (${rule.longFeet} feet); the attack roll has Disadvantage.`
    };
  }

  const maximum = rule.longFeet ?? rule.normalFeet;
  return {
    status: "out-of-range",
    distanceFeet: distance,
    rule,
    summary: `Target is ${distance} feet away, beyond the action's ${maximum}-foot maximum range.`
  };
};