import type { DndContainerDefinition } from "../data/dndContainersPacks";
import type { RulesetId } from "../types/ruleCards";

export type DndContainerPlan = {
  quantity: number;
  emptyWeightPounds: number;
  contentsWeightPounds: number;
  totalWeightPounds: number;
  totalCostCp: number;
  totalWeightCapacityPounds?: number;
  remainingWeightCapacityPounds?: number;
  overWeightCapacity: boolean;
};

const normalizeQuantity = (value: number): number => Math.min(100, Math.max(1, Math.trunc(value) || 1));
const normalizeWeight = (value: number): number => Math.max(0, Number.isFinite(value) ? value : 0);

export const formatDndCoinPrice = (copperPieces: number): string => {
  const copper = Math.max(0, Math.trunc(copperPieces) || 0);
  if (copper >= 100 && copper % 100 === 0) return `${(copper / 100).toLocaleString("en-US")} GP`;
  if (copper >= 10 && copper % 10 === 0) return `${(copper / 10).toLocaleString("en-US")} SP`;
  return `${copper.toLocaleString("en-US")} CP`;
};

export const calculateDndContainerPlan = ({
  container,
  ruleset,
  quantity,
  contentsWeightPounds
}: {
  container: DndContainerDefinition;
  ruleset: RulesetId;
  quantity: number;
  contentsWeightPounds: number;
}): DndContainerPlan => {
  const count = normalizeQuantity(quantity);
  const contentsWeight = normalizeWeight(contentsWeightPounds);
  const emptyWeightPounds = (container.emptyWeightPounds ?? 0) * count;
  const perContainerCapacity = container.weightCapacityPounds[ruleset];
  const totalWeightCapacityPounds = perContainerCapacity === undefined
    ? undefined
    : perContainerCapacity * count;
  const remainingWeightCapacityPounds = totalWeightCapacityPounds === undefined
    ? undefined
    : Math.max(0, totalWeightCapacityPounds - contentsWeight);

  return {
    quantity: count,
    emptyWeightPounds,
    contentsWeightPounds: contentsWeight,
    totalWeightPounds: emptyWeightPounds + contentsWeight,
    totalCostCp: container.costCp * count,
    totalWeightCapacityPounds,
    remainingWeightCapacityPounds,
    overWeightCapacity: totalWeightCapacityPounds !== undefined && contentsWeight > totalWeightCapacityPounds
  };
};
