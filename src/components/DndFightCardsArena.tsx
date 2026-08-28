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
import { simulateFightMatchup, type FightSimulationSummary } from "../utils/fightSimulation";
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

type Props = {
  compactHeading?: boolean;
};

const classDefinitions2024 = dndPregenClassDefinitions.filter((definition) => definition.ruleset === FIGHT_2024_RULESET);

const heroOptions: HeroOption[] = classDefinitions2024.flatMap((definition) => Array.from({ length: 20 }, (_, index) => {
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
  option.classId === "fighter" && option.level === 3 && option.profile && !option.issue
)));
const preferredMonsterIndex = Math.max(0, monsterOptions.findIndex((option) => option.profile && !option.issue));

const cycleIndex = (index: number, length: number, delta: number): number => {
  if (length <= 0) return 0;
  return (index + delta + length) % length;
};

const firstNumber = (value: string): string => value.match(/\d+/)?.[0] ?? "—";
const attackLabel = (profile?: FightCombatantProfile): string => {
  if (!profile) return "Not ready yet";
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
  <article className={`fight-showcase-card fight-showcase-card--${side}`} data-ready={ready ? "true" : "false"}>
    <div className="fight-showcase-card__portrait" aria-hidden="true"><span>{glyph}</span></div>
    <header>
      <span className="fight-showcase-card__badge">{badge}</span>
      <h2>{name}</h2>
      <p>{subtitle}</p>
    </header>
    <dl className="fight-showcase-card__stats">
      <div><dt>AC</dt><dd>{armorClass}</dd></div>
      <div><dt>HP</dt><dd>{hitPoints}</dd></div>
      <div><dt>Attack</dt><dd>{attack}</dd></div>
    </dl>
  </article>
);

export const DndFightCardsArena = ({ compactHeading = false }: Props) => {
  const [heroIndex, setHeroIndex] = useState(preferredHeroIndex);
  const [monsterIndex, setMonsterIndex] = useState(preferredMonsterIndex);
  const [fightNumber, setFightNumber] = useState(0);
  const [fighting, setFighting] = useState(false);
  const [simulation, setSimulation] = useState<FightSimulationSummary>();

  const hero = heroOptions[heroIndex] ?? heroOptions[0];
  const monster = monsterOptions[monsterIndex] ?? monsterOptions[0];
  const canFight = Boolean(hero?.profile && !hero.issue && monster?.profile && !monster.issue);

  const chooseHero = (nextIndex: number) => {
    setHeroIndex(nextIndex);
    setFighting(false);
    setSimulation(undefined);
  };

  const chooseMonster = (nextIndex: number) => {
    setMonsterIndex(nextIndex);
    setFighting(false);
    setSimulation(undefined);
  };

  const startFight = () => {
    if (!canFight) return;
    setFightNumber((value) => value + 1);
    setFighting(true);
  };

  const simulateAverageFight = () => {
    if (!hero?.profile || hero.issue || !monster?.profile || monster.issue) return;
    setSimulation(simulateFightMatchup({ character: hero.profile, monster: monster.profile, iterations: 500 }));
  };

  if (!hero || !monster) {
    return (
      <section className="fight-showcase fight-showcase--empty" role="status">
        <h1>Fight Cards</h1>
        <p>The fighters could not be loaded.</p>
      </section>
    );
  }

  const heroIdentity = characterPixelIdentity(hero.className);
  const monsterIdentity = monsterPixelIdentity(monster.monster.name, monster.monster.type);
  const selectedIssue = hero.issue ?? monster.issue;

  return (
    <section
      className={`fight-showcase${compactHeading ? " fight-showcase--compact" : ""}`}
      aria-labelledby="fight-showcase-title"
      data-hero-slot-count={heroOptions.length}
      data-monster-count={monsterOptions.length}
    >
      <header className="fight-showcase__hero">
        <span>FIGHT CARDS</span>
        <h1 id="fight-showcase-title">{compactHeading ? "Choose your fighters" : "Pick two cards. Press FIGHT."}</h1>
        {!compactHeading ? <p>Choose a hero. Choose a monster. Watch the fight happen.</p> : null}
      </header>

      {!fighting ? (
        <>
          <div className="fight-showcase__cards">
            <div className="fight-showcase__pick">
              <ShowdownCard
                badge="YOUR HERO"
                glyph={heroIdentity.fallbackGlyph}
                name={hero.name}
                ready={Boolean(hero.profile && !hero.issue)}
                armorClass={hero.profile?.armorClass ?? hero.character?.armorClass ?? "—"}
                hitPoints={hero.profile?.hitPoints ?? hero.character?.maximumHitPoints ?? "—"}
                attack={attackLabel(hero.profile)}
                side="hero"
                subtitle={`${hero.className} ${hero.level} · ${hero.subclassName}`}
              />
              <div className="fight-showcase__chooser">
                <button aria-label="Previous hero" onClick={() => chooseHero(cycleIndex(heroIndex, heroOptions.length, -1))} type="button">‹</button>
                <label>
                  <span>Choose hero</span>
                  <select onChange={(event) => chooseHero(Number(event.target.value))} value={heroIndex}>
                    {classDefinitions2024.map((definition) => (
                      <optgroup key={definition.classId} label={definition.className}>
                        {heroOptions.map((option, index) => option.classId === definition.classId ? (
                          <option key={option.id} value={index}>
                            {option.name} · Level {option.level}{option.issue ? " · not ready yet" : ""}
                          </option>
                        ) : null)}
                      </optgroup>
                    ))}
                  </select>
                </label>
                <button aria-label="Next hero" onClick={() => chooseHero(cycleIndex(heroIndex, heroOptions.length, 1))} type="button">›</button>
              </div>
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
                subtitle={`CR ${monster.monster.challenge} · ${monster.monster.type}`}
              />
              <div className="fight-showcase__chooser">
                <button aria-label="Previous monster" onClick={() => chooseMonster(cycleIndex(monsterIndex, monsterOptions.length, -1))} type="button">‹</button>
                <label>
                  <span>Choose monster</span>
                  <select onChange={(event) => chooseMonster(Number(event.target.value))} value={monsterIndex}>
                    {monsterOptions.map((option, index) => (
                      <option key={option.monster.id} value={index}>
                        {option.monster.name} · CR {option.monster.challenge}{option.issue ? " · not ready yet" : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <button aria-label="Next monster" onClick={() => chooseMonster(cycleIndex(monsterIndex, monsterOptions.length, 1))} type="button">›</button>
              </div>
            </div>
          </div>

          <button className="fight-showcase__fight" disabled={!canFight} onClick={startFight} type="button">FIGHT</button>
          {selectedIssue ? <p className="fight-showcase__not-ready" role="status">That card is not ready for the arena yet. Pick another card for now.</p> : null}
          <p className="fight-showcase__promise">No hidden balancing. The cards fight with their actual game stats.</p>

          <details className="fight-showcase__dm-details">
            <summary>DM Details</summary>
            <div>
              <p><strong>Current mode:</strong> solo hero vs. one monster using D&amp;D 2024 / SRD 5.2.1 data.</p>
              <p><strong>Heroic Crits:</strong> a critical hit adds maximum crit-eligible base dice to one normal damage roll; flat modifiers apply once. This is a Fight Cards house rule.</p>
              <p><strong>Roster:</strong> {FIGHT_2024_EXPECTED_HERO_COUNT} hero level slots and {FIGHT_2024_EXPECTED_MONSTER_COUNT} SRD monsters stay available in the selector.</p>
              {selectedIssue ? <p><strong>Automation detail:</strong> {selectedIssue}</p> : <p><strong>Selected cards:</strong> ready for automated combat.</p>}
              <p><strong>Ruleset:</strong> {RULESET_LABELS[FIGHT_2024_RULESET]}.</p>

              <section className="fight-showcase__simulation" aria-label="Average fight simulator">
                <header>
                  <strong>Average fight</strong>
                  <span>Run the same battle engine 500 times.</span>
                </header>
                <button disabled={!canFight} onClick={simulateAverageFight} type="button">Simulate 500 fights</button>
                {simulation ? (
                  <div className="fight-showcase__simulation-results" role="status">
                    <dl>
                      <div><dt>{hero.name} wins</dt><dd>{simulation.characterWinRate}%</dd></div>
                      <div><dt>{monster.monster.name} wins</dt><dd>{simulation.monsterWinRate}%</dd></div>
                      <div><dt>Typical fight</dt><dd>{simulation.medianRounds} rounds</dd></div>
                      <div><dt>Average fight</dt><dd>{simulation.averageRounds} rounds</dd></div>
                    </dl>
                    <p>When {hero.name} wins: {simulation.averageCharacterHitPointsOnWin} HP left on average. When {monster.monster.name} wins: {simulation.averageMonsterHitPointsOnWin} HP left on average.</p>
                    <p>Sample: {simulation.iterations} fights · unresolved {simulation.unresolved} · seed {simulation.seed}. Initiative ties are broken randomly for simulation only.</p>
                  </div>
                ) : <p>Use this to estimate how this solo matchup tends to play out—not to alter either card.</p>}
              </section>
            </div>
          </details>
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
