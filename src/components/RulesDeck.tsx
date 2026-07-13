import { useMemo, useState } from "react";
import type { RuleCard as RuleCardType, RuleRollHistoryEntry } from "../types/ruleCards";
import { RuleCard } from "./RuleCard";
import { RuleRollHistory } from "./RuleRollHistory";

type RulesDeckProps = {
  cards: RuleCardType[];
  eyebrow: string;
  title: string;
  description: string;
};

export const RulesDeck = ({ cards, eyebrow, title, description }: RulesDeckProps) => {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<RuleRollHistoryEntry[]>([]);
  const filteredCards = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return cards;
    }

    return cards.filter((card) =>
      `${card.name} ${card.kind}`.toLowerCase().includes(normalized)
    );
  }, [cards, query]);

  const addHistory = (entry: RuleRollHistoryEntry) => {
    setHistory((current) => [entry, ...current].slice(0, 30));
  };

  return (
    <section className="rules-deck" aria-labelledby={`${eyebrow}-rules-title`}>
      <div className="section-heading rules-deck__heading">
        <p>{eyebrow}</p>
        <h2 id={`${eyebrow}-rules-title`}>{title}</h2>
        <span>{description}</span>
        <label className="rules-deck__search">
          <span className="sr-only">Search cards</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search weapons, spells, traps…"
            type="search"
            value={query}
          />
        </label>
      </div>

      <div className="rules-deck__layout">
        <div className="rules-card-grid">
          {filteredCards.map((card) => (
            <RuleCard card={card} key={card.id} onRoll={addHistory} />
          ))}
        </div>
        <RuleRollHistory entries={history} onClear={() => setHistory([])} />
      </div>
    </section>
  );
};