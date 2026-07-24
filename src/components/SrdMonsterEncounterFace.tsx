import type { SrdMonsterRecord } from "../types/srdCompendium";
import { RULESET_LABELS } from "../types/ruleCards";
import { formatMonsterChallengeRating } from "../utils/monsterChallenge";
import { buildMonsterCombatReference } from "../utils/monsterCombatReference";

const typeClass = (type: string) => type
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "");

const compact = (value: string, maximum = 58) => {
  if (!value) return "—";
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length <= maximum ? normalized : `${normalized.slice(0, maximum - 1).trimEnd()}…`;
};

export const SrdMonsterEncounterFace = ({
  monster
}: {
  monster: SrdMonsterRecord;
}) => {
  const challengeRating = formatMonsterChallengeRating(monster.challenge);
  const reference = buildMonsterCombatReference(monster);
  const defenses = [
    reference.vulnerabilities ? `Vuln ${reference.vulnerabilities}` : "",
    reference.resistances ? `Resist ${reference.resistances}` : "",
    reference.immunities ? `Immune ${reference.immunities}` : "",
    reference.conditionImmunities ? `Cond ${reference.conditionImmunities}` : ""
  ].filter(Boolean).join("; ");
  const actionFlags = [
    reference.hasBonusActions ? "Bonus" : "",
    reference.hasReactions ? "Reaction" : "",
    reference.hasLegendaryActions ? "Legendary" : ""
  ].filter(Boolean);

  return (
    <article className={`monster-card monster-card--${typeClass(monster.type)} monster-card--srd-reference monster-card--combat-reference`}>
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

      {reference.abilities.length === 6 && (
        <div className="monster-card__abilities" aria-label="Ability scores">
          {reference.abilities.map((ability) => (
            <div key={ability.name}><small>{ability.name}</small><span>{ability.score}</span><em>{ability.modifier >= 0 ? "+" : ""}{ability.modifier}</em></div>
          ))}
        </div>
      )}

      <dl className="monster-card__details monster-card__details--combat">
        <div><dt>Initiative</dt><dd>{reference.initiative}</dd></div>
        {reference.savingThrows && <div><dt>Saves</dt><dd title={reference.savingThrows}>{compact(reference.savingThrows)}</dd></div>}
        {reference.skills && <div><dt>Skills</dt><dd title={reference.skills}>{compact(reference.skills)}</dd></div>}
        {defenses && <div><dt>Defenses</dt><dd title={defenses}>{compact(defenses, 72)}</dd></div>}
        {reference.senses && <div><dt>Senses</dt><dd title={reference.senses}>{compact(reference.senses, 72)}</dd></div>}
      </dl>

      <section className="monster-card__actions monster-card__combat-actions">
        <h4>Combat Actions</h4>
        {reference.actions.length > 0 ? (
          <ul>
            {reference.actions.map((action) => (
              <li key={action.name} title={action.summary}>
                <span>{action.name}</span>
                <small>{compact(action.summary, 120)}</small>
              </li>
            ))}
          </ul>
        ) : <p>Open the full folio for this creature's complete action text.</p>}
      </section>

      {actionFlags.length > 0 && <div className="monster-card__action-flags" aria-label="Additional action sections">{actionFlags.map((flag) => <span key={flag}>{flag}</span>)}</div>}
      <footer>Quick combat face • Full sourced folio available • {monster.sourceReference}</footer>
    </article>
  );
};
