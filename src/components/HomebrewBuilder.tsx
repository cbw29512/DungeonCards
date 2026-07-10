import { useState } from "react";
import type { FormEvent } from "react";
import type { HomebrewCardDraft } from "../types/cards";
import { validateDiceFormula } from "../utils/rollDice";

type HomebrewBuilderProps = {
  onCreate: (draft: HomebrewCardDraft) => boolean;
  storageError: string | null;
};

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : "The card could not be created.";
};

export const HomebrewBuilder = ({ onCreate, storageError }: HomebrewBuilderProps) => {
  const [name, setName] = useState("");
  const [formula, setFormula] = useState("1d20+5");
  const [description, setDescription] = useState("");
  const [imageEmoji, setImageEmoji] = useState("✨");
  const [usesD20Outcomes, setUsesD20Outcomes] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setFormula("1d20+5");
    setDescription("");
    setImageEmoji("✨");
    setUsesD20Outcomes(true);
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
        critOn: usesD20Outcomes ? 20 : undefined,
        failOn: usesD20Outcomes ? 1 : undefined,
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
            placeholder="Rage Greatclub"
            value={name}
          />
        </label>

        <label>
          Dice formula
          <input
            maxLength={30}
            onChange={(event) => setFormula(event.target.value)}
            placeholder="1d12+7"
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
            placeholder="Greatclub damage with 20 Strength and Rage bonus."
            rows={4}
            value={description}
          />
        </label>

        <label className="homebrew-form__checkbox">
          <input
            checked={usesD20Outcomes}
            onChange={(event) => setUsesD20Outcomes(event.target.checked)}
            type="checkbox"
          />
          Mark natural 20 and natural 1 outcomes
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
