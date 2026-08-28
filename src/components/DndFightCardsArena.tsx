import { useMemo, useState } from "react";
import { dndVaultReadyBuilds } from "../data/dndVaultReadyBuilds";
import { encounterMonsterCatalog } from "../data/encounterMonsterCatalog";
import type { DndCharacterRecord } from "../types/dndCharacter";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import { RULESET_LABELS } from "../types/ruleCards";
import { getFightBattleProfileIssue } from "../utils/fightBattleValidation";
import { buildCharacterFightProfile, buildSrdMonsterFightProfile } from "../utils/fightProfileAdapters";
import { characterPixelIdentity, monsterPixelIdentity } from "../utils/fightBattlePresentation";
import { DndFightBattleRunner } from "./DndFightBattleRunner";

type HeroOption = {
  character: DndCharacterRecord;
  profile: FightCombatantProfile;
};

type MonsterOption = {
  name: string;
  cr: string;
  type: string;
  profile: FightCombatantProfile;
};

const supportedHeroes: HeroOption[] = dndVaultReadyBuilds.flatMap((build) => {
  const result = buildCharacterFightProfile(build.character);
  if (!result.ok || getFightBattleProfileIssue(result.profile)) return [];
  return [{ character: build.character, profile: result.profile }];
});

const supportedMonsters: MonsterOption[] = encounterMonsterCatalog.flatMap((entry) => {
  if (entry.kind !== "reference") return [];
  const result = buildSrdMonsterFightProfile(entry.monster);
  if (!result.ok || getFightBattleProfileIssue(result.profile)) return [];
  return [{ name: entry.name, cr: entry.cr, type: entry.monster.type, profile: result.profile }];
});

const preferredHeroIndex = Math.max(0, supportedHeroes.findIndex(({ character }) => (
  character.ruleset === "srd-5.1-2014" && character.classId === "fighter" && character.level === 3
)));

const cycleIndex = (index: number, length: number, delta: number): number => {
  if (length <= 0) return 0;
  return (index + delta + length) % length;
};

const attackLabel = (profile: FightCombatantProfile): string => {
  const action = profile.sourceActionName ?? profile.actions?.[0]?.name ?? "Attack";
  const bonus = profile.attackBonus >= 0 ? `+${profile.attackBonus}` : String(profile.attackBonus);
  return `${action} ${bonus}`;
};

const ShowdownCard = ({
  badge,
  name,
  subtitle,
  profile,
  glyph,
  side
}: {
  badge: string;
  name: string;
  subtitle: string;
  profile: FightCombatantProfile;
  glyph: string;
  side: "hero" | "monster";
}) => (
  <article className={`fight-showcase-card fight-showcase-card--${side}`}>
    <div className="fight-showcase-card__portrait" aria-hidden="true"><span>{glyph}</span></div>
    <header>
      <span className="fight-showcase-card__badge">{badge}</span>
      <h2>{name}</h2>
      <p>{subtitle}</p>
    </header>
    <dl className="fight-showcase-card__stats">
      <div><dt>AC</dt><dd>{profile.armorClass}</dd></div>
      <div><dt>HP</dt><dd>{profile.hitPoints}</dd></div>
      <div><dt>Attack</dt><dd>{attackLabel(profile)}</dd></div>
    </dl>
  </article>
);

export const DndFightCardsArena = () => {
  const [heroIndex, setHeroIndex] = useState(preferredHeroIndex);
  const [monsterIndex, setMonsterIndex] = useState(0);
  const [fightNumber, setFightNumber] = useState(0);
  const [fighting, setFighting] = useState(false);

  const hero = supportedHeroes[heroIndex] ?? supportedHeroes[0];
  const monstersForEdition = useMemo(() => (
    hero ? supportedMonsters.filter(({ profile }) => profile.ruleset === hero.profile.ruleset) : []
  ), [hero]);
  const monster = monstersForEdition[monsterIndex] ?? monstersForEdition[0];

  const chooseHero = (nextIndex: number) => {
    setHeroIndex(nextIndex);
    setMonsterIndex(0);
    setFighting(false);
  };

  const chooseMonster = (nextIndex: number) => {
    setMonsterIndex(nextIndex);
    setFighting(false);
  };

  const startFight = () => {
    if (!hero || !monster) return;
    setFightNumber((value) => value + 1);
    setFighting(true);
  };

  if (!hero || !monster) {
    return (
      <section className="fight-showcase fight-showcase--empty" role="status">
        <h1>Fight Cards</h1>
        <p>No fully executable RAW-driven matchups are available yet.</p>
      </section>
    );
  }

  const heroIdentity = characterPixelIdentity(hero.character.className);
  const monsterIdentity = monsterPixelIdentity(monster.name, monster.type);

  return (
    <section className="fight-showcase" aria-labelledby="fight-showcase-title">
      <header className="fight-showcase__hero">
        <span>FIGHT CARDS</span>
        <h1 id="fight-showcase-title">Pregen Heroes vs. Monsters. Who Will Win?</h1>
        <p>Pick two cards. Hit <strong>FIGHT</strong>. Watch the RAW-driven rules engine decide.</p>
      </header>

      {!fighting ? (
        <>
          <div className="fight-showcase__cards">
            <div className="fight-showcase__pick">
              <ShowdownCard
                badge="PREGEN HERO"
                glyph={heroIdentity.fallbackGlyph}
                name={hero.character.name}
                profile={hero.profile}
                side="hero"
                subtitle={`${hero.character.className} ${hero.character.level} · ${RULESET_LABELS[hero.character.ruleset]}`}
              />
              <div className="fight-showcase__chooser">
                <button aria-label="Previous hero" onClick={() => chooseHero(cycleIndex(heroIndex, supportedHeroes.length, -1))} type="button">‹</button>
                <label>
                  <span>Choose hero</span>
                  <select onChange={(event) => chooseHero(Number(event.target.value))} value={heroIndex}>
                    {supportedHeroes.map(({ character }, index) => (
                      <option key={`${character.ruleset}:${character.id}`} value={index}>
                        {character.name} · {character.className} {character.level}
                      </option>
                    ))}
                  </select>
                </label>
                <button aria-label="Next hero" onClick={() => chooseHero(cycleIndex(heroIndex, supportedHeroes.length, 1))} type="button">›</button>
              </div>
            </div>

            <div className="fight-showcase__versus" aria-hidden="true">VS</div>

            <div className="fight-showcase__pick">
              <ShowdownCard
                badge="MONSTER"
                glyph={monsterIdentity.fallbackGlyph}
                name={monster.name}
                profile={monster.profile}
                side="monster"
                subtitle={`CR ${monster.cr} · ${RULESET_LABELS[monster.profile.ruleset]}`}
              />
              <div className="fight-showcase__chooser">
                <button aria-label="Previous monster" onClick={() => chooseMonster(cycleIndex(monsterIndex, monstersForEdition.length, -1))} type="button">‹</button>
                <label>
                  <span>Choose monster</span>
                  <select onChange={(event) => chooseMonster(Number(event.target.value))} value={monsterIndex}>
                    {monstersForEdition.map((option, index) => (
                      <option key={`${option.profile.ruleset}:${option.profile.id}`} value={index}>
                        {option.name} · CR {option.cr}
                      </option>
                    ))}
                  </select>
                </label>
                <button aria-label="Next monster" onClick={() => chooseMonster(cycleIndex(monsterIndex, monstersForEdition.length, 1))} type="button">›</button>
              </div>
            </div>
          </div>

          <button className="fight-showcase__fight" onClick={startFight} type="button">FIGHT</button>
          <p className="fight-showcase__promise">No stat fudging. No hidden balancing. Pick the cards and let them fight.</p>
        </>
      ) : (
        <DndFightBattleRunner
          autoStart
          character={hero.profile}
          characterIdentity={heroIdentity}
          key={`${hero.profile.id}:${monster.profile.id}:${fightNumber}`}
          monster={monster.profile}
          monsterIdentity={monsterIdentity}
          onChangeFighters={() => setFighting(false)}
        />
      )}
    </section>
  );
};
