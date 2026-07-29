import type { AdventureCard } from "../../types/adventurePack";

type Props = {
  card: AdventureCard;
  dmView: boolean;
  revealed?: boolean;
  onAction?(): void;
  actionLabel?: string;
};

export const AdventureCardTile = ({
  actionLabel,
  card,
  dmView,
  onAction,
  revealed
}: Props) => (
  <article className={`adventure-card adventure-card--${card.kind}`}>
    <div className="adventure-card__art" aria-hidden="true">
      <span>{card.kind}</span>
      <strong>{card.roomNumber ? `ROOM ${card.roomNumber}` : "HEARTHGLOW"}</strong>
    </div>
    <div className="adventure-card__body">
      <small>{card.id}{card.badge ? ` · ${card.badge}` : ""}</small>
      <h3>{card.title}</h3>
      <p>{card.playerText}</p>
      {card.quickStats && (
        <ul aria-label={`${card.title} quick statistics`}>
          {card.quickStats.map((stat) => <li key={stat}>{stat}</li>)}
        </ul>
      )}
      {dmView && card.dmText && <aside><strong>DM</strong> {card.dmText}</aside>}
      {onAction && (
        <button type="button" onClick={onAction}>
          {actionLabel ?? (revealed ? "Hide from players" : "Reveal to players")}
        </button>
      )}
    </div>
  </article>
);
