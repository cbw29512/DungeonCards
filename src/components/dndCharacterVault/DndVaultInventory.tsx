import type { DndCharacterRecord } from "../../types/dndCharacter";
import type {
  DndOptimizedBuildProfile,
  DndSavedCharacterState
} from "../../types/dndCharacterVault";

export const DndVaultInventory = ({
  record,
  profile,
  savedState
}: {
  record: DndCharacterRecord;
  profile?: DndOptimizedBuildProfile;
  savedState?: DndSavedCharacterState;
}) => (
  <div className="character-vault__panel-grid">
    <section className="character-vault__card">
      <h4>Equipment</h4>
      <ul>{record.equipment.map((item) => <li key={item}>{item}</li>)}</ul>
      <p><strong>Currency:</strong> {record.currencyGp} GP</p>
    </section>

    <section className="character-vault__card">
      <h4>Magic items</h4>
      {!profile && <p>This ready-to-play sheet has not yet been migrated to the Vault v2 item policy.</p>}
      {profile && profile.magicItems.length === 0 && <p>No magic items are assigned at this level.</p>}
      {profile?.magicItems.map((item) => {
        const remainingCharges = savedState?.itemChargeState[item.id];
        const attuned = savedState
          ? savedState.attunedItemIds.includes(item.id)
          : item.attunedByDefault;
        return (
          <article className="character-vault__magic-item" key={item.id}>
            <header>
              <strong>{item.name}</strong>
              <span>
                {item.rarity.replace("-", " ")}
                {item.requiresAttunement ? ` · ${attuned ? "Attuned" : "Not attuned"}` : ""}
              </span>
            </header>
            <p>{item.effectSummary}</p>
            <small>
              {item.synergyNote}
              {item.maximumCharges !== undefined ? ` · ${remainingCharges ?? item.maximumCharges}/${item.maximumCharges} charges` : ""}
              {item.recharge ? ` · ${item.recharge}` : ""}
            </small>
          </article>
        );
      })}
    </section>
  </div>
);
