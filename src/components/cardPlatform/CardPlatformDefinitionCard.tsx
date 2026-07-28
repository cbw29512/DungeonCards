import { useState } from "react";
import type { CardDefinition } from "../../types/cardPlatform";

const MAX_ACTION_LINES = 6;

const systemLabel = (card: CardDefinition): string => card.gameSystemId === "dnd-2014"
  ? "D&D 2014"
  : card.gameSystemId === "dnd-2024"
    ? "D&D 2024"
    : "Call of Cthulhu 7e";

const actionLines = (card: CardDefinition): string[] => card.actions.flatMap((action) => {
  if (action.kind === "procedure") {
    return action.steps.map((step, index) => `${action.label} ${index + 1}: ${step}`);
  }
  if (action.kind === "roll") {
    return [`${action.label}: ${action.formula ?? action.rollSystem}`];
  }
  return [`${action.label}: ${action.targetCardIds.length} linked card${action.targetCardIds.length === 1 ? "" : "s"}`];
});

export const CardPlatformDefinitionCard = ({ card }: { card: CardDefinition }) => {
  const [flipped, setFlipped] = useState(false);
  const actions = actionLines(card);
  const source = card.source.license
    ? `${card.source.title} · ${card.source.license}`
    : card.source.title;
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
            {actions.length === 0
              ? <i>Reference card</i>
              : actions.slice(0, MAX_ACTION_LINES).map((line, index) => (
                  <i key={`${card.id}:action-line:${index}`}>{line}</i>
                ))}
            {actions.length > MAX_ACTION_LINES && <i>+{actions.length - MAX_ACTION_LINES} more action lines</i>}
          </span>
          <span className="card-platform-card__section">
            <b>Tracked resources</b>
            {card.resources.length === 0
              ? <i>None</i>
              : card.resources.slice(0, 3).map((resource) => (
                  <i key={resource.id}>{resource.label}: {resource.maximum}</i>
                ))}
          </span>
          <span className="card-platform-card__source"><b>Source</b><i>{source}</i></span>
        </span>
      </span>
    </button>
  );
};
