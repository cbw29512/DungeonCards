import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import {
  spendDndTurnResource,
  type DndCombatant,
  type DndEncounterState
} from "../utils/dndEncounter";
import {
  resolveDndMonsterRecharge,
  spendDndMonsterLiveAction,
  type DndMonsterActionKind,
  type DndMonsterLiveReference
} from "../utils/dndMonsterLiveReference";
import { resolveDndMonsterRechargeInReferences } from "../utils/dndMonsterLiveReferenceState";
import { secureRandomInteger } from "../utils/randomInteger";
import "../styles/dnd-monster-live-reference.css";

type Props = {
  encounter: DndEncounterState;
  setEncounter: Dispatch<SetStateAction<DndEncounterState>>;
  references: Record<string, DndMonsterLiveReference>;
  setReferences: Dispatch<SetStateAction<Record<string, DndMonsterLiveReference>>>;
};

const kindLabels: Record<DndMonsterActionKind, string> = {
  action: "Actions",
  bonusAction: "Bonus Actions",
  reaction: "Reactions",
  legendaryAction: "Legendary Actions"
};

const resourceForKind = (kind: DndMonsterActionKind) => {
  if (kind === "action") return "action" as const;
  if (kind === "bonusAction") return "bonusAction" as const;
  if (kind === "reaction") return "reaction" as const;
  return undefined;
};

const canUseAction = (
  encounter: DndEncounterState,
  combatant: DndCombatant,
  kind: DndMonsterActionKind,
  rechargeReady: boolean
): boolean => {
  if (combatant.health.lifeState !== "conscious" || !rechargeReady) return false;
  const isActive = encounter.started && encounter.combatants[encounter.currentIndex]?.id === combatant.id;
  if (kind === "action") return isActive && combatant.actionAvailable;
  if (kind === "bonusAction") return isActive && combatant.bonusActionAvailable;
  if (kind === "reaction") return combatant.reactionAvailable;
  return true;
};

export const DndMonsterLiveReferencePanel = ({
  encounter,
  setEncounter,
  references,
  setReferences
}: Props) => {
  const combatants = useMemo(
    () => encounter.combatants.filter((combatant) => references[combatant.id]),
    [encounter.combatants, references]
  );
  const [combatantId, setCombatantId] = useState(combatants[0]?.id ?? "");
  const [result, setResult] = useState("");

  useEffect(() => {
    if (!combatants.some((combatant) => combatant.id === combatantId)) {
      setCombatantId(combatants[0]?.id ?? "");
      setResult("");
    }
  }, [combatantId, combatants]);

  if (combatants.length === 0) return null;

  const combatant = combatants.find((candidate) => candidate.id === combatantId) ?? combatants[0];
  const reference = references[combatant.id];
  const grouped = (Object.keys(kindLabels) as DndMonsterActionKind[])
    .map((kind) => ({ kind, actions: reference.actions.filter((action) => action.kind === kind) }))
    .filter((group) => group.actions.length > 0);

  const useAction = (actionId: string, kind: DndMonsterActionKind, name: string) => {
    const resource = resourceForKind(kind);
    if (resource) setEncounter((current) => spendDndTurnResource(current, combatant.id, resource));
    setReferences((current) => {
      const currentReference = current[combatant.id];
      if (!currentReference) return current;
      return {
        ...current,
        [combatant.id]: spendDndMonsterLiveAction(currentReference, actionId)
      };
    });
    setResult(`${combatant.name} used ${name}.`);
  };

  const rollRecharge = (actionId: string, name: string) => {
    const roll = secureRandomInteger(1, 6);
    const displayedResolution = resolveDndMonsterRecharge(reference, actionId, roll);
    setReferences((current) => resolveDndMonsterRechargeInReferences(
      current,
      combatant.id,
      actionId,
      roll
    ));
    setResult(`${combatant.name} rolled ${roll} for ${name}: ${displayedResolution.succeeded ? "recharged" : `not ready; needs ${displayedResolution.minimum}+`}.`);
  };

  return (
    <section className="dnd-monster-live" aria-labelledby="dnd-monster-live-title">
      <header>
        <div><small>Imported SRD combat data</small><h2 id="dnd-monster-live-title">Monster Actions &amp; Recharge</h2></div>
        <label>Monster<select value={combatant.id} onChange={(event) => { setCombatantId(event.target.value); setResult(""); }}>{combatants.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}</select></label>
      </header>

      <div className="dnd-monster-live__vitals">
        <span><strong>AC</strong>{reference.armorClass || "—"}</span>
        <span><strong>Saves</strong>{reference.savingThrows || "No listed save bonuses"}</span>
        <span><strong>Senses</strong>{reference.senses || "No special senses listed"}</span>
      </div>

      {grouped.map((group) => (
        <section className="dnd-monster-live__group" key={group.kind}>
          <h3>{kindLabels[group.kind]}</h3>
          <div className="dnd-monster-live__grid">
            {group.actions.map((action) => {
              const usable = canUseAction(encounter, combatant, action.kind, action.rechargeReady);
              return (
                <article key={action.id} className={!action.rechargeReady ? "is-spent" : ""}>
                  <header><strong>{action.name}</strong>{action.rechargeLabel && <span>{action.rechargeReady ? action.rechargeLabel : "Recharge pending"}</span>}</header>
                  {action.reachOrRange && <small>{action.reachOrRange}</small>}
                  <p>{action.summary}</p>
                  <div>
                    <button disabled={!usable} type="button" onClick={() => useAction(action.id, action.kind, action.name)}>Use {action.kind === "legendaryAction" ? "reference" : "action"}</button>
                    {action.rechargeMinimum !== undefined && !action.rechargeReady && <button type="button" onClick={() => rollRecharge(action.id, action.name)}>Roll recharge d6</button>}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      <p className="dnd-monster-live__source">Source: {reference.sourceReference}. Action summaries are quick references; open the full sourced folio for complete wording and edge cases.</p>
      {result && <output aria-live="polite">{result}</output>}
    </section>
  );
};