import { useState } from "react";
import {
  cocPreviewCreature,
  cocPreviewSpell,
  cocPreviewWeapon
} from "../data/cocPreviewCatalog";
import { cocQuickReferenceCards } from "../data/cocRuleSources";
import { CocCombatProcedureCard } from "./CocCombatProcedureCard";
import { CocCreatureDossier } from "./CocCreatureDossier";
import { CocFirearmProcedureCard } from "./CocFirearmProcedureCard";
import { CocHealingCard } from "./CocHealingCard";
import { CocImprovementCard } from "./CocImprovementCard";
import { CocInjuryCard } from "./CocInjuryCard";
import { CocMagicProcedureCard } from "./CocMagicProcedureCard";
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
  | "investigation"
  | "investigator"
  | "keeper"
  | "combat"
  | "creatures"
  | "weapons"
  | "spells"
  | "accuracy";

type CocPreviewProps = { onChangeSystem: () => void };

type ReferenceItem = {
  eyebrow: string;
  title: string;
  summary: string;
  steps: string[];
};

const investigationFlow: ReferenceItem[] = [
  {
    eyebrow: "1 · Frame",
    title: "Open with a question",
    summary: "Every scene should create a mystery, decision, or approaching danger.",
    steps: ["State where the investigators are and what is immediately wrong.", "Name visible people, exits, evidence, and time pressure.", "Ask what they do before requesting a roll."]
  },
  {
    eyebrow: "2 · Examine",
    title: "Give the essential lead",
    summary: "Do not hide the entire scenario behind one die roll.",
    steps: ["Give essential information when they search the correct place or question the correct person.", "Roll for speed, extra context, secrecy, or safety.", "On failure, provide the lead with a cost or complication."]
  },
  {
    eyebrow: "3 · Connect",
    title: "Turn clues into choices",
    summary: "A clue matters when it points somewhere, changes a belief, or creates a decision.",
    steps: ["Restate the new fact in plain language.", "Show which previous clue it supports or contradicts.", "Offer at least two plausible next actions whenever possible."]
  },
  {
    eyebrow: "4 · Escalate",
    title: "Advance the opposition",
    summary: "Time moves even when the investigators hesitate.",
    steps: ["Advance a deadline, pursuit, ritual, injury, suspicion, or disappearing witness.", "Let noisy failures reveal the investigators to the threat.", "Escalate consequences without erasing earlier success."]
  },
  {
    eyebrow: "5 · Confront",
    title: "Clarify the stakes",
    summary: "Before a dangerous roll, everyone should understand what can change.",
    steps: ["State the immediate objective.", "Describe the danger, escape route, and collateral risk.", "Resolve only the uncertain part; do not reroll established facts."]
  },
  {
    eyebrow: "6 · Close",
    title: "Leave a usable record",
    summary: "End with a clean handoff to the next scene.",
    steps: ["List confirmed facts and unresolved questions.", "Name active leads, threats, injuries, and deadlines.", "Update evidence, attitudes, SAN, HP, MP, ammunition, and checked skills."]
  }
];

const keeperRunSheet: ReferenceItem[] = [
  {
    eyebrow: "Before play",
    title: "Prepare the mystery spine",
    summary: "Keep one page showing what happened, who knows, what each faction wants, and what happens if nobody intervenes.",
    steps: ["Write the hidden truth in three sentences.", "List three essential leads and where each can be found.", "List the opposition clock and its next three moves."]
  },
  {
    eyebrow: "Before play",
    title: "Prepare people, not speeches",
    summary: "NPCs are easier to run when their pressure points are visible.",
    steps: ["Give each NPC a goal, fear, leverage, tell, and line they will not cross.", "Separate what they know from what they believe.", "Mark what changes their attitude."]
  },
  {
    eyebrow: "At the table",
    title: "Call for fewer, stronger rolls",
    summary: "Roll when uncertainty and consequences are both real.",
    steps: ["Say the skill and difficulty first.", "Explain obvious consequences before a pushed roll or lethal choice.", "Use failure to change the situation instead of repeating the same attempt."]
  },
  {
    eyebrow: "At the table",
    title: "Keep costs visible",
    summary: "Horror works when injuries, SAN loss, ammunition, MP, and time pressure remain legible.",
    steps: ["Resolve one hit, SAN event, or spell cost at a time.", "Record Major Wounds and dying separately from HP.", "Advance opposition while investigators treat injuries or research leads."]
  },
  {
    eyebrow: "After the scene",
    title: "Update the living case file",
    summary: "A usable campaign record prevents contradictions and forgotten consequences.",
    steps: ["Record discovered clues and false assumptions separately.", "Advance NPC plans and the opposition clock.", "Note treatment, SAN events, debts, evidence, missing resources, and checked skills."]
  },
  {
    eyebrow: "After play",
    title: "Build the next session from choices",
    summary: "Prep what the investigators made likely, not every possible branch.",
    steps: ["Start from their declared lead or destination.", "Prepare one consequence from the opposition clock.", "Resolve skill improvement when the scenario or session calls for it."]
  }
];

const combatRunSheet: ReferenceItem[] = [
  {
    eyebrow: "Position",
    title: "Establish the battlefield",
    summary: "State distances, cover, exits, light, hazards, and who is exposed before dice are rolled.",
    steps: ["Place each participant in a clear zone or range band.", "Identify escape routes and objects that can change the fight.", "Re-state positions whenever movement changes the options."]
  },
  {
    eyebrow: "Order",
    title: "Use DEX order",
    summary: "Combatants act from highest DEX to lowest; a readied firearm acts at DEX + 50.",
    steps: ["Give everyone one significant action.", "Track who has already Dodged or Fought Back this round.", "Reset outnumbering reactions at the start of the next round."]
  },
  {
    eyebrow: "Action",
    title: "Resolve one intent at a time",
    summary: "Connect every roll to a goal such as escape, disarm, restrain, protect, or injure.",
    steps: ["Name the acting skill and defender response.", "Apply Build, range, cover, and net Bonus or Penalty dice before rolling.", "Resolve damage, wounds, movement, and spent resources immediately."]
  },
  {
    eyebrow: "Consequences",
    title: "Keep wounds visible",
    summary: "Current HP, Major Wounds, consciousness, dying, and stabilization are separate facts.",
    steps: ["Apply each hit separately after armor.", "Mark a Major Wound when one blow reaches the threshold.", "Track First Aid, Medicine, and dying CON rolls beside HP."]
  },
  {
    eyebrow: "Pressure",
    title: "Make escape a real option",
    summary: "A horror fight should not automatically become a battle to the death.",
    steps: ["State what withdrawal requires.", "Show pursuit risks and possible cover.", "End detailed combat once the opposition is escaped, surrendered, disabled, or no longer contested."]
  }
];

const ReferenceGrid = ({ items, label }: { items: ReferenceItem[]; label: string }) => (
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
      <nav className="coc-nav" aria-label="Cthulhu Keeper toolkit navigation">
        <button className="coc-nav__brand" type="button" onClick={() => setActivePage("archive")}>
          <span aria-hidden="true">◉</span><strong>DM Forge</strong><small>Cthulhu Keeper tools</small>
        </button>
        <div className="coc-nav__links">
          <button aria-pressed={activePage === "archive"} type="button" onClick={() => setActivePage("archive")}>Home</button>
          <button aria-pressed={activePage === "rules"} type="button" onClick={() => setActivePage("rules")}>Rules</button>
          <button aria-pressed={activePage === "investigation"} type="button" onClick={() => setActivePage("investigation")}>Investigation</button>
          <button aria-pressed={activePage === "investigator"} type="button" onClick={() => setActivePage("investigator")}>Investigator</button>
          <button aria-pressed={activePage === "keeper"} type="button" onClick={() => setActivePage("keeper")}>Keeper</button>
          <button aria-pressed={activePage === "combat"} type="button" onClick={() => setActivePage("combat")}>Combat</button>
          <button aria-pressed={activePage === "creatures"} type="button" onClick={() => setActivePage("creatures")}>Creatures</button>
          <button aria-pressed={activePage === "weapons"} type="button" onClick={() => setActivePage("weapons")}>Weapons</button>
          <button aria-pressed={activePage === "spells"} type="button" onClick={() => setActivePage("spells")}>Occult</button>
          <button aria-pressed={activePage === "accuracy"} type="button" onClick={() => setActivePage("accuracy")}>Sources</button>
        </div>
        <button className="coc-nav__switch" type="button" onClick={onChangeSystem}>Switch system</button>
      </nav>

      {activePage === "archive" && (
        <>
          <section className="coc-hero">
            <div className="coc-hero__copy">
              <p>DM Forge restricted archive · accession 7E</p>
              <h1>Run the mystery. Track the cost.</h1>
              <strong>The rules should support the dread—not interrupt it.</strong>
              <span>A verified Investigator and Keeper workspace with investigation flow, combat procedures, Sanity, healing, magic, advancement, original dossiers, and visible source boundaries.</span>
              <div className="coc-button-row coc-button-row--hero">
                <button className="coc-roll-button" type="button" onClick={() => setActivePage("investigation")}>Run an investigation</button>
                <button type="button" onClick={() => setActivePage("combat")}>Open combat desk</button>
              </div>
            </div>
            <div className="coc-hero__seal" aria-hidden="true"><span>◉</span><small>CASE FILE ACTIVE</small></div>
          </section>

          <section className="coc-section">
            <header className="coc-section__heading"><small>Try the core mechanic</small><h2>Resolve a percentile check</h2><p>Set the skill and difficulty, then apply any net Bonus or Penalty dice.</p></header>
            <CocPercentileCard />
          </section>

          <section className="coc-section coc-section--index">
            <header className="coc-section__heading"><small>Keeper and Investigator desks</small><h2>Open the part of the case you need now.</h2></header>
            <div className="coc-index-grid coc-index-grid--expanded">
              <button type="button" onClick={() => setActivePage("rules")}><small>Start here</small><strong>Rules Guide</strong><span>Twenty-six verified table procedures in play order.</span></button>
              <button type="button" onClick={() => setActivePage("investigation")}><small>Case flow</small><strong>Investigation</strong><span>Clues, research, complications, opposition clocks, and scene closure.</span></button>
              <button type="button" onClick={() => setActivePage("investigator")}><small>Player procedures</small><strong>Investigator File</strong><span>Checks, Sanity, injury, healing, and skill advancement.</span></button>
              <button type="button" onClick={() => setActivePage("keeper")}><small>Session command</small><strong>Keeper Desk</strong><span>Mystery spine, NPC pressure points, contested action, and campaign records.</span></button>
              <button type="button" onClick={() => setActivePage("combat")}><small>Danger procedures</small><strong>Combat Desk</strong><span>DEX order, maneuvers, outnumbering, firearms, wounds, treatment, and escape.</span></button>
              <button type="button" onClick={() => setActivePage("accuracy")}><small>Trust boundary</small><strong>Sources &amp; Licensing</strong><span>See what is verified, original, open, or deliberately excluded.</span></button>
            </div>
          </section>
        </>
      )}

      {activePage === "rules" && <CocRulesGuide />}

      {activePage === "investigation" && (
        <section className="coc-section coc-section--page">
          <header className="coc-section__heading"><small>Investigation operating procedure</small><h1>Keep the case moving without giving away the answer.</h1><p>Essential information advances the mystery. Rolls decide cost, quality, exposure, speed, and danger.</p></header>
          <ReferenceGrid items={investigationFlow} label="Investigation scene flow" />
        </section>
      )}

      {activePage === "investigator" && (
        <section className="coc-section coc-section--page">
          <header className="coc-section__heading"><small>Investigator workspace</small><h1>Keep the procedures used under pressure in one place.</h1><p>Resolve the roll, apply the cost, and record what changed without searching through the Keeper's notes.</p></header>
          <div className="coc-procedure-grid">
            <CocPercentileCard eyebrow="Investigator skill file" title="Active Skill Check" />
            <CocSanityCard />
            <CocInjuryCard />
            <CocHealingCard />
            <CocImprovementCard />
          </div>
          <QuickReferenceGrid />
        </section>
      )}

      {activePage === "keeper" && (
        <section className="coc-section coc-section--page">
          <header className="coc-section__heading"><small>Keeper workspace</small><h1>Run the session from one case desk.</h1><p>Prepare the truth, essential leads, opposition clock, NPC pressure points, and records that must survive the session.</p></header>
          <ReferenceGrid items={keeperRunSheet} label="Keeper session run sheet" />
          <div className="coc-section__subheading"><small>Contested action</small><h2>When someone actively resists</h2></div>
          <div className="coc-procedure-grid"><CocOpposedCard /><CocCombatProcedureCard /></div>
          <QuickReferenceGrid />
          <div className="coc-section__subheading"><small>Original sample dossier</small><h2>Combat-ready threat reference</h2></div>
          <CocCreatureDossier creature={cocPreviewCreature} />
        </section>
      )}

      {activePage === "combat" && (
        <section className="coc-section coc-section--page">
          <header className="coc-section__heading"><small>Combat operating procedure</small><h1>Make violence fast, dangerous, and escapable.</h1><p>Establish DEX order, resolve one intent at a time, and keep reactions, HP, Major Wounds, dying, cover, ammunition, and treatment visible.</p></header>
          <ReferenceGrid items={combatRunSheet} label="Combat run sheet" />
          <div className="coc-procedure-grid">
            <CocCombatProcedureCard />
            <CocOpposedCard />
            <CocFirearmProcedureCard />
            <CocInjuryCard />
            <CocHealingCard />
          </div>
        </section>
      )}

      {activePage === "creatures" && (
        <section className="coc-section coc-section--page">
          <header className="coc-section__heading"><small>Combat-ready Keeper folio</small><h1>Every number needed when it reaches the light.</h1><p>The sample is original demonstration content rather than copied official statistics.</p></header>
          <CocCreatureDossier creature={cocPreviewCreature} />
        </section>
      )}

      {activePage === "weapons" && (
        <section className="coc-section coc-section--page">
          <header className="coc-section__heading"><small>Firearm procedures and weapon cards</small><h1>Evidence that fires back.</h1><p>Calculate point blank, cover, multiple shots, net dice, ammunition, and the target's lost attack before resolving each shot.</p></header>
          <div className="coc-procedure-grid"><CocFirearmProcedureCard /><CocWeaponCard weapon={cocPreviewWeapon} /></div>
        </section>
      )}

      {activePage === "spells" && (
        <section className="coc-section coc-section--page">
          <header className="coc-section__heading"><small>Verified magic procedure and original ritual</small><h1>Track the cost before opening the door.</h1><p>The procedure card handles first casting, pushed casting, MP overflow, and timing. The invented ritual demonstrates resource tracking without copying an official spell.</p></header>
          <div className="coc-procedure-grid"><CocMagicProcedureCard /><CocSpellCard spell={cocPreviewSpell} /></div>
          <div className="coc-legal-note"><strong>Occult-content boundary</strong><p>Public rituals must be original, creator-submitted, public-domain, or licensed for reuse. Paid rulebook spell text is not imported into DM Forge.</p></div>
        </section>
      )}

      {activePage === "accuracy" && <CocRulesAudit />}

      <footer className="coc-footer">
        <strong>Unofficial, noncommercial fan toolkit.</strong>
        <span>Call of Cthulhu is a trademark of Chaosium Inc. Original summaries and demonstration content only; paid rulebook text, official scenarios, logos, artwork, and proprietary statistics are not reproduced.</span>
      </footer>
    </main>
  );
};
