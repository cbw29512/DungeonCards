import type { ReactNode } from "react";
import { cocPreviewCreature, cocPreviewSpell, cocPreviewWeapon } from "../../data/cocPreviewCatalog";
import { cocCombatRunSheet } from "../../data/cocCombatRunSheet";
import { cocInvestigationRunSheet } from "../../data/cocInvestigationRunSheet";
import { cocKeeperRunSheet } from "../../data/cocKeeperRunSheet";
import type { CocAppPage } from "../../integration/dmForgeRoute";
import { CocCardCatalog } from "../CocCardCatalog";
import { CocCombatProcedureCard } from "../CocCombatProcedureCard";
import { CocCreatureDossier } from "../CocCreatureDossier";
import { CocCreatureLibrary } from "../CocCreatureLibrary";
import { CocFirearmProcedureCard } from "../CocFirearmProcedureCard";
import { CocHealingCard } from "../CocHealingCard";
import { CocImprovementCard } from "../CocImprovementCard";
import { CocInjuryCard } from "../CocInjuryCard";
import { CocInvestigatorBuilder } from "../CocInvestigatorBuilder";
import { CocMagicProcedureCard } from "../CocMagicProcedureCard";
import { CocOpposedCard } from "../CocOpposedCard";
import { CocPercentileCard } from "../CocPercentileCard";
import { CocRulesAudit } from "../CocRulesAudit";
import { CocRulesGuide } from "../CocRulesGuide";
import { CocSanityCard } from "../CocSanityCard";
import { CocSpellCard } from "../CocSpellCard";
import { CocWeaponCard } from "../CocWeaponCard";
import { PrivateCardLibraryWorkspace } from "../cardPlatform/PrivateCardLibraryWorkspace";
import { CocHome } from "./CocHome";
import { CocQuickReferenceGrid, CocReferenceGrid } from "./CocReferenceGrid";

const Page = ({ eyebrow, title, summary, children }: { eyebrow: string; title: string; summary: string; children: ReactNode }) => (
  <section className="coc-section coc-section--page">
    <header className="coc-section__heading"><small>{eyebrow}</small><h1>{title}</h1><p>{summary}</p></header>
    {children}
  </section>
);

export const CocPageContent = ({
  activePage,
  onNavigate
}: {
  activePage: CocAppPage;
  onNavigate(page: CocAppPage): void;
}) => {
  if (activePage === "home") return <CocHome onNavigate={onNavigate} />;
  if (activePage === "rules") return <CocRulesGuide />;
  if (activePage === "catalog") return <CocCardCatalog onNavigate={onNavigate} />;
  if (activePage === "library") return <PrivateCardLibraryWorkspace gameSystemId="coc-7e" />;
  if (activePage === "investigator") return (
    <Page eyebrow="Investigator workspace" title="Keep pressure procedures in one card library." summary="Resolve the roll, apply the cost, and record what changed without opening Keeper notes.">
      <div className="coc-procedure-grid"><CocPercentileCard eyebrow="Investigator skill file" title="Active Skill Check" /><CocSanityCard /><CocInjuryCard /><CocHealingCard /><CocImprovementCard /></div>
      <CocQuickReferenceGrid />
    </Page>
  );
  if (activePage === "keeper") return (
    <Page eyebrow="Keeper workspace" title="Run the case from one desk." summary="Prepare the truth, essential leads, opposition clock, NPC pressure points, and records that survive the session.">
      <CocReferenceGrid items={cocKeeperRunSheet} label="Keeper session run sheet" />
      <div className="coc-section__subheading"><small>Investigation flow</small><h2>Keep the case moving without giving away the answer.</h2></div>
      <CocReferenceGrid items={cocInvestigationRunSheet} label="Investigation scene flow" />
      <div className="coc-procedure-grid"><CocOpposedCard /><CocCombatProcedureCard /></div>
      <CocQuickReferenceGrid />
      <CocCreatureDossier creature={cocPreviewCreature} />
    </Page>
  );
  if (activePage === "equipment") return (
    <Page eyebrow="Equipment cards" title="Evidence that fires back." summary="Keep firearms, weapons, ammunition, wounds, treatment, and recovery in one routed library.">
      <div className="coc-procedure-grid"><CocFirearmProcedureCard /><CocWeaponCard weapon={cocPreviewWeapon} /><CocInjuryCard /><CocHealingCard /></div>
    </Page>
  );
  if (activePage === "spells") return (
    <Page eyebrow="Spells & rituals" title="Track the cost before opening the door." summary="Handle first casting, pushed attempts, Magic Points, overflow, timing, and original rituals.">
      <div className="coc-procedure-grid"><CocMagicProcedureCard /><CocSpellCard spell={cocPreviewSpell} /></div>
      <div className="coc-legal-note"><strong>Occult-content boundary</strong><p>Public rituals must be original, creator-submitted, public-domain, or licensed for reuse.</p></div>
    </Page>
  );
  if (activePage === "creatures") return (
    <Page eyebrow="Original creature library" title="A complete Keeper-facing roster without copied sourcebook monsters." summary="Search original human adversaries, altered animals, unnatural creatures, and major entities. Open any dossier for live attacks, HP, Magic Points, Dodge, Sanity loss, and printable Keeper notes.">
      <CocCreatureLibrary />
    </Page>
  );
  if (activePage === "encounters") return (
    <Page eyebrow="Encounter operating procedure" title="Make violence fast, dangerous, and escapable." summary="Establish DEX order and keep reactions, wounds, cover, ammunition, treatment, and escape visible.">
      <CocReferenceGrid items={cocCombatRunSheet} label="Combat run sheet" />
      <div className="coc-procedure-grid"><CocCombatProcedureCard /><CocOpposedCard /><CocFirearmProcedureCard /><CocInjuryCard /><CocHealingCard /></div>
    </Page>
  );
  if (activePage === "builders") return <CocInvestigatorBuilder />;
  return <CocRulesAudit />;
};
