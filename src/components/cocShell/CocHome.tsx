import type { CocAppPage } from "../../integration/dmForgeRoute";
import { CocPercentileCard } from "../CocPercentileCard";
import { cocHomeCards } from "./cocPageRegistry";

export const CocHome = ({
  onNavigate
}: {
  onNavigate(page: CocAppPage): void;
}) => (
  <>
    <section className="coc-hero">
      <div className="coc-hero__copy">
        <p>DM Forge restricted archive · accession 7E</p>
        <h1>Run the mystery. Track the cost.</h1>
        <strong>The cards should support the dread—not interrupt it.</strong>
        <span>
          A card-centered Investigator and Keeper library with procedures, dossiers,
          equipment, rituals, encounters, builders, and visible source boundaries.
        </span>
        <div className="coc-button-row coc-button-row--hero">
          <button className="coc-roll-button" type="button" onClick={() => onNavigate("keeper")}>Open Keeper desk</button>
          <button type="button" onClick={() => onNavigate("encounters")}>Open encounter desk</button>
        </div>
      </div>
      <div className="coc-hero__seal" aria-hidden="true"><span>◉</span><small>CASE FILE ACTIVE</small></div>
    </section>

    <section className="coc-section">
      <header className="coc-section__heading">
        <small>Try the core mechanic</small>
        <h2>Resolve a percentile check</h2>
        <p>Set the skill and difficulty, then apply any net Bonus or Penalty dice.</p>
      </header>
      <CocPercentileCard />
    </section>

    <section className="coc-section coc-section--index">
      <header className="coc-section__heading">
        <small>Card library and case desks</small>
        <h2>Open the part of the investigation you need now.</h2>
      </header>
      <div className="coc-index-grid coc-index-grid--expanded">
        {cocHomeCards.map((card) => (
          <button key={card.page} type="button" onClick={() => onNavigate(card.page)}>
            <small>{card.eyebrow}</small><strong>{card.title}</strong><span>{card.description}</span>
          </button>
        ))}
      </div>
    </section>
  </>
);
