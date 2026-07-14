import type { RuleRollPart } from "../types/ruleCards";
import { RuleCardStepper } from "./RuleCardStepper";

type RuleCardSecondaryControlsProps = {
  part: RuleRollPart;
  choiceId?: string;
  modifier: number;
  onChoiceChange: (choiceId: string) => void;
  onModifierChange: (modifier: number) => void;
};

export const RuleCardSecondaryControls = ({
  part,
  choiceId,
  modifier,
  onChoiceChange,
  onModifierChange
}: RuleCardSecondaryControlsProps) => (
  <div className="secondary-roll-controls">
    <strong>Potential {part.label}</strong>

    {part.choices && part.choices.length > 1 && (
      <label className="rule-field">
        <span>Damage option</span>
        <select value={choiceId} onChange={(event) => onChoiceChange(event.target.value)}>
          {part.choices.map((choice) => (
            <option key={choice.id} value={choice.id}>{choice.label}</option>
          ))}
        </select>
      </label>
    )}

    {part.modifierControl && (
      <RuleCardStepper
        label={part.modifierControl.label}
        maximum={part.modifierControl.maximum}
        minimum={part.modifierControl.minimum}
        onChange={onModifierChange}
        value={modifier}
      />
    )}
  </div>
);