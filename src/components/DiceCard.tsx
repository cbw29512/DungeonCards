import type { DiceCard as DiceCardType, RollResult } from "../types/cards";

type DiceCardProps = {
  card: DiceCardType;
  isFlipped: boolean;
  result?: RollResult;
  onFlip: (card: DiceCardType) => void;
};

const formatRolls = (result?: RollResult): string => {
  if (!result) {
    return "Ready";
  }

  return result.dice
    .flatMap((die) => die.results.map((roll) => `${Math.abs(roll)}`))
    .join(" + ");
};

export const DiceCard = ({ card, isFlipped, result, onFlip }: DiceCardProps) => {
  const resultLabel = result?.isCritical
    ? "Natural 20"
    : result?.isFailure
      ? "Natural 1"
      : "Result";

  return (
    <button
      className={`dice-card ${isFlipped ? "is-flipped" : ""}`}
      onClick={() => onFlip(card)}
      type="button"
      aria-label={`Flip ${card.name}`}
    >
      <span className="dice-card__inner">
        <span className="dice-card__face dice-card__front">
          <span className="dice-card__emoji">{card.imageEmoji}</span>
          <span className="dice-card__eyebrow">{card.category}</span>
          <strong>{card.name}</strong>
          <span className="dice-card__formula">{card.formula}</span>
          <small>{card.description}</small>
        </span>

        <span className="dice-card__face dice-card__back">
          <span className="dice-card__eyebrow">{resultLabel}</span>
          <strong className="dice-card__total">{result?.total ?? "—"}</strong>
          <span className="dice-card__formula">{formatRolls(result)}</span>
          <small>The card resets after a few seconds so it can be used again.</small>
        </span>
      </span>
    </button>
  );
};
