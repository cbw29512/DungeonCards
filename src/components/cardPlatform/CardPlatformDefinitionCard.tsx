import { useState } from "react";
import type { CardDefinition } from "../../types/cardPlatform";

const systemLabel = (card: CardDefinition): string => card.gameSystemId === "dnd-2014"
  ? "D&D 2014"
  : card.gameSystemId === "dnd-2024"
    ? "D&D 2024"
    : "Call of Cthulhu 7e";

const actionDetail = (action: CardDefinition["actions"][number]): string => {
  if (action.kind === "roll") return action.formula ?? action.rollSystem;
  if (action.kind === "procedure") return `${action.steps.length} step${action.steps.length === 1 ? "" : "s"}`;
  return `${action.targetCardIds.length} linked card${action.targetCardIds.length === 1 ? "" : "s"}`;
};

export const CardPlatformDefinitionCard = ({ card }: { card: CardDefinition }) => {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      aria-label={`${flipped ? "Show front of" : "Show details for"} ${card.content.title}`}
      aria-pressed={flipped}
      className={`card-platform-card${flipped ? " is-flipped" : ""}`}
      onClick={() => setFlipped((current) => !current)}
      type="button"
    >
      <span className="card-platform-card__inner">
        <span aria-hidden={flipped} className="card-platform-card__face card-platform-card__front">
          <small>{card.family.replaceAll("-", " ")}</small>
          <strong>{card.content.title}</strong>
          {card.content.subtitle && <em>{card.content.subtitle}</em>}
          <span>{card.content.summary}</span>
          <span className="card-platform-card__tags">
            {card.content.tags.slice(0, 4).map((tag) => <b key={tag}>{tag.replaceAll("-", " ")}</b>)}
          </span>
          <small>Flip for actions, resources, and source</small>
        </span>
        <span aria-hidden={!flipped} className="card-platform-card__face card-platform-card__back">
          <small>{systemLabel(card)} · {card.review.status.replaceAll("-", " ")}</small>
          <strong>{card.content.title}</strong>
          <span className="card-platform-card__section">
            <b>Actions</b>
            {card.actions.length === 0
              ? <i>Reference card</i>
              : card.actions.slice(0, 3).map((action) => (
                  <i key={action.id}>{action.label}: {actionDetail(action)}</i>
                ))}
          </span>
          <span className="card-platform-card__section">
            <b>Tracked resources</b>
            {card.resources.length === 0
              ? <i>None</i>
              : card.resources.slice(0, 3).map((resource) => (
                  <i key={resource.id}>{resource.label}: {resource.maximum}</i>
                ))}
          </span>
          <span className="card-platform-card__source"><b>Source</b><i>{card.source.title}</i></span>
        </span>
      </span>
    </button>
  );
};
