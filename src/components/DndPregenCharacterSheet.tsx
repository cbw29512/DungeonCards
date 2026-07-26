import { useState } from "react";
import { DndVaultActions } from "./dndCharacterVault/DndVaultActions";
import { DndVaultBuildGuide } from "./dndCharacterVault/DndVaultBuildGuide";
import { DndVaultFeatures } from "./dndCharacterVault/DndVaultFeatures";
import { DndVaultInventory } from "./dndCharacterVault/DndVaultInventory";
import { DndVaultSpells } from "./dndCharacterVault/DndVaultSpells";
import { DndVaultSummary } from "./dndCharacterVault/DndVaultSummary";
import type { DndCharacterRecord } from "../types/dndCharacter";
import type { DndOptimizedBuildProfile } from "../types/dndCharacterVault";

type VaultTabId = "actions" | "spells" | "features" | "inventory" | "notes" | "build";

const tabs: Array<{ id: VaultTabId; label: string }> = [
  { id: "actions", label: "Actions" },
  { id: "spells", label: "Spells" },
  { id: "features", label: "Features" },
  { id: "inventory", label: "Inventory" },
  { id: "notes", label: "Notes" },
  { id: "build", label: "Build Guide" }
];

export const DndPregenCharacterSheet = ({
  record,
  profile,
  signedIn = false,
  onSave
}: {
  record: DndCharacterRecord;
  profile?: DndOptimizedBuildProfile;
  signedIn?: boolean;
  onSave?: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<VaultTabId>("actions");
  const status = profile ? "Vault Ready" : "Ready to play";

  const panelClass = (tab: VaultTabId): string => (
    `character-vault__panel${activeTab === tab ? " is-active" : ""}`
  );

  return (
    <article className="character-vault" aria-labelledby={`character-vault-${record.id}`}>
      <header className="character-vault__header">
        <div className="character-vault__portrait" aria-hidden="true">
          <span>{record.name.slice(0, 1).toUpperCase()}</span>
        </div>
        <div className="character-vault__identity">
          <p>{record.ruleset === "srd-5.1-2014" ? "2014 / SRD 5.1" : "2024 / SRD 5.2.1"} · {status}</p>
          <h3 id={`character-vault-${record.id}`}>{record.name}</h3>
          <span>Level {record.level} {record.species} {record.className} · {record.subclassName}</span>
          <small>{record.background}</small>
        </div>
        <div className="character-vault__header-actions">
          <button disabled={!signedIn || !onSave} onClick={onSave} type="button">
            {signedIn ? "Save character" : "Sign in to save"}
          </button>
          <button onClick={() => window.print()} type="button">Print packet</button>
        </div>
      </header>

      <DndVaultSummary record={record} />

      <nav className="character-vault__tabs" aria-label="Character sheet sections" role="tablist">
        {tabs.map((tab) => (
          <button
            aria-controls={`vault-panel-${tab.id}`}
            aria-selected={activeTab === tab.id}
            id={`vault-tab-${tab.id}`}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            tabIndex={activeTab === tab.id ? 0 : -1}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section aria-hidden={activeTab !== "actions"} aria-labelledby="vault-tab-actions" className={panelClass("actions")} id="vault-panel-actions" role="tabpanel">
        <DndVaultActions record={record} />
      </section>
      <section aria-hidden={activeTab !== "spells"} aria-labelledby="vault-tab-spells" className={panelClass("spells")} id="vault-panel-spells" role="tabpanel">
        <DndVaultSpells record={record} />
      </section>
      <section aria-hidden={activeTab !== "features"} aria-labelledby="vault-tab-features" className={panelClass("features")} id="vault-panel-features" role="tabpanel">
        <DndVaultFeatures record={record} />
      </section>
      <section aria-hidden={activeTab !== "inventory"} aria-labelledby="vault-tab-inventory" className={panelClass("inventory")} id="vault-panel-inventory" role="tabpanel">
        <DndVaultInventory profile={profile} record={record} />
      </section>
      <section aria-hidden={activeTab !== "notes"} aria-labelledby="vault-tab-notes" className={panelClass("notes")} id="vault-panel-notes" role="tabpanel">
        <section className="character-vault__card">
          <h4>Quick-play notes</h4>
          <ul>{record.notes.map((note) => <li key={note}>{note}</li>)}</ul>
        </section>
      </section>
      <section aria-hidden={activeTab !== "build"} aria-labelledby="vault-tab-build" className={panelClass("build")} id="vault-panel-build" role="tabpanel">
        <DndVaultBuildGuide profile={profile} record={record} />
      </section>

      <footer className="character-vault__sources">
        <h4>Sources</h4>
        {record.sources.map((source) => (
          <a href={source.url} key={`${source.label}-${source.url}`} rel="noreferrer" target="_blank">{source.label}</a>
        ))}
      </footer>
    </article>
  );
};
