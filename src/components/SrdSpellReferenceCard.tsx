import { useId, useState } from "react";
import type { SrdSpellRecord } from "../types/srdCompendium";
import { RULESET_LABELS } from "../types/ruleCards";
import {
  describeSrdSpellCasting,
  getSpellSlotOptions
} from "../utils/srdSpellCasting";

type SrdSpellReferenceCardProps = {
  spell: SrdSpellRecord;
};

const spellLevel = (spell: SrdSpellRecord) => (
  spell.level === 0 ? `${spell.school} cantrip` : `Level ${spell.level} ${spell.school}`
);

export const SrdSpellReferenceCard = ({ spell }: SrdSpellReferenceCardProps) => {
  const castingLevelId = useId();
  const [castingLevel, setCastingLevel] = useState(spell.level);
  const casting = describeSrdSpellCasting(spell, castingLevel);
  const slotOptions = getSpellSlotOptions(spell.level);
  const scaling = casting.structuredScaling;

  return (
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

      {spell.level > 0 ? (
        <section className="srd-spell-casting-level" aria-label={`${spell.name} casting level`}>
          <div className="srd-spell-casting-level__heading">
            <div>
              <small>Universal casting control</small>
              <strong>Cast at level {casting.castingLevel}</strong>
            </div>
            <label htmlFor={castingLevelId}>
              <span>Spell slot</span>
              <select
                id={castingLevelId}
                value={casting.castingLevel}
                onChange={(event) => setCastingLevel(Number(event.target.value))}
              >
                {slotOptions.map((level) => (
                  <option key={level} value={level}>Level {level}</option>
                ))}
              </select>
            </label>
          </div>
          <p className="srd-spell-casting-level__status" aria-live="polite">{casting.status}</p>
          {casting.extraSlotLevels > 0 && (
            <dl className="srd-spell-casting-level__metrics">
              <div><dt>Base level</dt><dd>{casting.baseLevel}</dd></div>
              <div><dt>Extra slot levels</dt><dd>+{casting.extraSlotLevels}</dd></div>
              <div><dt>Enhanced effect</dt><dd>{casting.hasEnhancedEffect ? "Yes" : "No listed change"}</dd></div>
            </dl>
          )}
          {casting.extraSlotLevels > 0 && casting.hasEnhancedEffect && (
            <div className={`srd-spell-scaling-result srd-spell-scaling-result--${scaling.status}`} aria-live="polite">
              <strong>{scaling.status === "calculated" ? "Structured increment" : "Manual review required"}</strong>
              <p>{scaling.summary}</p>
              {scaling.status === "calculated" && (
                <ul>
                  {scaling.effects.map((effect) => (
                    <li key={`${effect.kind}-${effect.label}`}>{effect.summary}</li>
                  ))}
                </ul>
              )}
              <small>Use this as an additive shortcut only. The exact source instruction controls targeting, limits, and special conditions.</small>
            </div>
          )}
          {spell.higherLevels && (
            <p className="srd-spell-casting-level__rule">{spell.higherLevels}</p>
          )}
        </section>
      ) : (
        <p className="srd-spell-casting-level__cantrip">{casting.status}</p>
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
};
