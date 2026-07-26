import type { DndCharacterRecord } from "../../types/dndCharacter";

export const DndVaultFeatures = ({ record }: { record: DndCharacterRecord }) => (
  <div className="character-vault__panel-grid">
    <section className="character-vault__card">
      <h4>{record.className} features</h4>
      <ul>{record.classFeatures.map((feature) => <li key={feature}>{feature}</li>)}</ul>
    </section>

    <section className="character-vault__card">
      <h4>{record.subclassName} features</h4>
      {record.subclassFeatures.length > 0
        ? <ul>{record.subclassFeatures.map((feature) => <li key={feature}>{feature}</li>)}</ul>
        : <p>The subclass path begins at level {record.subclassUnlockLevel}.</p>}
    </section>

    <section className="character-vault__card">
      <h4>Advancement choices</h4>
      {record.advancementChoices.length > 0
        ? <ul>{record.advancementChoices.map((choice) => <li key={choice}>{choice}</li>)}</ul>
        : <p>No level-earned ability or feat choice yet.</p>}
    </section>

    <section className="character-vault__card">
      <h4>Proficiencies</h4>
      <dl className="character-vault__definition-list">
        <div><dt>Tools</dt><dd>{record.toolProficiencies.join(", ") || "None"}</dd></div>
        <div><dt>Languages</dt><dd>{record.languages.join(", ")}</dd></div>
      </dl>
    </section>
  </div>
);
