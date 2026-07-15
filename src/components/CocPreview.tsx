import { useState } from "react";
import {
  cocPreviewCreature,
  cocPreviewSpell,
  cocPreviewWeapon
} from "../data/cocPreviewCatalog";
import { cocQuickReferenceCards } from "../data/cocRuleSources";
import { CocCreatureDossier } from "./CocCreatureDossier";
import { CocFirearmProcedureCard } from "./CocFirearmProcedureCard";
import { CocInjuryCard } from "./CocInjuryCard";
import { CocOpposedCard } from "./CocOpposedCard";
import { CocPercentileCard } from "./CocPercentileCard";
import { CocRulesAudit } from "./CocRulesAudit";
import { CocRulesGuide } from "./CocRulesGuide";
import { CocRuleStatus } from "./CocRuleStatus";
import { CocSanityCard } from "./CocSanityCard";
import { CocSpellCard } from "./CocSpellCard";
import { CocWeaponCard } from "./CocWeaponCard";

type CocPage =
  | "archive"
  | "rules"
  | "investigator"
  | "keeper"
  | "creatures"
  | "weapons"
  | "spells"
  | "accuracy";

type CocPreviewProps = { onChangeSystem: () => void };

const QuickReferenceGrid = ({ limit }: { limit?: number }) => {
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

export const CocPreview = ({ onChangeSystem }: CocPreviewProps) => {
  const [activePage, setActivePage] = useState<CocPage>("archive");

  return (
    <main className="coc-app">
      <div className="coc-app__grain" aria-hidden="true" />
      <nav className="coc-nav" aria-label="Call of Cthulhu preview navigation">
        <button className="coc-nav__brand" type="button" onClick={() => setActivePage("archive")}>
          <span aria-hidden="true">◉</span><strong>Dungeon Cards</strong><small>CoC 7e prototype</small>
        </button>
        <div className="coc-nav__links">
          <button aria-pressed={activePage === "archive"} type="button" onClick={() => setActivePage("archive")}>Home</button>
          <button aria-pressed={activePage === "rules"} type="button" onClick={() => setActivePage("rules")}>Rules Guide</button>
          <button aria-pressed={activePage === "investigator"} type="button" onClick={() => setActivePage("investigator")}>Investigator</button>
          <button aria-pressed={activePage === "keeper"} type="button" onClick={() => setActivePage("keeper")}>Keeper</button>
          <button aria-pressed={activePage === "creatures"} type="button" onClick={() => setActivePage("creatures")}>Creatures</button>
          <button aria-pressed={activePage === "weapons"} type="button" onClick={() => setActivePage("weapons")}>Weapons</button>
          <button aria-pressed={activePage === "spells"} type="button" onClick={() => setActivePage("spells")}>Spells</button>
          <button aria-pressed={activePage === "accuracy"} type="button" onClick={() => setActivePage("accuracy")}>Sources</button>
        </div>
        <button className="coc-nav__switch" type="button" onClick={onChangeSystem}>Switch system</button>
      </nav>

      {activePage === "archive" && (
        <>
          <section className="coc-hero">
            <div className="coc-hero__copy">
              <p>Restricted archive · accession 7E</p>
              <h1>The rules are only the first layer.</h1>
              <strong>Something underneath them has noticed you.</strong>
              <span>A playable Investigator and Keeper toolkit with plain-language rules guidance.</span>
              <div className="coc-button-row coc-button-row--hero">
                <button className="coc-roll-button" type="button" onClick={() => setActivePage("rules")}>Read the rules guide</button>
                <button type="button" onClick={() => setActivePage("investigator")}>Open Investigator file</button>
              </div>
            </div>
            <div className="coc-hero__seal" aria-hidden="true"><span>◉</span><small>DO NOT CATALOG</small></div>
          </section>

          <section className="coc-section">
            <header className="coc-section__heading">
              <small>Try the core mechanic</small><h2>Resolve a percentile check</h2>
              <p>Set the skill and difficulty, then apply any net Bonus or Penalty dice.</p>
            </header>
            <CocPercentileCard />
          </section>

          <section className="coc-section coc-section--index">
            <header className="coc-section__heading"><small>Working records</small><h2>Open a card family</h2></header>
            <div className="coc-index-grid">
              <button type="button" onClick={() => setActivePage("rules")}><small>Start here</small><strong>Rules Guide</strong><span>Percentile rolls, Sanity, wounds, combat, and firearms in table order.</span></button>
              <button type="button" onClick={() => setActivePage("investigator")}><small>Player procedures</small><strong>Investigator File</strong><span>Checks, Sanity loss, damage, and Major Wounds.</span></button>
              <button type="button" onClick={() => setActivePage("keeper")}><small>Keeper procedures</small><strong>Keeper File</strong><span>Opposed rolls, Dodge, Fight Back, and encounter references.</span></button>
            </div>
          </section>
        </>
      )}

      {activePage === "rules" && <CocRulesGuide />}

      {activePage === "investigator" && (
        <section className="coc-section coc-section--page">
          <header className="coc-section__heading">
            <small>Investigator workspace</small><h1>Keep the procedures you use under pressure.</h1>
            <p>Roll cards handle the procedure; the Rules Guide explains when to use each one.</p>
          </header>
          <div className="coc-procedure-grid">
            <CocPercentileCard eyebrow="Investigator skill file" title="Active Skill Check" />
            <CocSanityCard />
            <CocInjuryCard />
          </div>
          <QuickReferenceGrid limit={3} />
        </section>
      )}

      {activePage === "keeper" && (
        <section className="coc-section coc-section--page">
          <header className="coc-section__heading">
            <small>Keeper workspace</small><h1>Run the scene without breaking the dread—or the rules.</h1>
            <p>Ordinary contests and close combat use different tie procedures.</p>
          </header>
          <CocOpposedCard /><QuickReferenceGrid /><CocCreatureDossier creature={cocPreviewCreature} />
        </section>
      )}

      {activePage === "creatures" && (
        <section className="coc-section coc-section--page">
          <header className="coc-section__heading">
            <small>Combat-ready Keeper folio</small><h1>Every number needed when it reaches the light.</h1>
            <p>The sample is original prototype content rather than copied official statistics.</p>
          </header>
          <CocCreatureDossier creature={cocPreviewCreature} />
        </section>
      )}

      {activePage === "weapons" && (
        <section className="coc-section coc-section--page">
          <header className="coc-section__heading">
            <small>Firearm procedures and weapon cards</small><h1>Evidence that fires back.</h1>
            <p>Use the procedure card to calculate modifiers, then resolve each shot independently.</p>
          </header>
          <div className="coc-procedure-grid">
            <CocFirearmProcedureCard /><CocWeaponCard weapon={cocPreviewWeapon} />
          </div>
        </section>
      )}

      {activePage === "spells" && (
        <section className="coc-section coc-section--page coc-section--narrow">
          <header className="coc-section__heading">
            <small>Original occult prototype</small><h1>Some cards should feel dangerous to open.</h1>
            <p>This invented ritual demonstrates resource tracking without copying an official spell.</p>
          </header>
          <CocSpellCard spell={cocPreviewSpell} />
        </section>
      )}

      {activePage === "accuracy" && <CocRulesAudit />}

      <footer className="coc-footer">
        <strong>Unofficial private-development prototype.</strong>
        <span>Call of Cthulhu is a trademark of Chaosium Inc. Original demonstration content only.</span>
      </footer>
    </main>
  );
};
