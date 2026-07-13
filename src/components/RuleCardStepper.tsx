type RuleCardStepperProps = {
  label: string;
  value: number;
  minimum: number;
  maximum: number;
  onChange: (value: number) => void;
};

export const RuleCardStepper = ({
  label,
  value,
  minimum,
  maximum,
  onChange
}: RuleCardStepperProps) => (
  <div className="rule-stepper">
    <span>{label}</span>
    <div>
      <button
        aria-label={`Decrease ${label}`}
        disabled={value <= minimum}
        onClick={() => onChange(Math.max(minimum, value - 1))}
        type="button"
      >
        −
      </button>
      <output aria-label={label}>{value}</output>
      <button
        aria-label={`Increase ${label}`}
        disabled={value >= maximum}
        onClick={() => onChange(Math.min(maximum, value + 1))}
        type="button"
      >
        +
      </button>
    </div>
  </div>
);