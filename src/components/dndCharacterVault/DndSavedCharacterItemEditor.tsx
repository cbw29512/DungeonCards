import type { DndOptimizedBuildProfile, DndSavedCharacterState } from "../../types/dndCharacterVault";

const bounded = (value: number, maximum: number): number => (
  Math.min(maximum, Math.max(0, Math.trunc(Number.isFinite(value) ? value : 0)))
);

export const DndSavedCharacterItemEditor = ({
  profile,
  state,
  disabled,
  onChange
}: {
  profile: DndOptimizedBuildProfile;
  state: DndSavedCharacterState;
  disabled: boolean;
  onChange: (state: DndSavedCharacterState) => void;
}) => {
  const attunedCount = state.attunedItemIds.length;
  const setCharges = (itemId: string, remaining: number, maximum: number) => onChange({
    ...state,
    itemChargeState: { ...state.itemChargeState, [itemId]: bounded(remaining, maximum) }
  });
  const setAttuned = (itemId: string, attuned: boolean) => onChange({
    ...state,
    attunedItemIds: attuned
      ? [...state.attunedItemIds, itemId]
      : state.attunedItemIds.filter((id) => id !== itemId)
  });

  return (
    <section className="saved-character-editor__card" aria-labelledby="saved-items-title">
      <h3 id="saved-items-title">Magic items &amp; attunement</h3>
      <p>{attunedCount} of 3 attunement slots used.</p>
      <div className="saved-character-editor__tracker-list">
        {profile.magicItems.length === 0 && <p>No magic items are assigned at this level.</p>}
        {profile.magicItems.map((item) => {
          const attuned = state.attunedItemIds.includes(item.id);
          return (
            <article key={item.id}>
              <header><strong>{item.name}</strong><span>{item.rarity.replace("-", " ")}</span></header>
              {item.requiresAttunement && (
                <label className="saved-character-editor__check">
                  <input
                    checked={attuned}
                    disabled={disabled || (!attuned && attunedCount >= 3)}
                    onChange={(event) => setAttuned(item.id, event.target.checked)}
                    type="checkbox"
                  />
                  Attuned
                </label>
              )}
              {item.maximumCharges !== undefined && (
                <label>
                  Remaining charges
                  <input
                    disabled={disabled}
                    max={item.maximumCharges}
                    min={0}
                    onChange={(event) => setCharges(item.id, Number(event.target.value), item.maximumCharges as number)}
                    type="number"
                    value={state.itemChargeState[item.id] ?? item.maximumCharges}
                  />
                </label>
              )}
              <small>{item.effectSummary}{item.recharge ? ` · ${item.recharge}` : ""}</small>
            </article>
          );
        })}
      </div>
    </section>
  );
};
