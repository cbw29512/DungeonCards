import type { RuleCard } from "../types/ruleCards";
import { RULESET_LABELS } from "../types/ruleCards";
import type { useRuleCardState } from "../hooks/useRuleCardState";
import { RuleCardSecondaryControls } from "./RuleCardSecondaryControls";
import { RuleCardStepper } from "./RuleCardStepper";
import {
  RuleCardWorkspaceActions,
  type WorkspaceCardControls
} from "./RuleCardWorkspaceActions";

type RuleCardController = ReturnType<typeof useRuleCardState>;

type RuleCardFrontProps = {
  card: RuleCard;
  controller: RuleCardController;
  workspaceControls?: WorkspaceCardControls;
};

export const RuleCardFront = ({
  card,
  controller,
  workspaceControls
}: RuleCardFrontProps) => {
  const {
    rulesets, ruleset, variant, mode, choiceId, secondaryChoiceId,
    slotLevel, characterLevel, modifier, secondaryModifier, advantageMode,
    formula, secondaryFormula, scaleBounds, changeRuleset, changeMode,
    setChoiceId, setSecondaryChoiceId, setSlotLevel, setCharacterLevel,
    setModifier, setSecondaryModifier, setAdvantageMode, roll
  } = controller;
  const scaling = mode.scaling ?? mode.secondaryRoll?.scaling;

  return (
    <section className="rule-card__face rule-card__front" aria-hidden={controller.isFlipped}>
      <header className="rule-card__header">
        <span className="rule-card__emoji" aria-hidden="true">{card.imageEmoji}</span>
        <div>
          <small>{card.kind.replaceAll("-", " ")}</small>
          <h3>{card.name}</h3>
        </div>
        <span className={`source-badge source-badge--${variant.source}`}>{variant.source}</span>
      </header>

      {workspaceControls && (
        <RuleCardWorkspaceActions cardName={card.name} controls={workspaceControls} />
      )}

      {rulesets.length > 1 && (
        <div className="rule-toggle" aria-label={`${card.name} ruleset`} role="group">
          {rulesets.map((option) => (
            <button
              aria-pressed={ruleset === option}
              key={option}
              onClick={() => changeRuleset(option)}
              type="button"
            >
              {RULESET_LABELS[option]}
            </button>
          ))}
        </div>
      )}

      <p className="rule-card__summary" title={variant.detail}>{variant.summary}</p>

      {variant.modes.length > 1 && (
        <label className="rule-field">
          <span>Roll</span>
          <select value={mode.id} onChange={(event) => changeMode(event.target.value)}>
            {variant.modes.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>{candidate.label}</option>
            ))}
          </select>
        </label>
      )}

      {mode.choices && mode.choices.length > 1 && (
        <label className="rule-field">
          <span>Option</span>
          <select value={choiceId} onChange={(event) => setChoiceId(event.target.value)}>
            {mode.choices.map((choice) => (
              <option key={choice.id} value={choice.id}>{choice.label}</option>
            ))}
          </select>
        </label>
      )}

      {scaling?.kind === "slot-dice" && (
        <RuleCardStepper
          label="Slot"
          maximum={scaleBounds[1]}
          minimum={scaleBounds[0]}
          onChange={setSlotLevel}
          value={slotLevel}
        />
      )}

      {scaling?.kind === "character-formula" && (
        <RuleCardStepper
          label="Level"
          maximum={scaleBounds[1]}
          minimum={scaleBounds[0]}
          onChange={setCharacterLevel}
          value={characterLevel}
        />
      )}

      {mode.modifierControl && (
        <RuleCardStepper
          label={mode.modifierControl.label}
          maximum={mode.modifierControl.maximum}
          minimum={mode.modifierControl.minimum}
          onChange={setModifier}
          value={modifier}
        />
      )}

      {mode.allowsAdvantage && (
        <label className="rule-field">
          <span>d20</span>
          <select
            value={advantageMode}
            onChange={(event) => setAdvantageMode(event.target.value as typeof advantageMode)}
          >
            <option value="normal">Normal</option>
            <option value="advantage">Advantage</option>
            <option value="disadvantage">Disadvantage</option>
          </select>
        </label>
      )}

      {mode.secondaryRoll && (
        <RuleCardSecondaryControls
          choiceId={secondaryChoiceId}
          modifier={secondaryModifier}
          onChoiceChange={setSecondaryChoiceId}
          onModifierChange={setSecondaryModifier}
          part={mode.secondaryRoll}
        />
      )}

      <div className="rule-card__formula">
        <span>{secondaryFormula ? `${formula} → ${secondaryFormula}` : formula}</span>
        <button className="rule-card__roll" onClick={roll} type="button">
          {secondaryFormula ? "Quick Roll" : "Roll"}
        </button>
      </div>

      <footer title={variant.sourceReference}>
        {RULESET_LABELS[ruleset]} • {variant.source === "srd" ? "SRD" : "Homebrew"}
      </footer>
    </section>
  );
};