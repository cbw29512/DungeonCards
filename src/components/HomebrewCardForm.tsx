import type { RulesetId } from "../types/ruleCards";
import type { useHomebrewCardDraft } from "../hooks/useHomebrewCardDraft";

type Controller = ReturnType<typeof useHomebrewCardDraft>;

type Props = {
  controller: Controller;
  ruleset: RulesetId;
  storageError: string | null;
  onRulesetChange(ruleset: RulesetId): void;
};

export const HomebrewCardForm = ({
  controller,
  ruleset,
  storageError,
  onRulesetChange
}: Props) => (
  <form className="homebrew-form" onSubmit={controller.submit}>
    <label>
      D&amp;D edition
      <select
        aria-label="Homebrew card edition"
        onChange={(event) => onRulesetChange(event.target.value as RulesetId)}
        value={ruleset}
      >
        <option value="srd-5.1-2014">2014 / SRD 5.1</option>
        <option value="srd-5.2.1-2024">2024 / SRD 5.2.1</option>
      </select>
      <small>The saved card belongs only to this edition’s library.</small>
    </label>

    <label>
      Card name
      <input
        maxLength={60}
        onChange={(event) => controller.setName(event.target.value)}
        placeholder="Rage Greataxe"
        required
        value={controller.name}
      />
    </label>

    <label>
      Dice formula
      <input
        maxLength={60}
        onChange={(event) => controller.setFormula(event.target.value)}
        placeholder="1d12+7"
        required
        value={controller.formula}
      />
      <small>Examples: 1d20+8, 2d6+4, 10d6, 4d6kh3</small>
    </label>

    <label>
      Card icon
      <input
        maxLength={16}
        onChange={(event) => controller.setImageEmoji(event.target.value)}
        placeholder="⚔️"
        value={controller.imageEmoji}
      />
    </label>

    <label className="homebrew-form__description">
      Description
      <textarea
        maxLength={180}
        onChange={(event) => controller.setDescription(event.target.value)}
        placeholder="Greataxe damage with 20 Strength and a +2 Rage damage bonus."
        required
        rows={4}
        value={controller.description}
      />
    </label>

    <label className="homebrew-form__checkbox">
      <input
        checked={controller.usesAttackOutcomes}
        onChange={(event) => controller.setUsesAttackOutcomes(event.target.checked)}
        type="checkbox"
      />
      Apply D&amp;D attack-roll natural 20 and natural 1 outcomes
    </label>

    {(controller.formError || storageError) && (
      <p className="form-error" role="alert">
        {controller.formError ?? storageError}
      </p>
    )}

    <button className="primary-button" type="submit">Save Homebrew Card</button>
  </form>
);
