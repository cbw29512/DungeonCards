import { useState } from "react";
import type { FormEvent } from "react";
import type { DiceCard as DiceCardType, HomebrewCardDraft } from "../types/cards";
import { isSinglePositiveD20Formula } from "../utils/diceParser";
import { validateDiceFormula } from "../utils/rollDice";
import { DiceCard } from "./DiceCard";

type HomebrewBuilderProps = {
  onCreate: (draft: HomebrewCardDraft) => boolean;
  storageError: string | null;
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "The card could not be created.";

export const HomebrewBuilder = ({ onCreate, storageError }: HomebrewBuilderProps) => {
  const [name, setName] = useState("");
  const [formula, setFormula] = useState("1d20+5");
  const [description, setDescription] = useState("");
  const [imageEmoji, setImageEmoji] = useState("✨");
  const [usesAttackOutcomes, setUsesAttackOutcomes] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const previewCard: DiceCardType = {
    id: "homebrew-live-preview",
    name: name.trim() || "Your Card Name",
    category: "homebrew",
    formula: formula.trim() || "1d20",
    description: description.trim() || "Your rules text appears here while you build the card.",
    imageEmoji: imageEmoji.trim() || "✨",
    critOn: usesAttackOutcomes ? 20 : undefined,
    failOn: usesAttackOutcomes ? 1 : undefined,
    isFavorite: false
  };

  const resetForm = () => {
    setName("");
    setFormula("1d20+5");
    setDescription("");
    setImageEmoji("✨");
    setUsesAttackOutcomes(false);
    setFormError(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const trimmedName = name.trim();
      const trimmedFormula = formula.trim();
      const trimmedDescription = description.trim();
      const trimmedEmoji = imageEmoji.trim() || "✨";

      if (!trimmedName) {
        throw new Error("Card name is required.");
      }

      if (!trimmedDescription) {
        throw new Error("Card description is required.");
      }

      validateDiceFormula(trimmedFormula);

      if (usesAttackOutcomes && !isSinglePositiveD20Formula(trimmedFormula)) {
        throw new Error("D&D attack outcomes require exactly one positive d20 plus an optional modifier.");
      }

      const saved = onCreate({
        name: trimmedName,
        formula: trimmedFormula,
        description: trimmedDescription,
        imageEmoji: trimmedEmoji,
        critOn: usesAttackOutcomes ? 20 : undefined,
        failOn: usesAttackOutcomes ? 1 : undefined,
        isFavorite: false
      });

      if (!saved) {
        throw new Error("The card was valid but could not be saved.");
      }

      resetForm();
    } catch (error) {
      console.error("Submitting the homebrew form failed", { error });
      setFormError(getErrorMessage(error));
    }
  };

  return (
    <section className="homebrew-builder" aria-labelledby="homebrew-builder-title">
      <div className="section-heading">
        <p>Homebrew Builder</p>
        <h2 id="homebrew-builder-title">Build the card while looking at the card.</h2>
        <span>Every field updates the finished-size preview immediately. Save only when it looks ready for the table.</span>
      </div>

      <div className="homebrew-builder__workspace">
        <form className="homebrew-form" onSubmit={handleSubmit}>
          <label>
            Card name
            <input
              maxLength={60}
              onChange={(event) => setName(event.target.value)}
              placeholder="Rage Greataxe"
              required
              value={name}
            />
          </label>

          <label>
            Dice formula
            <input
              maxLength={60}
              onChange={(event) => setFormula(event.target.value)}
              placeholder="1d12+7"
              required
              value={formula}
            />
            <small>Examples: 1d20+8, 2d6+4, 10d6, 4d6kh3</small>
          </label>

          <label>
            Card icon
            <input
              maxLength={16}
              onChange={(event) => setImageEmoji(event.target.value)}
              placeholder="⚔️"
              value={imageEmoji}
            />
          </label>

          <label className="homebrew-form__description">
            Description
            <textarea
              maxLength={180}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Greataxe damage with 20 Strength and a +2 Rage damage bonus."
              required
              rows={4}
              value={description}
            />
          </label>

          <label className="homebrew-form__checkbox">
            <input
              checked={usesAttackOutcomes}
              onChange={(event) => setUsesAttackOutcomes(event.target.checked)}
              type="checkbox"
            />
            Apply D&D attack-roll natural 20 and natural 1 outcomes
          </label>

          {(formError || storageError) && (
            <p className="form-error" role="alert">
              {formError ?? storageError}
            </p>
          )}

          <button className="primary-button" type="submit">
            Save Homebrew Card
          </button>
        </form>

        <aside className="homebrew-live-preview" aria-labelledby="homebrew-live-preview-title">
          <div className="homebrew-live-preview__heading">
            <p>Live card preview</p>
            <h3 id="homebrew-live-preview-title">Updates as you type</h3>
            <span>This is the same card face players and DMs will use after saving.</span>
          </div>
          <div className="homebrew-live-preview__card" aria-live="polite">
            <DiceCard card={previewCard} isFlipped={false} onFlip={() => undefined} previewOnly />
          </div>
        </aside>
      </div>
    </section>
  );
};
