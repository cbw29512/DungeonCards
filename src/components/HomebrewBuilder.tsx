import { useState } from "react";
import type { FormEvent } from "react";
import type { HomebrewCardDraft } from "../types/cards";
import { validateDiceFormula } from "../utils/rollDice";

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
        <h2 id="homebrew-builder-title">Build the card you actually use.</h2>
        <span>Create a reusable action card, validate its dice, and save it in this browser.</span>
      </div>

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
            maxLength={30}
            onChange={(event) => setFormula(event.target.value)}
            placeholder="1d12+7"
            required
            value={formula}
          />
          <small>Examples: 1d20+8, 2d6+4, 10d6</small>
        </label>

        <label>
          Card icon
          <input
            maxLength={8}
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
          Treat a single d20 as an attack roll with natural 20 and natural 1 markers
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
    </section>
  );
};
