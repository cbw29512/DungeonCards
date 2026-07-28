import type { CocAppPage } from "../../integration/dmForgeRoute";
import { CocPercentileCard } from "../CocPercentileCard";

export const CocHome = ({ onNavigate }: { onNavigate(page: CocAppPage): void }) => (
  <>
    <section className="coc-hero home-role-hero">
      <div className="coc-hero__copy">
        <p>DM Forge restricted archive · accession 7E</p>
        <h1>Choose your role. Open the case.</h1>
        <strong>The cards should support the dread—not interrupt it.</strong>
        <span>
          A card-centered Investigator and Keeper library with procedures, dossiers,
          equipment, rituals, encounters, builders, and visible source boundaries.
        </span>
        <div className="home-role-actions home-role-actions--coc" aria-label="Choose a percentile-horror workspace">
          <button type="button" onClick={() => onNavigate("investigator")}>
            <small>Investigator</small>
            <strong>Open Investigator workspace</strong>
            <span>Choose a premade dossier, track personal state, and keep player-safe procedures beside the active sheet.</span>
          </button>
          <button type="button" onClick={() => onNavigate("keeper")}>
            <small>Keeper</small>
            <strong>Open Keeper workspace</strong>
            <span>Prepare essential clues, opposition pressure, case flow, encounters, and private operating notes.</span>
          </button>
        </div>
        <p className="coc-home__navigation-note">
          Need a specialist tool? The navigation bar contains rules, equipment, rituals, creatures, encounters, builders, sources, and the complete Card Catalog.
        </p>
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
  </>
);