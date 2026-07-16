import { useState, type KeyboardEvent, type ReactNode } from "react";

type MonsterCardFlipProps = {
  monsterName: string;
  front: ReactNode;
  back: ReactNode;
};

export const MonsterCardFlip = ({
  monsterName,
  front,
  back
}: MonsterCardFlipProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const toggle = () => setIsFlipped((current) => !current);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggle();
  };

  return (
    <div
      aria-label={`${monsterName} card. ${isFlipped ? "Stats side shown" : "Portrait side shown"}. Activate to flip.`}
      className={`monster-card-flip${isFlipped ? " monster-card-flip--flipped" : ""}`}
      onClick={toggle}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="monster-card-flip__inner">
        <div aria-hidden={isFlipped} className="monster-card-flip__face monster-card-flip__front">
          {front}
        </div>
        <div aria-hidden={!isFlipped} className="monster-card-flip__face monster-card-flip__back">
          {back}
        </div>
      </div>
    </div>
  );
};
