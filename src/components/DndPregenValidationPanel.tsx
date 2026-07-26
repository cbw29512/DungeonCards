import { dndPregenCategoryLabels } from "../data/dndPregenUi";
import type { DndCharacterValidation } from "../types/dndCharacter";

type DndPregenValidationPanelProps = {
  readiness: DndCharacterValidation;
};

export const DndPregenValidationPanel = ({ readiness }: DndPregenValidationPanelProps) => (
  <section className="pregen-library__validation" aria-labelledby="pregen-validation-title">
    <div>
      <p className="pregen-library__eyebrow">Automated promotion gate</p>
      <h4 id="pregen-validation-title">
        {readiness.completedCategories.length} of {readiness.completedCategories.length + readiness.missingCategories.length} record categories complete
      </h4>
      <p>A sheet cannot be promoted by changing a label. Its structured record must pass every category below.</p>
    </div>
    <div className="pregen-library__validation-grid">
      {[...readiness.completedCategories, ...readiness.missingCategories].map((category) => {
        const complete = readiness.completedCategories.includes(category);
        return (
          <span data-complete={complete ? "true" : "false"} key={category}>
            {complete ? "✓" : "○"} {dndPregenCategoryLabels[category] ?? category}
          </span>
        );
      })}
    </div>
    {readiness.issues.length > 0 && (
      <details>
        <summary>Show {readiness.issues.length} validation findings</summary>
        <ul>
          {readiness.issues.map((issue, index) => <li key={`${issue.category}-${index}`}>{issue.message}</li>)}
        </ul>
      </details>
    )}
  </section>
);
