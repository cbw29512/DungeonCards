import {
  resolveDndMonsterRecharge,
  type DndMonsterLiveReference
} from "./dndMonsterLiveReference";

export type DndMonsterReferenceMap = Record<string, DndMonsterLiveReference>;

export const resolveDndMonsterRechargeInReferences = (
  references: DndMonsterReferenceMap,
  combatantId: string,
  actionId: string,
  roll: number
): DndMonsterReferenceMap => {
  const reference = references[combatantId];
  if (!reference) return references;
  const resolution = resolveDndMonsterRecharge(reference, actionId, roll);
  if (resolution.reference === reference) return references;
  return {
    ...references,
    [combatantId]: resolution.reference
  };
};