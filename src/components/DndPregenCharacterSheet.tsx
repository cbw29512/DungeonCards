import { useState } from "react";
import type { DndCharacterRecord } from "../types/dndCharacter";
import type {
  DndOptimizedBuildProfile,
  DndSavedCharacterState
} from "../types/dndCharacterVault";
import { isDndCharacterVaultReady } from "../utils/dndCharacterVaultValidation";
import { DndVaultActions } from "./dndCharacterVault/DndVaultActions";
import { DndVaultBuildGuide } from "./dndCharacterVault/DndVaultBuildGuide";
import { DndVaultCardDeck } from "./dndCharacterVault/DndVaultCardDeck";
import { DndVaultFeatures } from "./dndCharacterVault/DndVaultFeatures";
import { DndVaultInventory } from "./dndCharacterVault/DndVaultInventory";
import { DndVaultSpells } from "./dndCharacterVault/DndVaultSpells";
import { DndVaultSummary } from "./dndCharacterVault/DndVaultSummary";

type VaultTabId = "actions" | "cards" | "spells" | "features" | "inventory" | "notes" | "build";

const tabs: Array<{ id: VaultTabId; label: string }> = [
  { id: "actions", label: "Actions" },
  { id: "cards", label: "Cards" },
  { id: "spells", label: "Spells" },
  { id: "features", label: "Features" },
  { id: "inventory", label: "Inventory" },
  { id: "notes", label: "Notes" },
  { id: "build", label: "Build Guide" }
];

type Props = {
  record: DndCharacterRecord;
  profile?: DndOptimizedBuildProfile;
  savedState?: DndSavedCharacterState;
  signedIn?: boolean;
  saveLabel?: string;
  onSave?: () => void;
};

export const DndPregenCharacterSheet = ({
  record,
  profile,
  savedState,
  signedIn = false,
  saveLabel = "Save character",
  onSave
}: Props) => {
  const [activeTab, setActiveTab] = useState<VaultTabId>("actions");
  const vaultReady = profile ? isDndCharacterVaultReady(profile) : false;
  const panelClass = (tab: VaultTabId): string => `character-vault__panel${activeTab === tab ? " is-active" : ""}`;
  const displayName = savedState?.displayName ?? record.name;

  const moveTab = (direction: number) => {
    const current = tabs.findIndex((tab) => tab.id === activeTab);
    const next = (current + direction + tabs.length) % tabs.length;
    setActiveTab(tabs[next].id);
  };

  return (
    <article className="character-vault" aria-labelledby={`character-vault-${record.id}`}>
      <header className="character-vault__header">
        <div className="character-vault__portrait" aria-hidden="true"><span>{displayName.slice(0, 1).toUpperCase()}</span></div>
        <div className="character-vault__identity">
          <p>{record.ruleset === "srd-5.1-2014" ? "2014 / SRD 5.1" : "2024 / SRD 5.2.1"} · {savedState ? "Saved Play Mode" : vaultReady ? "Vault Ready" : "Ready to play"}</p>
          <h3 id={`character-vault-${record.id}`}>{displayName}</h3>
          <span>Level {record.level} {record.species} {record.className} · {record.subclassName}</span>
          <small>{record.background}</small>
        </div>
        <div className="character-vault__header-actions">
          <button disabled={!signedIn || !onSave} onClick={onSave} type="button">{signedIn ? saveLabel : "Sign in to save"}</button>
          <button onClick={() => window.print()} type="button">Print packet</button>
        </div>
      </header>

      <DndVaultSummary record={record} savedState={savedState} />

      <nav className="character-vault__tabs" aria-label="Character sheet sections" role="tablist">
        {tabs.map((tab) => (
          <button
            aria-controls={`vault-panel-${tab.id}`}
            aria-selected={activeTab === tab.id}
            id={`vault-tab-${tab.id}`}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") moveTab(1);
              if (event.key === "ArrowLeft") moveTab(-1);
              if (event.key === "Home") setActiveTab(tabs[0].id);
              if (event.key === "End") setActiveTab(tabs[tabs.length - 1].id);
            }}
            role="tab"
            tabIndex={activeTab === tab.id ? 0 : -1}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section aria-hidden={activeTab !== "actions"} aria-labelledby="vault-tab-actions" className={panelClass("actions")} id="vault-panel-actions" role="tabpanel"><DndVaultActions record={record} savedState={savedState} /></section>
      <section aria-hidden={activeTab !== "cards"} aria-labelledby="vault-tab-cards" className={panelClass("cards")} id="vault-panel-cards" role="tabpanel">{profile ? <DndVaultCardDeck profile={profile} /> : <p>Generated cards require a Vault Ready build profile.</p>}</section>
      <section aria-hidden={activeTab !== "spells"} aria-labelledby="vault-tab-spells" className={panelClass("spells")} id="vault-panel-spells" role="tabpanel"><DndVaultSpells record={record} savedState={savedState} /></section>
      <section aria-hidden={activeTab !== "features"} aria-labelledby="vault-tab-features" className={panelClass("features")} id="vault-panel-features" role="tabpanel"><DndVaultFeatures record={record} /></section>
      <section aria-hidden={activeTab !== "inventory"} aria-labelledby="vault-tab-inventory" className={panelClass("inventory")} id="vault-panel-inventory" role="tabpanel"><DndVaultInventory profile={profile} record={record} savedState={savedState} /></section>
      <section aria-hidden={activeTab !== "notes"} aria-labelledby="vault-tab-notes" className={panelClass("notes")} id="vault-panel-notes" role="tabpanel">
        <section className="character-vault__card">
          <h4>Quick-play notes</h4>
          <ul>{record.notes.map((note) => <li key={note}>{note}</li>)}</ul>
          {savedState?.customNotes && <><h4>Custom play notes</h4><p>{savedState.customNotes}</p></>}
        </section>
      </section>
      <section aria-hidden={activeTab !== "build"} aria-labelledby="vault-tab-build" className={panelClass("build")} id="vault-panel-build" role="tabpanel"><DndVaultBuildGuide profile={profile} record={record} /></section>

      <footer className="character-vault__sources">
        <h4>Sources</h4>
        {record.sources.map((source) => <a href={source.url} key={`${source.label}-${source.url}`} rel="noreferrer" target="_blank">{source.label}</a>)}
      </footer>
    </article>
  );
};
