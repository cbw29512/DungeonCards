import type { RuleRollHistoryEntry } from "../types/ruleCards";
import { RULESET_LABELS } from "../types/ruleCards";

type RuleRollHistoryProps = {
  entries: RuleRollHistoryEntry[];
  onClear: () => void;
};

export const RuleRollHistory = ({ entries, onClear }: RuleRollHistoryProps) => (
  <aside className="rule-history" aria-label="Rules card roll history">
    <header>
      <h3>Table Log</h3>
      {entries.length > 0 && <button onClick={onClear} type="button">Clear</button>}
    </header>

    {entries.length === 0 ? (
      <p>Roll a card to start the table log.</p>
    ) : (
      <ol>
        {entries.map((entry) => (
          <li key={entry.id}>
            <div>
              <strong>{entry.cardName}</strong>
              <span>{entry.result.total}</span>
            </div>
            <small>{RULESET_LABELS[entry.ruleset]} • {entry.modeLabel}</small>
            {entry.result.tableResult && <p>{entry.result.tableResult}</p>}
          </li>
        ))}
      </ol>
    )}
  </aside>
);