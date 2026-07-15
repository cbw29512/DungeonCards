import type { AdvantageMode } from "../types/ruleCards";

type RuleCardAdvantageControlsProps = {
  cardName: string;
  mode: AdvantageMode;
  onChange: (mode: AdvantageMode) => void;
};

const options: Array<{ id: AdvantageMode; label: string }> = [
  { id: "normal", label: "Normal" },
  { id: "advantage", label: "ADV ↑" },
  { id: "disadvantage", label: "DIS ↓" }
];

export const RuleCardAdvantageControls = ({
  cardName,
  mode,
  onChange
}: RuleCardAdvantageControlsProps) => {
  const changeMode = (nextMode: AdvantageMode) => {
    try {
      onChange(nextMode);
    } catch (error) {
      console.error("Changing roll-side advantage mode failed", {
        cardName,
        nextMode,
        error
      });
    }
  };

  return (
    <div
      aria-label={`${cardName} roll mode`}
      className="rule-advantage-controls"
      role="group"
    >
      {options.map((option) => (
        <button
          aria-pressed={mode === option.id}
          key={option.id}
          onClick={() => changeMode(option.id)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
