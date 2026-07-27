import { cocQuickReferenceCards } from "../../data/cocRuleSources";
import { CocRuleStatus } from "../CocRuleStatus";

export type CocReferenceItem = {
  eyebrow: string;
  title: string;
  summary: string;
  steps: string[];
};

export const CocReferenceGrid = ({
  items,
  label
}: {
  items: CocReferenceItem[];
  label: string;
}) => (
  <div className="coc-reference-grid" aria-label={label}>
    {items.map((item) => (
      <article className="coc-reference-card" key={item.title}>
        <small>{item.eyebrow}</small>
        <h2>{item.title}</h2>
        <p>{item.summary}</p>
        <ul>{item.steps.map((step) => <li key={step}>{step}</li>)}</ul>
      </article>
    ))}
  </div>
);

export const CocQuickReferenceGrid = ({ limit }: { limit?: number }) => {
  const cards = limit ? cocQuickReferenceCards.slice(0, limit) : cocQuickReferenceCards;
  return (
    <div className="coc-rule-grid">
      {cards.map((note) => (
        <article className="coc-rule-note" key={note.id}>
          <span>{note.stamp}</span><h3>{note.title}</h3><p>{note.text}</p>
          <CocRuleStatus sourceId={note.sourceId} />
        </article>
      ))}
    </div>
  );
};
