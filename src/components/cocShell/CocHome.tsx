import { CocPercentileCard } from "../CocPercentileCard";

export const CocHome = () => (
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
        <p className="coc-home__navigation-note">
          Use the single navigation bar above to open each workspace. Destinations are not repeated as a second button grid.
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
