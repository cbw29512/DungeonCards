import type { SrdMonsterRecord } from "../types/srdCompendium";
import { RULESET_LABELS } from "../types/ruleCards";
import {
  formatMonsterChallengeRating,
  stripMonsterExperienceText
} from "../utils/monsterChallenge";

type SrdMonsterReferenceCardProps = {
  monster: SrdMonsterRecord;
};

export const SrdMonsterReferenceCard = ({ monster }: SrdMonsterReferenceCardProps) => {
  const challengeRating = formatMonsterChallengeRating(monster.challenge);
  const preview = stripMonsterExperienceText(
    monster.actions || monster.traits || monster.rawText
  );
  const completeSourceText = stripMonsterExperienceText(monster.rawText).trim();

  return (
    <article className="srd-reference-card srd-reference-card--monster">
      <header>
        <div>
          <small>{monster.size} {monster.type} · {monster.alignment}</small>
          <h2>{monster.name}</h2>
        </div>
        <span>{RULESET_LABELS[monster.edition]}</span>
      </header>

      <dl className="srd-reference-card__facts srd-reference-card__facts--monster">
        <div><dt>AC</dt><dd>{monster.armorClass || "—"}</dd></div>
        <div><dt>HP</dt><dd>{monster.hitPoints || "—"}</dd></div>
        <div><dt>Speed</dt><dd>{monster.speed || "—"}</dd></div>
        <div><dt>CR</dt><dd>{challengeRating}</dd></div>
      </dl>

      <p className="srd-reference-card__preview">{preview}</p>

      <details>
        <summary>Open complete stat-block reference</summary>
        <div className="srd-reference-card__full-text srd-reference-card__full-text--monster">
          <header>
            <strong>Complete licensed source record</strong>
            <small>{monster.sourceReference} · page {monster.sourcePage}</small>
          </header>
          <pre>{completeSourceText}</pre>
        </div>
      </details>

      <footer>{monster.sourceReference} · CC BY 4.0</footer>
    </article>
  );
};