import type {
  DndOptimizedBuildProfile,
  DndSavedCharacterState
} from "../../types/dndCharacterVault";

type Props = {
  character: DndSavedCharacterState;
  profile: DndOptimizedBuildProfile;
  onChange(character: DndSavedCharacterState): void;
};

const bounded = (value: string, maximum: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(maximum, Math.trunc(parsed))) : 0;
};

export const DndSavedCharacterItemEditor = ({ character, profile, onChange }: Props) => {
  const setCharges = (id: string, remaining: number) => onChange({
    ...character,
    itemChargeState: { ...character.itemChargeState, [id]: remaining }
  });
  const setAttuned = (id: string, attuned: boolean) => onChange({
    ...character,
    attunedItemIds: attuned
      ? [...character.attunedItemIds, id]
      : character.attunedItemIds.filter((itemId) => itemId !== id)
  });
  const attunementFull = character.attunedItemIds.length >= 3;

  return (
    <fieldset className="saved-character-editor__section">
      <legend>Magic items</legend>
      {profile.magicItems.length === 0 && (
        <p className="saved-character-editor__empty">No Vault magic items are assigned at this level.</p>
      )}
      {profile.magicItems.map((item) => {
        const attuned = character.attunedItemIds.includes(item.id);
        return (
          <article className="saved-character-editor__item" key={item.id}>
            <header><strong>{item.name}</strong><span>{item.rarity.replace("-", " ")}</span></header>
            {item.maximumCharges !== undefined && (
              <label>
                <span>Charges remaining</span>
                <input
                  max={item.maximumCharges}
                  min={0}
                  onChange={(event) => setCharges(item.id, bounded(event.target.value, item.maximumCharges as number))}
                  type="number"
                  value={character.itemChargeState[item.id] ?? 0}
                />
                <small>Maximum {item.maximumCharges}{item.recharge ? ` · ${item.recharge}` : ""}</small>
              </label>
            )}
            {item.requiresAttunement && (
              <label className="saved-character-editor__check">
                <input
                  checked={attuned}
                  disabled={!attuned && attunementFull}
                  onChange={(event) => setAttuned(item.id, event.target.checked)}
                  type="checkbox"
                />
                <span>Attuned</span>
              </label>
            )}
          </article>
        );
      })}
      <small className="saved-character-editor__attunement">
        Attunement slots: {character.attunedItemIds.length} / 3
      </small>
    </fieldset>
  );
};
