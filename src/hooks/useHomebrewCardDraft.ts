import { useMemo, useState, type FormEvent } from "react";
import type {
  DiceCard,
  HomebrewCardDraft
} from "../types/cards";
import type { RulesetId } from "../types/ruleCards";
import { gameSystemIdForRuleset } from "../utils/cardPlatformGameSystem";
import { isSinglePositiveD20Formula } from "../utils/diceParser";
import { validateDiceFormula } from "../utils/rollDice";

type Options = {
  ruleset: RulesetId;
  onCreate(draft: HomebrewCardDraft): boolean;
};

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "The card could not be created.";

export const useHomebrewCardDraft = ({ ruleset, onCreate }: Options) => {
  const [name, setName] = useState("");
  const [formula, setFormula] = useState("1d20+5");
  const [description, setDescription] = useState("");
  const [imageEmoji, setImageEmoji] = useState("✨");
  const [usesAttackOutcomes, setUsesAttackOutcomes] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const previewCard = useMemo<DiceCard>(() => ({
    id: "homebrew-live-preview",
    name: name.trim() || "Your Card Name",
    category: "homebrew",
    formula: formula.trim() || "1d20",
    description: description.trim() || "Your rules text appears here while you build the card.",
    imageEmoji: imageEmoji.trim() || "✨",
    critOn: usesAttackOutcomes ? 20 : undefined,
    failOn: usesAttackOutcomes ? 1 : undefined,
    isFavorite: false
  }), [description, formula, imageEmoji, name, usesAttackOutcomes]);

  const reset = () => {
    setName("");
    setFormula("1d20+5");
    setDescription("");
    setImageEmoji("✨");
    setUsesAttackOutcomes(false);
    setFormError(null);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const draft = {
        gameSystemId: gameSystemIdForRuleset(ruleset),
        name: name.trim(),
        formula: formula.trim(),
        description: description.trim(),
        imageEmoji: imageEmoji.trim() || "✨",
        critOn: usesAttackOutcomes ? 20 : undefined,
        failOn: usesAttackOutcomes ? 1 : undefined,
        isFavorite: false
      } satisfies HomebrewCardDraft;
      if (!draft.name) throw new Error("Card name is required.");
      if (!draft.description) throw new Error("Card description is required.");
      validateDiceFormula(draft.formula);
      if (usesAttackOutcomes && !isSinglePositiveD20Formula(draft.formula)) {
        throw new Error("D&D attack outcomes require exactly one positive d20 plus an optional modifier.");
      }
      if (!onCreate(draft)) throw new Error("The card was valid but could not be saved.");
      reset();
    } catch (error) {
      console.error("Submitting the homebrew form failed", { ruleset, error });
      setFormError(errorMessage(error));
    }
  };

  return {
    name, formula, description, imageEmoji, usesAttackOutcomes, formError, previewCard,
    setName, setFormula, setDescription, setImageEmoji, setUsesAttackOutcomes, submit
  };
};
