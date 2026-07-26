import type { DndCharacterRecord } from "../../types/dndCharacter";
import type { DndOptimizedBuildProfile } from "../../types/dndCharacterVault";

export const DndVaultBuildGuide = ({
  record,
  profile
}: {
  record: DndCharacterRecord;
  profile?: DndOptimizedBuildProfile;
}) => {
  if (!profile) {
    return (
      <section className="character-vault__card character-vault__empty-panel">
        <h4>Build migration pending</h4>
        <p>This character is ready to play under the original release gate, but its feat, magic-item, optimization, and tactics package has not yet passed the stricter Vault v2 review.</p>
      </section>
    );
  }

  return (
    <div className="character-vault__panel-grid">
      <section className="character-vault__card">
        <h4>Build goal</h4>
        <p>{profile.buildGoal}</p>
        <dl className="character-vault__definition-list">
          <div><dt>Role</dt><dd>{profile.role}</dd></div>
          <div><dt>Complexity</dt><dd>{profile.complexity}</dd></div>
          <div><dt>Edition</dt><dd>{record.ruleset === "srd-5.1-2014" ? "2014" : "2024"}</dd></div>
        </dl>
      </section>

      <section className="character-vault__card">
        <h4>Optimization notes</h4>
        <ul>{profile.optimizationNotes.map((note) => <li key={note}>{note}</li>)}</ul>
      </section>

      <section className="character-vault__card">
        <h4>Table tactics</h4>
        <ol>{profile.tactics.map((tactic) => <li key={tactic}>{tactic}</li>)}</ol>
      </section>

      <section className="character-vault__card">
        <h4>Level-by-level choices</h4>
        {profile.advancementChoices.length === 0 && <p>No optional advancement choice occurs by this level.</p>}
        {profile.advancementChoices.map((choice) => (
          <article className="character-vault__choice" key={choice.id}>
            <header><strong>Level {choice.gainedAtLevel}: {choice.name}</strong><span>{choice.kind.replace("-", " ")}</span></header>
            <p>{choice.synergyNote}</p>
          </article>
        ))}
      </section>
    </div>
  );
};
