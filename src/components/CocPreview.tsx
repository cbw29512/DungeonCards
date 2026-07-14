import { useState } from "react";
import {
  cocPreviewCreature,
  cocPreviewSpell,
  cocPreviewWeapon
} from "../data/cocPreviewCatalog";
import { cocQuickReferenceCards } from "../data/cocRuleSources";
import { CocCreatureDossier } from "./CocCreatureDossier";
import { CocPercentileCard } from "./CocPercentileCard";
import { CocRuleStatus } from "./CocRuleStatus";
import { CocRulesAudit } from "./CocRulesAudit";
import { CocSpellCard } from "./CocSpellCard";
import { CocWeaponCard } from "./CocWeaponCard";

type CocPage =
  | "archive"
  | "investigator"
  | "keeper"
  | "creatures"
  | "weapons"
  | "spells"
  | "accuracy";

type CocPreviewProps = {
  onChangeSystem: () => void;
};

const QuickReferenceGrid = ({ limit }: { limit?: number }) => {
  const cards = limit ? cocQuickReferenceCards.slice(0, limit) : cocQuickReferenceCards;

  return (
    <div className="coc-rule-grid">
      {cards.map((note) => (
        <article className="coc-rule-note" key={note.id}>
          <span>{note.stamp}</span>
          <h3>{note.title}</h3>
          <p>{note.text}</p>
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
          <span aria-hidden="true">◉</span>
          <strong>Dungeon Cards</strong>
          <small>CoC 7e prototype</small>
        </button>

        <div className="coc-nav__links">
          <button aria-pressed={activePage === "archive"} type="button" onClick={() => setActivePage("archive")}>Archive</button>
          <button aria-pressed={activePage === "investigator"} type="button" onClick={() => setActivePage("investigator")}>Investigator</button>
          <button aria-pressed={activePage === "keeper"} type="button" onClick={() => setActivePage("keeper")}>Keeper</button>
          <button aria-pressed={activePage === "creatures"} type="button" onClick={() => setActivePage("creatures")}>Creatures</button>
          <button aria-pressed={activePage === "weapons"} type="button" onClick={() => setActivePage("weapons")}>Weapons</button>
          <button aria-pressed={activePage === "spells"} type="button" onClick={() => setActivePage("spells")}>Spells</button>
          <button aria-pressed={activePage === "accuracy"} type="button" onClick={() => setActivePage("accuracy")}>Rules Audit</button>
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
              <span>
                A dark, interactive proof of concept for Investigator procedures, Keeper tools,
                combat-ready creatures, weapons, spells, and percentile resolution.
              </span>
              <div className="coc-button-row coc-button-row--hero">
                <button className="coc-roll-button" type="button" onClick={() => setActivePage("investigator")}>Open Investigator file</button>
                <button type="button" onClick={() => setActivePage("accuracy")}>Open rules audit</button>
              </div>
            </div>
            <div className="coc-hero__seal" aria-hidden="true">
              <span>◉</span>
              <small>DO NOT CATALOG</small>
            </div>
          </section>

          <section className="coc-section">
            <header className="coc-section__heading">
              <small>Live rules engine</small>
              <h2>Resolve a percentile check</h2>
              <p>Change the skill, difficulty, and net dice modifier. Every current source status is shown directly on the card.</p>
            </header>
            <CocPercentileCard />
          </section>

          <section className="coc-section">
            <header className="coc-section__heading">
              <small>Card taxonomy preview</small>
              <h2>Rules that belong at the table</h2>
              <p>These summaries remain marked needs-review until page-level and independent verification are complete.</p>
            </header>
            <QuickReferenceGrid />
          </section>

          <section className="coc-section coc-section--index">
            <header className="coc-section__heading">
              <small>Prototype records</small>
              <h2>Open a working card family</h2>
            </header>
            <div className="coc-index-grid">
              <button type="button" onClick={() => setActivePage("creatures")}><small>Keeper dossier</small><strong>The Lantern Maw</strong><span>Original prototype: HP, MP, attacks, Dodge, Sanity loss, armor, and traits.</span></button>
              <button type="button" onClick={() => setActivePage("weapons")}><small>Evidence locker</small><strong>Service Revolver</strong><span>Original prototype: skill, net dice, ammunition, malfunction, and base damage.</span></button>
              <button type="button" onClick={() => setActivePage("spells")}><small>Occult memorandum</small><strong>Veil of the Hollow Star</strong><span>Original prototype: casting, MP cost, SAN cost, duration, and failure consequence.</span></button>
            </div>
          </section>
        </>
      )}

      {activePage === "investigator" && (
        <section className="coc-section coc-section--page">
          <header className="coc-section__heading">
            <small>Investigator workspace</small>
            <h1>Keep the procedures you use under pressure.</h1>
            <p>This preview starts with the percentile resolver. No rule is presented as certified until its source record passes both reviews.</p>
          </header>
          <CocPercentileCard eyebrow="Investigator skill file" title="Active Skill Check" />
          <QuickReferenceGrid limit={3} />
        </section>
      )}

      {activePage === "keeper" && (
        <section className="coc-section coc-section--page">
          <header className="coc-section__heading">
            <small>Keeper workspace</small>
            <h1>Run the scene without breaking the dread—or the rules.</h1>
            <p>Encounter state, private notes, combat procedures, Sanity effects, and hidden information remain on the Keeper side.</p>
          </header>
          <QuickReferenceGrid />
          <CocCreatureDossier creature={cocPreviewCreature} />
        </section>
      )}

      {activePage === "creatures" && (
        <section className="coc-section coc-section--page">
          <header className="coc-section__heading">
            <small>Combat-ready Keeper folio</small>
            <h1>Every number needed when it reaches the light.</h1>
            <p>The sample below is original prototype content. Uncertified special-damage and opposed-combat procedures are deliberately not automated.</p>
          </header>
          <CocCreatureDossier creature={cocPreviewCreature} />
        </section>
      )}

      {activePage === "weapons" && (
        <section className="coc-section coc-section--page coc-section--narrow">
          <header className="coc-section__heading">
            <small>Interactive weapon cards</small>
            <h1>Evidence that fires back.</h1>
            <p>The prototype demonstrates attack rolls, net Bonus/Penalty dice, ammunition, and malfunctions. Special damage remains gated.</p>
          </header>
          <CocWeaponCard weapon={cocPreviewWeapon} />
        </section>
      )}

      {activePage === "spells" && (
        <section className="coc-section coc-section--page coc-section--narrow">
          <header className="coc-section__heading">
            <small>Original occult prototype</small>
            <h1>Some cards should feel dangerous to open.</h1>
            <p>This invented ritual tests resource-tracking UI without claiming to implement an official spell.</p>
          </header>
          <CocSpellCard spell={cocPreviewSpell} />
        </section>
      )}

      {activePage === "accuracy" && <CocRulesAudit />}

      <footer className="coc-footer">
        <strong>Unofficial private-development prototype.</strong>
        <span>
          Call of Cthulhu is a trademark of Chaosium Inc. This preview contains original demonstration content and is not published, endorsed, or approved by Chaosium.
        </span>
      </footer>
    </main>
  );
};