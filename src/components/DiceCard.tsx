import type { DiceCard as DiceCardType, RollResult } from "../types/cards";
import { formatRollBreakdown } from "../utils/formatRollResult";

type DiceCardProps = {
  card: DiceCardType;
  isFlipped: boolean;
  result?: RollResult;
  onFlip: (card: DiceCardType) => void;
};

export const DiceCard = ({ card, isFlipped, result, onFlip }: DiceCardProps) => {
  const resultLabel = result?.isCritical
    ? "Natural 20"
    : result?.isFailure
      ? "Natural 1"
      : "Result";

  return (
    <button
      aria-label={isFlipped ? `Roll ${card.name} again` : `Roll ${card.name}`}
      aria-pressed={isFlipped}
      className={`dice-card ${isFlipped ? "is-flipped" : ""}`}
      onClick={() => onFlip(card)}
      type="button"
    >
      <span className="dice-card__inner">
        <span aria-hidden={isFlipped} className="dice-card__face dice-card__front">
          <span className="dice-card__emoji">{card.imageEmoji}</span>
          <span className="dice-card__eyebrow">{card.category}</span>
          <strong>{card.name}</strong>
          <span className="dice-card__formula">{card.formula}</span>
          <small>{card.description}</small>
        </span>

        <span
          aria-hidden={!isFlipped}
          aria-live="polite"
          className="dice-card__face dice-card__back"
        >
          <span className="dice-card__eyebrow">{resultLabel}</span>
          <strong className="dice-card__total">{result?.total ?? "—"}</strong>
          <span className="dice-card__formula">{formatRollBreakdown(result)}</span>
          <small>The card resets after a few seconds so it can be rolled again.</small>
        </span>
      </span>
    </button>
  );
};
