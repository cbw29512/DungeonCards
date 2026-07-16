import type { SrdMonsterRecord } from "../types/srdCompendium";
import { RULESET_LABELS } from "../types/ruleCards";
import {
  formatMonsterChallengeRating,
  stripMonsterExperienceText
} from "../utils/monsterChallenge";

type SrdMonsterReferenceCardProps = {
  monster: SrdMonsterRecord;
};

const section = (title: string, text: string) => text ? (
  <section>
    <h3>{title}</h3>
    {stripMonsterExperienceText(text).split("\n\n").map((paragraph) => (
      <p key={paragraph}>{paragraph}</p>
    ))}
  </section>
) : null;

export const SrdMonsterReferenceCard = ({ monster }: SrdMonsterReferenceCardProps) => {
  const challengeRating = formatMonsterChallengeRating(monster.challenge);
  const preview = stripMonsterExperienceText(
    monster.actions || monster.traits || monster.rawText
  );

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
        <div className="srd-reference-card__full-text">
          {section("Traits", monster.traits)}
          {section("Actions", monster.actions)}
          {section("Bonus Actions", monster.bonusActions)}
          {section("Reactions", monster.reactions)}
          {section("Legendary Actions", monster.legendaryActions)}
          {!monster.traits && !monster.actions && (
            <p>{stripMonsterExperienceText(monster.rawText)}</p>
          )}
        </div>
      </details>

      <footer>{monster.sourceReference} · CC BY 4.0</footer>
    </article>
  );
};
