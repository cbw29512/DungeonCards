export type SrdSpellScalingKind = "dice" | "count" | "flat";

export type SrdSpellScalingEffect = {
  kind: SrdSpellScalingKind;
  label: string;
  quantityPerSlot: number;
  totalQuantity: number;
  dieSides?: number;
  unit?: string;
  summary: string;
};

export type SrdSpellScalingResult = {
  status: "none" | "calculated" | "manual-review";
  effects: SrdSpellScalingEffect[];
  summary: string;
};
