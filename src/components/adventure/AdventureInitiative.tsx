import type {
  AdventureRuntimeState,
  AdventureTurnResource
} from "../../types/adventurePack";

type Props = {
  state: AdventureRuntimeState;
  onRoll(): void;
  onNext(): void;
  onResource(resource: AdventureTurnResource): void;
};

const resources: { id: AdventureTurnResource; label: string }[] = [
  { id: "movement", label: "Movement" },
  { id: "action", label: "Action" },
  { id: "bonus", label: "Bonus action" },
  { id: "free", label: "Free / interact" },
  { id: "reaction", label: "Reaction" }
];

export const AdventureInitiative = ({
  onNext,
  onResource,
  onRoll,
  state
}: Props) => {
  const active = state.initiative[state.activeTurn];

  return (
    <section className="adventure-initiative">
      <div>
        <p>One-button combat</p>
        <h2>{state.initiative.length && state.round === 0 ? "Natural 20 opening turns" : state.round ? `Round ${state.round}` : "Initiative ready"}</h2>
      </div>
      <button onClick={onRoll} type="button">Roll room initiative</button>
      {state.initiative.length > 0 && (
        <>
          <ol>
            {state.initiative.map((entry, index) => (
              <li className={index === state.activeTurn ? "is-active" : ""} key={entry.entryId}>
                <strong>{entry.title}</strong>
                <span>{entry.roll} + bonus = {entry.total}{entry.openingTurn ? " · NAT 20 FREE TURN" : ""}</span>
              </li>
            ))}
          </ol>
          <div className="adventure-active-turn">
            <strong>{active?.title}'s turn</strong>
            <div>
              {resources.map((resource) => (
                <button
                  aria-pressed={state.usedTurnResources.includes(resource.id)}
                  key={resource.id}
                  onClick={() => onResource(resource.id)}
                  type="button"
                >
                  {resource.label}
                </button>
              ))}
            </div>
            <button className="adventure-finish-turn" onClick={onNext} type="button">
              Finish turn →
            </button>
          </div>
        </>
      )}
    </section>
  );
};
