import type { RollHistoryEntry } from "../types/cards";

type RollHistoryProps = {
  entries: RollHistoryEntry[];
  onClear?: () => void;
};

const formatDiceBreakdown = (entry: RollHistoryEntry): string => {
  const diceText = entry.result.dice
    .map((die) => `${die.results.length}d${die.sides}: ${die.results.join(", ")}`)
    .join(" | ");

  const modifierText = entry.result.modifier === 0 ? "" : ` | Modifier: ${entry.result.modifier}`;
  return `${diceText}${modifierText}`;
};

export const RollHistory = ({ entries, onClear }: RollHistoryProps) => (
  <aside className="roll-history" aria-labelledby="roll-history-title">
    <div className="section-heading roll-history__heading">
      <p>Session Log</p>
      <h2 id="roll-history-title">Cards activated</h2>
      {onClear && entries.length > 0 && <button type="button" onClick={onClear}>Clear history</button>}
    </div>

    {entries.length === 0 ? (
      <p className="roll-history__empty">Flip a card and the result will appear here.</p>
    ) : (
      <ol className="roll-history__list">
        {entries.map((entry) => (
          <li className="roll-history__item" key={entry.id}>
            <div>
              <strong>{entry.cardName}</strong>
              <span>{new Date(entry.rolledAt).toLocaleTimeString()}</span>
            </div>
            <p>{formatDiceBreakdown(entry)}</p>
            <b>Total: {entry.result.total}</b>
          </li>
        ))}
      </ol>
    )}
  </aside>
);
