import { useState } from "react";
import {
  cocPreviewCreature,
  cocPreviewSpell,
  cocPreviewWeapon
} from "../data/cocPreviewCatalog";
import { cocQuickReferenceCards } from "../data/cocRuleSources";
import { CocCreatureDossier } from "./CocCreatureDossier";
import { CocInjuryCard } from "./CocInjuryCard";
import { CocOpposedCard } from "./CocOpposedCard";
import { CocPercentileCard } from "./CocPercentileCard";
import { CocRuleStatus } from "./CocRuleStatus";
import { CocRulesAudit } from "./CocRulesAudit";
import { CocSanityCard } from "./CocSanityCard";
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
              <p>These summaries have received a direct official-wiki review and remain marked pending until independent verification is complete.</p>
            </header>
            <QuickReferenceGrid />
          </section>

          <section className="coc-section coc-section--index">
            <header className="coc-section__heading">
              <small>Working records</small>
              <h2>Open a card family</h2>
            </header>
            <div className="coc-index-grid">
              <button type="button" onClick={() => setActivePage("investigator")}><small>Source-backed procedures</small><strong>Investigator File</strong><span>Percentile checks, Sanity loss, temporary insanity prompts, damage, and Major Wounds.</span></button>
              <button type="button" onClick={() => setActivePage("keeper")}><small>Source-backed resolution</small><strong>Keeper File</strong><span>Generic opposed rolls, Dodge, Fight Back, ties, and encounter references.</span></button>
              <button type="button" onClick={() => setActivePage("creatures")}><small>Original prototype</small><strong>The Lantern Maw</strong><span>HP, MP, attacks, Dodge, Sanity loss, armor, and traits.</span></button>
            </div>
          </section>
        </>
      )}

      {activePage === "investigator" && (
        <section className="coc-section coc-section--page">
          <header className="coc-section__heading">
            <small>Investigator workspace</small>
            <h1>Keep the procedures you use under pressure.</h1>
            <p>These cards are grounded in the official Chaosium rules wiki and remain pending independent review before verified status.</p>
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
            <small>Keeper workspace</small>
            <h1>Run the scene without breaking the dread—or the rules.</h1>
            <p>Generic opposed rolls and close combat use different tie rules, so their resolver remains separate from the creature prototype.</p>
          </header>
          <CocOpposedCard />
          <QuickReferenceGrid />
          <CocCreatureDossier creature={cocPreviewCreature} />
        </section>
      )}

      {activePage === "creatures" && (
        <section className="coc-section coc-section--page">
          <header className="coc-section__heading">
            <small>Combat-ready Keeper folio</small>
            <h1>Every number needed when it reaches the light.</h1>
            <p>The sample below is original prototype content. Special damage remains gated until the complete damage model passes independent review.</p>
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