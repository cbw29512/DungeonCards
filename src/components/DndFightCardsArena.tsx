import { useState } from "react";
import { dndPregenClassDefinitions } from "../data/dndPregenCatalog";
import { dndVaultReadyBuilds } from "../data/dndVaultReadyBuilds";
import { srdMonsters } from "../data/srdCompendium";
import type { DndCharacterRecord } from "../types/dndCharacter";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import type { SrdMonsterRecord } from "../types/srdCompendium";
import { RULESET_LABELS } from "../types/ruleCards";
import {
  FIGHT_2024_EXPECTED_HERO_COUNT,
  FIGHT_2024_EXPECTED_MONSTER_COUNT,
  FIGHT_2024_RULESET
} from "../utils/fight2024Certification";
import { getFightBattleProfileIssue } from "../utils/fightBattleValidation";
import { buildCharacterFightProfile, buildSrdMonsterFightProfile } from "../utils/fightProfileAdapters";
import { characterPixelIdentity, monsterPixelIdentity } from "../utils/fightBattlePresentation";
import { DndFightBattleRunner } from "./DndFightBattleRunner";

type HeroOption = {
  id: string;
  classId: string;
  className: string;
  subclassName: string;
  level: number;
  name: string;
  character?: DndCharacterRecord;
  profile?: FightCombatantProfile;
  issue?: string;
};

type MonsterOption = {
  monster: SrdMonsterRecord;
  profile?: FightCombatantProfile;
  issue?: string;
};

const heroOptions: HeroOption[] = dndPregenClassDefinitions
  .filter((definition) => definition.ruleset === FIGHT_2024_RULESET)
  .flatMap((definition) => Array.from({ length: 20 }, (_, index) => {
    const level = index + 1;
    const build = dndVaultReadyBuilds.find((candidate) => (
      candidate.ruleset === FIGHT_2024_RULESET
      && candidate.classId === definition.classId
      && candidate.subclassId === definition.subclassId
      && candidate.level === level
    ));
    if (!build) {
      return {
        id: `${FIGHT_2024_RULESET}:${definition.classId}:${definition.subclassId}:${level}`,
        classId: definition.classId,
        className: definition.className,
        subclassName: definition.subclassName,
        level,
        name: `${definition.className} ${level}`,
        issue: `The reviewed ${definition.className} level ${level} / ${definition.subclassName} pregen is not certified yet.`
      };
    }

    const result = buildCharacterFightProfile(build.character);
    if (!result.ok) {
      return {
        id: build.id,
        classId: definition.classId,
        className: definition.className,
        subclassName: definition.subclassName,
        level,
        name: build.character.name,
        character: build.character,
        issue: result.issues.join(" ")
      };
    }
    const issue = getFightBattleProfileIssue(result.profile);
    return {
      id: build.id,
      classId: definition.classId,
      className: definition.className,
      subclassName: definition.subclassName,
      level,
      name: build.character.name,
      character: build.character,
      profile: result.profile,
      issue
    };
  }));

const monsterOptions: MonsterOption[] = srdMonsters
  .filter((monster) => monster.edition === FIGHT_2024_RULESET)
  .map((monster) => {
    const result = buildSrdMonsterFightProfile(monster);
    if (!result.ok) return { monster, issue: result.issues.join(" ") };
    const issue = getFightBattleProfileIssue(result.profile);
    return { monster, profile: result.profile, issue };
  });

const preferredHeroIndex = Math.max(0, heroOptions.findIndex((option) => (
  option.classId === "fighter" && option.level === 3 && option.profile
)));
const preferredMonsterIndex = Math.max(0, monsterOptions.findIndex((option) => option.profile && !option.issue));

const cycleIndex = (index: number, length: number, delta: number): number => {
  if (length <= 0) return 0;
  return (index + delta + length) % length;
};

const firstNumber = (value: string): string => value.match(/\d+/)?.[0] ?? "—";
const attackLabel = (profile?: FightCombatantProfile): string => {
  if (!profile) return "Certification pending";
  const action = profile.sourceActionName ?? profile.actions?.[0]?.name ?? "Attack";
  const bonus = profile.attackBonus >= 0 ? `+${profile.attackBonus}` : String(profile.attackBonus);
  return `${action} ${bonus}`;
};

const ShowdownCard = ({
  badge,
  name,
  subtitle,
  armorClass,
  hitPoints,
  attack,
  glyph,
  side,
  ready
}: {
  badge: string;
  name: string;
  subtitle: string;
  armorClass: string | number;
  hitPoints: string | number;
  attack: string;
  glyph: string;
  side: "hero" | "monster";
  ready: boolean;
}) => (
  <article className={`fight-showcase-card fight-showcase-card--${side}`}>
    <div className="fight-showcase-card__portrait" aria-hidden="true"><span>{glyph}</span></div>
    <header>
      <span className="fight-showcase-card__badge">{badge}</span>
      <h2>{name}</h2>
      <p>{subtitle}</p>
      <strong>{ready ? "AUTO-FIGHT CERTIFIED" : "SOURCE CARD · AUTOMATION PENDING"}</strong>
    </header>
    <dl className="fight-showcase-card__stats">
      <div><dt>AC</dt><dd>{armorClass}</dd></div>
      <div><dt>HP</dt><dd>{hitPoints}</dd></div>
      <div><dt>Attack</dt><dd>{attack}</dd></div>
    </dl>
  </article>
);

export const DndFightCardsArena = () => {
  const [heroIndex, setHeroIndex] = useState(preferredHeroIndex);
  const [monsterIndex, setMonsterIndex] = useState(preferredMonsterIndex);
  const [fightNumber, setFightNumber] = useState(0);
  const [fighting, setFighting] = useState(false);

  const hero = heroOptions[heroIndex] ?? heroOptions[0];
  const monster = monsterOptions[monsterIndex] ?? monsterOptions[0];
  const canFight = Boolean(hero?.profile && !hero.issue && monster?.profile && !monster.issue);

  const chooseHero = (nextIndex: number) => {
    setHeroIndex(nextIndex);
    setFighting(false);
  };

  const chooseMonster = (nextIndex: number) => {
    setMonsterIndex(nextIndex);
    setFighting(false);
  };

  const startFight = () => {
    if (!canFight) return;
    setFightNumber((value) => value + 1);
    setFighting(true);
  };

  if (!hero || !monster) {
    return (
      <section className="fight-showcase fight-showcase--empty" role="status">
        <h1>Fight Cards</h1>
        <p>The 2024 SRD roster could not be loaded.</p>
      </section>
    );
  }

  const heroIdentity = characterPixelIdentity(hero.className);
  const monsterIdentity = monsterPixelIdentity(monster.monster.name, monster.monster.type);

  return (
    <section
      className="fight-showcase"
      aria-labelledby="fight-showcase-title"
      data-hero-slot-count={heroOptions.length}
      data-monster-count={monsterOptions.length}
    >
      <header className="fight-showcase__hero">
        <span>FIGHT CARDS · 5.5e</span>
        <h1 id="fight-showcase-title">Pregen Heroes vs. Every SRD Monster. Who Will Win?</h1>
        <p>All {FIGHT_2024_EXPECTED_HERO_COUNT} hero slots and all {FIGHT_2024_EXPECTED_MONSTER_COUNT} official SRD 5.2.1 monsters stay visible. Unsupported mechanics are reported, never hidden.</p>
      </header>

      {!fighting ? (
        <>
          <div className="fight-showcase__cards">
            <div className="fight-showcase__pick">
              <ShowdownCard
                badge="PREGEN HERO"
                glyph={heroIdentity.fallbackGlyph}
                name={hero.name}
                ready={Boolean(hero.profile && !hero.issue)}
                armorClass={hero.profile?.armorClass ?? hero.character?.armorClass ?? "—"}
                hitPoints={hero.profile?.hitPoints ?? hero.character?.maximumHitPoints ?? "—"}
                attack={attackLabel(hero.profile)}
                side="hero"
                subtitle={`${hero.className} ${hero.level} · ${hero.subclassName} · ${RULESET_LABELS[FIGHT_2024_RULESET]}`}
              />
              <div className="fight-showcase__chooser">
                <button aria-label="Previous hero" onClick={() => chooseHero(cycleIndex(heroIndex, heroOptions.length, -1))} type="button">‹</button>
                <label>
                  <span>Choose hero</span>
                  <select onChange={(event) => chooseHero(Number(event.target.value))} value={heroIndex}>
                    {heroOptions.map((option, index) => (
                      <option key={option.id} value={index}>
                        {option.name} · {option.className} {option.level}{option.issue ? " · pending" : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <button aria-label="Next hero" onClick={() => chooseHero(cycleIndex(heroIndex, heroOptions.length, 1))} type="button">›</button>
              </div>
              {hero.issue ? <p className="fight-showcase__promise" role="status"><strong>Automation blocker:</strong> {hero.issue}</p> : null}
            </div>

            <div className="fight-showcase__versus" aria-hidden="true">VS</div>

            <div className="fight-showcase__pick">
              <ShowdownCard
                badge="MONSTER"
                glyph={monsterIdentity.fallbackGlyph}
                name={monster.monster.name}
                ready={Boolean(monster.profile && !monster.issue)}
                armorClass={monster.profile?.armorClass ?? firstNumber(monster.monster.armorClass)}
                hitPoints={monster.profile?.hitPoints ?? firstNumber(monster.monster.hitPoints)}
                attack={attackLabel(monster.profile)}
                side="monster"
                subtitle={`CR ${monster.monster.challenge} · ${RULESET_LABELS[FIGHT_2024_RULESET]}`}
              />
              <div className="fight-showcase__chooser">
                <button aria-label="Previous monster" onClick={() => chooseMonster(cycleIndex(monsterIndex, monsterOptions.length, -1))} type="button">‹</button>
                <label>
                  <span>Choose monster · all {monsterOptions.length}</span>
                  <select onChange={(event) => chooseMonster(Number(event.target.value))} value={monsterIndex}>
                    {monsterOptions.map((option, index) => (
                      <option key={option.monster.id} value={index}>
                        {option.monster.name} · CR {option.monster.challenge}{option.issue ? " · pending" : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <button aria-label="Next monster" onClick={() => chooseMonster(cycleIndex(monsterIndex, monsterOptions.length, 1))} type="button">›</button>
              </div>
              {monster.issue ? <p className="fight-showcase__promise" role="status"><strong>Automation blocker:</strong> {monster.issue}</p> : null}
            </div>
          </div>

          <button className="fight-showcase__fight" disabled={!canFight} onClick={startFight} type="button">FIGHT</button>
          <p className="fight-showcase__promise">No CR gate. No stat fudging. No hidden balancing. Every official SRD monster remains selectable while certification drives automation blockers to zero.</p>
        </>
      ) : hero.profile && monster.profile ? (
        <DndFightBattleRunner
          autoStart
          character={hero.profile}
          characterIdentity={heroIdentity}
          key={`${hero.profile.id}:${monster.profile.id}:${fightNumber}`}
          monster={monster.profile}
          monsterIdentity={monsterIdentity}
          onChangeFighters={() => setFighting(false)}
        />
      ) : null}
    </section>
  );
};
