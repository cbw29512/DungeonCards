import { useMemo, useState } from "react";
import { getDndConditions } from "../data/dndConditions";
import type { ResolvedMonsterEncounterInstance } from "../types/monsterEncounterWorkspace";
import type { RulesetId } from "../types/ruleCards";
import {
  monsterHasRecharge,
  monsterHasSpecialReaction
} from "../utils/monsterEncounterWorkspaceModel";

type Props = {
  instance: ResolvedMonsterEncounterInstance;
  ruleset: RulesetId;
  onAddCondition(condition: string): void;
  onRemoveCondition(condition: string): void;
  onRename(label: string): void;
  onSetHitPoints(value: number): void;
  onSetMaximumHitPoints(value: number): void;
  onSetInitiative(value: number | null): void;
  onSetLegendaryRemaining(value: number): void;
  onSetReaction(available: boolean): void;
  onSetRecharge(ready: boolean): void;
  onStartTurn(): void;
};

export const MonsterEncounterInstanceControls = ({
  instance,
  ruleset,
  onAddCondition,
  onRemoveCondition,
  onRename,
  onSetHitPoints,
  onSetMaximumHitPoints,
  onSetInitiative,
  onSetLegendaryRemaining,
  onSetReaction,
  onSetRecharge,
  onStartTurn
}: Props) => {
  const [condition, setCondition] = useState("");
  const conditionOptions = useMemo(
    () => getDndConditions(ruleset).map((record) => record.name),
    [ruleset]
  );
  const hasSpecialReaction = monsterHasSpecialReaction(instance.monster);
  const hasRecharge = monsterHasRecharge(instance.monster);

  const addCondition = () => {
    if (!condition) return;
    onAddCondition(condition);
    setCondition("");
  };

  return (
    <section className="monster-instance-controls" aria-label={`${instance.label} encounter state`}>
      <div className="monster-instance-controls__identity">
        <label>
          <span>Encounter name</span>
          <input
            aria-label={`Name ${instance.monster.name} instance`}
            maxLength={80}
            onChange={(event) => onRename(event.target.value)}
            value={instance.label}
          />
        </label>
        <small>{instance.monster.name} · CR {instance.monster.cr}</small>
      </div>

      <div className="monster-instance-controls__vitals">
        <label>
          <span>Initiative</span>
          <input
            aria-label={`${instance.label} initiative`}
            max={100}
            min={-100}
            onChange={(event) => onSetInitiative(event.target.value === "" ? null : Number(event.target.value))}
            placeholder="—"
            type="number"
            value={instance.initiative ?? ""}
          />
        </label>
        <label>
          <span>Current HP</span>
          <input
            aria-label={`${instance.label} current hit points`}
            max={instance.maximumHitPoints}
            min={0}
            onChange={(event) => onSetHitPoints(Number(event.target.value))}
            type="number"
            value={instance.currentHitPoints}
          />
        </label>
        <label>
          <span>Maximum HP</span>
          <input
            aria-label={`${instance.label} maximum hit points`}
            max={100000}
            min={1}
            onChange={(event) => onSetMaximumHitPoints(Number(event.target.value))}
            type="number"
            value={instance.maximumHitPoints}
          />
        </label>
        <div className="monster-instance-controls__hp-buttons" aria-label={`${instance.label} quick hit point changes`}>
          <button type="button" onClick={() => onSetHitPoints(instance.currentHitPoints - 1)}>−1 HP</button>
          <button type="button" onClick={() => onSetHitPoints(instance.currentHitPoints + 1)}>+1 HP</button>
          <button type="button" onClick={() => onSetHitPoints(instance.maximumHitPoints)}>Set current to max</button>
        </div>
      </div>

      <div className="monster-instance-controls__conditions">
        <label>
          <span>Add {ruleset === "srd-5.1-2014" ? "2014" : "2024"} condition</span>
          <select onChange={(event) => setCondition(event.target.value)} value={condition}>
            <option value="">Choose condition…</option>
            {conditionOptions.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </label>
        <button disabled={!condition} onClick={addCondition} type="button">Add</button>
        <div className="monster-instance-controls__condition-list" aria-label={`${instance.label} active conditions`}>
          {instance.conditions.length === 0 ? <small>No active conditions</small> : instance.conditions.map((name) => (
            <button key={name} onClick={() => onRemoveCondition(name)} title={`Remove ${name}`} type="button">
              {name} ×
            </button>
          ))}
        </div>
      </div>

      <div className="monster-instance-controls__economy">
        <button
          aria-pressed={instance.reactionAvailable}
          onClick={() => onSetReaction(!instance.reactionAvailable)}
          title={hasSpecialReaction ? "This stat block also lists a special reaction." : "Tracks the creature's normal once-per-round reaction budget."}
          type="button"
        >
          Reaction {instance.reactionAvailable ? "ready" : "spent"}
        </button>
        {hasRecharge && (
          <button
            aria-pressed={instance.rechargeReady}
            onClick={() => onSetRecharge(!instance.rechargeReady)}
            type="button"
          >
            Recharge {instance.rechargeReady ? "ready" : "spent"}
          </button>
        )}
        {instance.legendaryActionsMaximum > 0 && (
          <label>
            <span>Legendary actions</span>
            <input
              aria-label={`${instance.label} legendary actions remaining`}
              max={instance.legendaryActionsMaximum}
              min={0}
              onChange={(event) => onSetLegendaryRemaining(Number(event.target.value))}
              type="number"
              value={instance.legendaryActionsRemaining}
            />
            <small>/ {instance.legendaryActionsMaximum}</small>
          </label>
        )}
        <button onClick={onStartTurn} type="button">Start turn</button>
        <small>Start turn refreshes the reaction and legendary-action budget. Resolve any recharge roll separately.</small>
      </div>
    </section>
  );
};