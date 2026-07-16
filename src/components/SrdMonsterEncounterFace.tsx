import type { SrdMonsterRecord } from "../types/srdCompendium";
import { RULESET_LABELS } from "../types/ruleCards";
import { formatMonsterChallengeRating } from "../utils/monsterChallenge";

const previewText = (monster: SrdMonsterRecord) => {
  const source = monster.actions || monster.traits || monster.rawText;
  return source.length > 520 ? `${source.slice(0, 517).trim()}…` : source;
};

const typeClass = (type: string) => type
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "");

export const SrdMonsterEncounterFace = ({
  monster
}: {
  monster: SrdMonsterRecord;
}) => {
  const challengeRating = formatMonsterChallengeRating(monster.challenge);

  return (
    <article className={`monster-card monster-card--${typeClass(monster.type)} monster-card--srd-reference`}>
      <header className="monster-card__header">
        <div>
          <small>{RULESET_LABELS[monster.edition]} • CR {challengeRating}</small>
          <h3>{monster.name}</h3>
          <span>{monster.size} {monster.type} • {monster.alignment}</span>
        </div>
        <b className="monster-card__cr">CR {challengeRating}</b>
      </header>

      <div className="monster-card__vitals">
        <span>🛡 {monster.armorClass}</span>
        <span>❤️ {monster.hitPoints}</span>
        <span>👣 {monster.speed}</span>
      </div>

      <section className="monster-card__actions monster-card__reference-text">
        <h4>Reference Preview</h4>
        <p>{previewText(monster)}</p>
      </section>

      <footer>{monster.sourceReference} • CC BY 4.0</footer>
    </article>
  );
};
