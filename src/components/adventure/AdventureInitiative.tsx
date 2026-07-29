import type { AdventureRuntimeState } from "../../types/adventurePack";

type Props = {
  state: AdventureRuntimeState;
  onRoll(): void;
  onNext(): void;
};

export const AdventureInitiative = ({ onNext, onRoll, state }: Props) => (
  <section className="adventure-initiative">
    <div>
      <p>One-button combat</p>
      <h2>{state.round ? `Round ${state.round}` : "Initiative ready"}</h2>
    </div>
    <button onClick={onRoll} type="button">Roll room initiative</button>
    {state.initiative.length > 0 && (
      <>
        <ol>
          {state.initiative.map((entry, index) => (
            <li className={index === state.activeTurn ? "is-active" : ""} key={entry.cardId}>
              <strong>{entry.title}</strong>
              <span>{entry.roll} + bonus = {entry.total}{entry.openingTurn ? " · NAT 20 FREE TURN" : ""}</span>
            </li>
          ))}
        </ol>
        <button onClick={onNext} type="button">Finish turn</button>
      </>
    )}
  </section>
);
