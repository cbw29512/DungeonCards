import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import {
  isDndTurnRestrictedBySurprise,
  spendDndMovement,
  type DndEncounterState
} from "../utils/dndEncounter";
import type { DndMonsterLiveReference } from "../utils/dndMonsterLiveReference";
import {
  calculateDndGridDistanceFeet,
  calculateDndGridMovementFeet,
  dndCreatureSpaceSquares,
  doDndCreatureSpacesOverlap,
  parseDndCreatureSize,
  validateDndActionDistance,
  type DndCreatureSize,
  type DndGridPosition
} from "../utils/dndSpatialCombat";
import "../styles/dnd-spatial-combat.css";

type Props = {
  encounter: DndEncounterState;
  setEncounter: Dispatch<SetStateAction<DndEncounterState>>;
  references: Record<string, DndMonsterLiveReference>;
  positions: Record<string, DndGridPosition>;
  setPositions: Dispatch<SetStateAction<Record<string, DndGridPosition>>>;
};

const sizes: DndCreatureSize[] = ["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"];

export const DndSpatialCombatPanel = ({
  encounter,
  setEncounter,
  references,
  positions,
  setPositions
}: Props) => {
  const [positionCombatantId, setPositionCombatantId] = useState(encounter.combatants[0]?.id ?? "");
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [size, setSize] = useState<DndCreatureSize>("Medium");
  const [attackerId, setAttackerId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [actionId, setActionId] = useState("");
  const [moveX, setMoveX] = useState(0);
  const [moveY, setMoveY] = useState(0);
  const [result, setResult] = useState("");

  const positioned = encounter.combatants.filter((combatant) => positions[combatant.id]);
  const attackers = positioned.filter((combatant) => references[combatant.id]?.actions.length > 0);
  const active = encounter.started ? encounter.combatants[encounter.currentIndex] : undefined;
  const activePosition = active ? positions[active.id] : undefined;

  useEffect(() => {
    if (!encounter.combatants.some((combatant) => combatant.id === positionCombatantId)) {
      setPositionCombatantId(encounter.combatants[0]?.id ?? "");
    }
  }, [encounter.combatants, positionCombatantId]);

  useEffect(() => {
    const current = positions[positionCombatantId];
    setX(current?.x ?? 0);
    setY(current?.y ?? 0);
    setSize(current?.size ?? references[positionCombatantId]?.size ?? "Medium");
  }, [positionCombatantId, positions, references]);

  useEffect(() => {
    if (!attackers.some((combatant) => combatant.id === attackerId)) {
      setAttackerId(attackers[0]?.id ?? "");
    }
  }, [attackerId, attackers]);

  const possibleTargets = positioned.filter((combatant) => combatant.id !== attackerId);
  useEffect(() => {
    if (!possibleTargets.some((combatant) => combatant.id === targetId)) {
      setTargetId(possibleTargets[0]?.id ?? "");
    }
  }, [possibleTargets, targetId]);

  const attackerReference = references[attackerId];
  useEffect(() => {
    if (!attackerReference?.actions.some((action) => action.id === actionId)) {
      setActionId(attackerReference?.actions[0]?.id ?? "");
    }
  }, [actionId, attackerReference]);

  useEffect(() => {
    if (!activePosition) return;
    setMoveX(activePosition.x);
    setMoveY(activePosition.y);
  }, [active?.id, activePosition?.x, activePosition?.y]);

  const overlapPairs = useMemo(() => {
    const pairs: string[] = [];
    positioned.forEach((first, index) => positioned.slice(index + 1).forEach((second) => {
      if (doDndCreatureSpacesOverlap(positions[first.id], positions[second.id])) {
        pairs.push(`${first.name} and ${second.name}`);
      }
    }));
    return pairs;
  }, [positioned, positions]);

  const attackerPosition = positions[attackerId];
  const targetPosition = positions[targetId];
  const selectedAction = attackerReference?.actions.find((action) => action.id === actionId);
  const distanceFeet = attackerPosition && targetPosition
    ? calculateDndGridDistanceFeet(attackerPosition, targetPosition)
    : undefined;
  const validation = distanceFeet === undefined
    ? undefined
    : validateDndActionDistance(distanceFeet, selectedAction?.reachOrRange);

  const proposedMove = activePosition
    ? calculateDndGridMovementFeet(activePosition, { ...activePosition, x: moveX, y: moveY })
    : 0;
  const movementRestricted = Boolean(active && isDndTurnRestrictedBySurprise(encounter, active));
  const canMove = Boolean(
    active
    && activePosition
    && active.health.lifeState === "conscious"
    && !movementRestricted
    && proposedMove > 0
    && proposedMove <= active.movementRemainingFeet
  );

  const setPosition = () => {
    if (!positionCombatantId) return;
    setPositions((current) => ({
      ...current,
      [positionCombatantId]: { x: Math.trunc(x), y: Math.trunc(y), size }
    }));
    const combatant = encounter.combatants.find((candidate) => candidate.id === positionCombatantId);
    setResult(`${combatant?.name ?? "Combatant"} placed at (${Math.trunc(x)}, ${Math.trunc(y)}).`);
  };

  const clearPosition = () => {
    setPositions((current) => {
      const next = { ...current };
      delete next[positionCombatantId];
      return next;
    });
    setResult("Position removed.");
  };

  const moveActive = () => {
    if (!active || !activePosition || !canMove) return;
    const nextPosition = { ...activePosition, x: Math.trunc(moveX), y: Math.trunc(moveY) };
    setPositions((current) => ({ ...current, [active.id]: nextPosition }));
    setEncounter((current) => spendDndMovement(current, active.id, proposedMove));
    setResult(`${active.name} moved ${proposedMove} feet to (${nextPosition.x}, ${nextPosition.y}).`);
  };

  if (encounter.combatants.length === 0) return null;

  return (
    <section className="dnd-spatial-combat" aria-labelledby="dnd-spatial-title">
      <header>
        <div><small>Square-grid combat</small><h2 id="dnd-spatial-title">Positions, Distance &amp; Reach</h2></div>
        <strong>{positioned.length}/{encounter.combatants.length} positioned</strong>
      </header>

      <p className="dnd-spatial-combat__notice">
        Coordinates identify each creature’s top-left occupied square. Each square is 5 feet; diagonal movement costs one square. Distance is measured edge to edge by the shortest grid route.
      </p>

      <div className="dnd-spatial-combat__setup">
        <label>Combatant<select value={positionCombatantId} onChange={(event) => setPositionCombatantId(event.target.value)}>{encounter.combatants.map((combatant) => <option key={combatant.id} value={combatant.id}>{combatant.name}</option>)}</select></label>
        <label>X square<input type="number" value={x} onChange={(event) => setX(Math.trunc(Number(event.target.value) || 0))} /></label>
        <label>Y square<input type="number" value={y} onChange={(event) => setY(Math.trunc(Number(event.target.value) || 0))} /></label>
        <label>Size<select value={size} onChange={(event) => setSize(parseDndCreatureSize(event.target.value))}>{sizes.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
        <button type="button" onClick={setPosition}>Set position</button>
        <button disabled={!positions[positionCombatantId]} type="button" onClick={clearPosition}>Clear</button>
      </div>

      {positioned.length > 0 && (
        <div className="dnd-spatial-combat__tokens">
          {positioned.map((combatant) => {
            const position = positions[combatant.id];
            const space = dndCreatureSpaceSquares(position.size);
            return <span key={combatant.id}><strong>{combatant.name}</strong>({position.x}, {position.y}) · {position.size} · {space}×{space}</span>;
          })}
        </div>
      )}

      {overlapPairs.length > 0 && (
        <p className="dnd-spatial-combat__warning">
          Overlapping spaces: {overlapPairs.join("; ")}. Review table exceptions manually—Tiny creatures, allies, Incapacitated creatures, and size differences can change passage or sharing rules.
        </p>
      )}

      {encounter.started && active && (
        <section className="dnd-spatial-combat__move">
          <header><h3>Move active combatant</h3><span>{active.name} · {active.movementRemainingFeet} feet left</span></header>
          {activePosition ? (
            <div>
              <label>Destination X<input type="number" value={moveX} onChange={(event) => setMoveX(Math.trunc(Number(event.target.value) || 0))} /></label>
              <label>Destination Y<input type="number" value={moveY} onChange={(event) => setMoveY(Math.trunc(Number(event.target.value) || 0))} /></label>
              <strong>Cost: {proposedMove} feet</strong>
              <button disabled={!canMove} type="button" onClick={moveActive}>Move token</button>
            </div>
          ) : <p>Set a position for {active.name} before moving the token.</p>}
          <small>Movement cost here assumes an open square grid. Apply difficult terrain, occupied-space rules, obstacles, elevation, jumping, climbing, swimming, and forced movement separately.</small>
        </section>
      )}

      <section className="dnd-spatial-combat__target">
        <header><h3>Validate monster action distance</h3></header>
        {attackers.length > 0 && possibleTargets.length > 0 ? (
          <div className="dnd-spatial-combat__target-grid">
            <label>Attacker<select value={attackerId} onChange={(event) => setAttackerId(event.target.value)}>{attackers.map((combatant) => <option key={combatant.id} value={combatant.id}>{combatant.name}</option>)}</select></label>
            <label>Action<select value={actionId} onChange={(event) => setActionId(event.target.value)}>{attackerReference?.actions.map((action) => <option key={action.id} value={action.id}>{action.name}</option>)}</select></label>
            <label>Target<select value={targetId} onChange={(event) => setTargetId(event.target.value)}>{possibleTargets.map((combatant) => <option key={combatant.id} value={combatant.id}>{combatant.name}</option>)}</select></label>
            <div className={`dnd-spatial-combat__result status-${validation?.status ?? "manual-review"}`}>
              <strong>{distanceFeet ?? "—"} feet</strong>
              <span>{validation?.summary ?? "Position both creatures and choose an action."}</span>
              {selectedAction?.reachOrRange && <small>Parsed reference: {selectedAction.reachOrRange}</small>}
            </div>
          </div>
        ) : <p>Position an imported monster and at least one target to validate reach or range.</p>}
      </section>

      <footer>
        <a href="https://www.dndbeyond.com/sources/dnd/basic-rules-2014/combat" target="_blank" rel="noreferrer">2014 Basic Rules · Movement, grids, and reach</a>
        <a href="https://www.dndbeyond.com/sources/dnd/br-2024/playing-the-game" target="_blank" rel="noreferrer">2024 Free Rules · Playing on a grid and reach</a>
      </footer>
      {result && <output aria-live="polite">{result}</output>}
    </section>
  );
};