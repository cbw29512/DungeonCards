import type { SrdSpellRecord } from "../types/srdCompendium";
import { RULESET_LABELS } from "../types/ruleCards";

type SrdSpellReferenceCardProps = {
  spell: SrdSpellRecord;
};

const spellLevel = (spell: SrdSpellRecord) => (
  spell.level === 0 ? `${spell.school} cantrip` : `Level ${spell.level} ${spell.school}`
);

export const SrdSpellReferenceCard = ({ spell }: SrdSpellReferenceCardProps) => (
  <article className="srd-reference-card srd-reference-card--spell">
    <header>
      <div>
        <small>{spellLevel(spell)}</small>
        <h2>{spell.name}</h2>
      </div>
      <span>{RULESET_LABELS[spell.edition]}</span>
    </header>

    <dl className="srd-reference-card__facts">
      <div><dt>Casting</dt><dd>{spell.castingTime || "See source"}</dd></div>
      <div><dt>Range</dt><dd>{spell.range || "See source"}</dd></div>
      <div><dt>Duration</dt><dd>{spell.duration || "See source"}</dd></div>
      <div><dt>Components</dt><dd>{spell.components || "See source"}</dd></div>
    </dl>

    {spell.classes.length > 0 && (
      <p className="srd-reference-card__classes">
        <strong>Lists:</strong> {spell.classes.join(", ")}
      </p>
    )}

    <p className="srd-reference-card__preview">{spell.description}</p>

    <details>
      <summary>Open complete spell reference</summary>
      <div className="srd-reference-card__full-text">
        {spell.description.split("\n\n").map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        {spell.higherLevels && (
          <p className="srd-reference-card__higher-levels">{spell.higherLevels}</p>
        )}
      </div>
    </details>

    <footer>{spell.sourceReference} · CC BY 4.0</footer>
  </article>
);
