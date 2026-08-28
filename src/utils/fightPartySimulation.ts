import type { FightBattleCombatantState, FightBattleState, FightSide } from "../types/fightBattle";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import { createFightBattle, resolveFightTurn } from "./fightBattle";
import {
  fightStartingDistanceForIteration,
  normalizeFightStartingDistances,
  setFightStartingDistance
} from "./fightEncounterSetup";
import type { RandomIntegerSource } from "./randomInteger";
import { rollDiceFormula } from "./rollDice";
import { createSeededFightRandomInteger, stableFightSimulationSeed } from "./fightSimulation";

export type FightPartyMonsterTargetPolicy = "random" | "focus-lowest-hp";

export type FightPartyHeroSurvival = {
  id: string;
  name: string;
  survivalRate: number;
};

export type FightPartySimulationSummary = {
  iterations: number;
  seed: number;
  targetPolicy: FightPartyMonsterTargetPolicy;
  startingDistancesFeet: number[];
  partyWins: number;
  monsterWins: number;
  unresolved: number;
  partyWinRate: number;
  monsterWinRate: number;
  medianRounds: number;
  averageRounds: number;
  averageHeroesStandingOnPartyWin: number;
  averagePartyHitPointsOnWin: number;
  averageMonsterHitPointsOnWin: number;
  heroSurvival: FightPartyHeroSurvival[];
};

type PartyHeroState = {
  id: string;
  profile: FightCombatantProfile;
  combatant: FightBattleCombatantState;
};

type InitiativeEntry = {
  kind: "hero" | "monster";
  heroId?: string;
  total: number;
  tieBreak: number;
};

const roundOne = (value: number): number => Math.round(value * 10) / 10;
const average = (values: number[]): number => values.length
  ? values.reduce((sum, value) => sum + value, 0) / values.length
  : 0;
const median = (values: number[]): number => {
  if (!values.length) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
};
const d20Formula = (bonus: number): string => `1d20${bonus >= 0 ? "+" : ""}${bonus}`;
const combatantDistance = (hero: FightBattleCombatantState, monster: FightBattleCombatantState): number => {
  if (Number.isFinite(hero.positionFeet) && Number.isFinite(monster.positionFeet)) {
    return Math.abs((hero.positionFeet as number) - (monster.positionFeet as number));
  }
  return 30;
};

export const getFightPartySimulationIssue = (
  heroes: FightCombatantProfile[],
  monster: FightCombatantProfile
): string | undefined => {
  if (heroes.length < 1) return "Choose at least one hero for the party simulation.";
  if (heroes.length > 6) return "Party simulation currently supports up to six heroes.";
  const rulesets = new Set([...heroes.map((hero) => hero.ruleset), monster.ruleset]);
  if (rulesets.size !== 1) return "Party simulation requires every combatant to use the same ruleset.";
  return undefined;
};

const initiativeTotal = (profile: FightCombatantProfile, randomInteger: RandomIntegerSource): number =>
  rollDiceFormula(d20Formula(profile.initiativeBonus ?? 0), { randomInteger }).total;

const initiativeOrder = (
  heroes: PartyHeroState[],
  monster: FightCombatantProfile,
  randomInteger: RandomIntegerSource
): InitiativeEntry[] => [
  ...heroes.map((hero) => ({
    kind: "hero" as const,
    heroId: hero.id,
    total: initiativeTotal(hero.profile, randomInteger),
    tieBreak: randomInteger(0, 0x7fffffff)
  })),
  {
    kind: "monster" as const,
    total: initiativeTotal(monster, randomInteger),
    tieBreak: randomInteger(0, 0x7fffffff)
  }
].sort((left, right) => right.total - left.total || right.tieBreak - left.tieBreak);

const transientBattle = ({
  hero,
  monster,
  actor,
  round
}: {
  hero: FightBattleCombatantState;
  monster: FightBattleCombatantState;
  actor: FightSide;
  round: number;
}): FightBattleState => ({
  status: "active",
  round,
  activeIndex: 0,
  distanceFeet: combatantDistance(hero, monster),
  initiative: {
    characterNaturalRoll: 0,
    characterTotal: 0,
    monsterNaturalRoll: 0,
    monsterTotal: 0,
    order: actor === "character" ? ["character", "monster"] : ["monster", "character"]
  },
  character: hero,
  monster,
  events: [],
  presentationEvents: []
});

const tagConcentrationOwnerIds = (state: FightBattleState): FightBattleState => {
  const tag = (combatant: FightBattleCombatantState): FightBattleCombatantState => ({
    ...combatant,
    effects: combatant.effects.map((effect) => {
      if (effect.concentrationOwnerId || !effect.concentrationOwner) return effect;
      return {
        ...effect,
        concentrationOwnerId: state[effect.concentrationOwner].combatantId
      };
    })
  });
  return { ...state, character: tag(state.character), monster: tag(state.monster) };
};

export const stripFightPartyConcentrationEffects = (
  combatant: FightBattleCombatantState,
  ownerCombatantId: string
): FightBattleCombatantState => ({
  ...combatant,
  effects: combatant.effects.filter((effect) => effect.concentrationOwnerId !== ownerCombatantId)
});

const syncCrossPartyConcentration = ({
  heroes,
  activeHeroId,
  monster,
  resolved
}: {
  heroes: PartyHeroState[];
  activeHeroId: string;
  monster: FightBattleCombatantState;
  resolved: FightBattleState;
}): FightBattleCombatantState => {
  const concentrationEvents = (resolved.presentationEvents ?? []).filter((event) => (
    event.type === "concentration-broken" || event.type === "concentration-started"
  ));
  let syncedMonster = monster;

  for (const event of concentrationEvents) {
    const owner = event.side;
    const ownerId = resolved[owner].combatantId;
    if (!ownerId) continue;
    if (owner === "monster") {
      for (const hero of heroes) {
        if (hero.id === activeHeroId) continue;
        hero.combatant = stripFightPartyConcentrationEffects(hero.combatant, ownerId);
      }
    } else {
      for (const hero of heroes) {
        if (hero.id === activeHeroId) continue;
        hero.combatant = stripFightPartyConcentrationEffects(hero.combatant, ownerId);
      }
      syncedMonster = resolved.monster;
    }
  }
  return syncedMonster;
};

const chooseMonsterTarget = (
  heroes: PartyHeroState[],
  policy: FightPartyMonsterTargetPolicy,
  randomInteger: RandomIntegerSource
): PartyHeroState | undefined => {
  const living = heroes.filter((hero) => hero.combatant.currentHitPoints > 0);
  if (!living.length) return undefined;
  if (policy === "focus-lowest-hp") {
    return [...living].sort((left, right) => (
      left.combatant.currentHitPoints - right.combatant.currentHitPoints
      || left.profile.armorClass - right.profile.armorClass
      || left.id.localeCompare(right.id)
    ))[0];
  }
  return living[randomInteger(0, living.length - 1)];
};

const runPartyEncounter = ({
  heroProfiles,
  monsterProfile,
  targetPolicy,
  startingDistanceFeet,
  randomInteger,
  maxRounds = 100
}: {
  heroProfiles: FightCombatantProfile[];
  monsterProfile: FightCombatantProfile;
  targetPolicy: FightPartyMonsterTargetPolicy;
  startingDistanceFeet: number;
  randomInteger: RandomIntegerSource;
  maxRounds?: number;
}) => {
  const monsterId = `monster:${monsterProfile.id}`;
  const first = setFightStartingDistance(createFightBattle(heroProfiles[0], monsterProfile), startingDistanceFeet);
  const heroes: PartyHeroState[] = heroProfiles.map((profile, index) => {
    const id = `hero:${profile.id}:${index}`;
    const created = setFightStartingDistance(createFightBattle(profile, monsterProfile), startingDistanceFeet);
    return {
      id,
      profile,
      combatant: { ...created.character, combatantId: id }
    };
  });
  let monster: FightBattleCombatantState = { ...first.monster, combatantId: monsterId };
  const order = initiativeOrder(heroes, monsterProfile, randomInteger);
  let round = 1;

  for (; round <= maxRounds; round += 1) {
    for (const entry of order) {
      if (monster.currentHitPoints <= 0) {
        return { winner: "party" as const, round, heroes, monster };
      }
      const livingHeroes = heroes.filter((hero) => hero.combatant.currentHitPoints > 0);
      if (!livingHeroes.length) {
        return { winner: "monster" as const, round, heroes, monster };
      }

      if (entry.kind === "hero") {
        const hero = heroes.find((candidate) => candidate.id === entry.heroId);
        if (!hero || hero.combatant.currentHitPoints <= 0) continue;
        const duel = transientBattle({ hero: hero.combatant, monster, actor: "character", round });
        const resolved = tagConcentrationOwnerIds(resolveFightTurn(duel, randomInteger));
        hero.combatant = resolved.character;
        monster = resolved.monster;
        monster = syncCrossPartyConcentration({ heroes, activeHeroId: hero.id, monster, resolved });
      } else {
        const firstTarget = chooseMonsterTarget(heroes, targetPolicy, randomInteger);
        if (!firstTarget) return { winner: "monster" as const, round, heroes, monster };
        let activeTarget = firstTarget;
        const duel = transientBattle({ hero: activeTarget.combatant, monster, actor: "monster", round });
        const resolved = tagConcentrationOwnerIds(resolveFightTurn(duel, randomInteger, {
          onOpponentDowned: (downedState, attacker, targetSide) => {
            if (attacker !== "monster" || targetSide !== "character") return undefined;
            const taggedDownedState = tagConcentrationOwnerIds(downedState);
            activeTarget.combatant = taggedDownedState.character;
            monster = taggedDownedState.monster;
            monster = syncCrossPartyConcentration({
              heroes,
              activeHeroId: activeTarget.id,
              monster,
              resolved: taggedDownedState
            });
            const replacement = chooseMonsterTarget(heroes, targetPolicy, randomInteger);
            if (!replacement) return undefined;
            activeTarget = replacement;
            return replacement.combatant;
          }
        }));
        activeTarget.combatant = resolved.character;
        monster = resolved.monster;
        monster = syncCrossPartyConcentration({ heroes, activeHeroId: activeTarget.id, monster, resolved });
      }
    }
  }

  return { winner: "unresolved" as const, round: maxRounds, heroes, monster };
};

export const simulateFightPartyMatchup = ({
  heroes,
  monster,
  iterations = 300,
  targetPolicy = "random",
  startingDistancesFeet,
  seed = stableFightSimulationSeed(
    ...heroes.map((hero) => hero.id),
    monster.id,
    monster.ruleset,
    targetPolicy,
    normalizeFightStartingDistances(startingDistancesFeet).join(",")
  )
}: {
  heroes: FightCombatantProfile[];
  monster: FightCombatantProfile;
  iterations?: number;
  targetPolicy?: FightPartyMonsterTargetPolicy;
  startingDistancesFeet?: readonly number[];
  seed?: number;
}): FightPartySimulationSummary => {
  const issue = getFightPartySimulationIssue(heroes, monster);
  if (issue) throw new Error(issue);
  const sampleSize = Math.min(2000, Math.max(1, Math.trunc(iterations)));
  const distances = normalizeFightStartingDistances(startingDistancesFeet);
  const randomInteger = createSeededFightRandomInteger(seed);
  const rounds: number[] = [];
  const partyWinStanding: number[] = [];
  const partyWinHitPoints: number[] = [];
  const monsterWinHitPoints: number[] = [];
  const survivalCounts = new Array(heroes.length).fill(0) as number[];
  let partyWins = 0;
  let monsterWins = 0;
  let unresolved = 0;

  for (let iteration = 0; iteration < sampleSize; iteration += 1) {
    const startingDistance = fightStartingDistanceForIteration(iteration, distances);
    const result = runPartyEncounter({
      heroProfiles: heroes,
      monsterProfile: monster,
      targetPolicy,
      startingDistanceFeet: startingDistance,
      randomInteger
    });
    rounds.push(result.round);
    result.heroes.forEach((hero, index) => {
      if (hero.combatant.currentHitPoints > 0) survivalCounts[index] += 1;
    });

    if (result.winner === "party") {
      partyWins += 1;
      const living = result.heroes.filter((hero) => hero.combatant.currentHitPoints > 0);
      partyWinStanding.push(living.length);
      partyWinHitPoints.push(living.reduce((sum, hero) => sum + hero.combatant.currentHitPoints, 0));
    } else if (result.winner === "monster") {
      monsterWins += 1;
      monsterWinHitPoints.push(result.monster.currentHitPoints);
    } else {
      unresolved += 1;
    }
  }

  return {
    iterations: sampleSize,
    seed: seed >>> 0,
    targetPolicy,
    startingDistancesFeet: distances,
    partyWins,
    monsterWins,
    unresolved,
    partyWinRate: roundOne((partyWins / sampleSize) * 100),
    monsterWinRate: roundOne((monsterWins / sampleSize) * 100),
    medianRounds: roundOne(median(rounds)),
    averageRounds: roundOne(average(rounds)),
    averageHeroesStandingOnPartyWin: roundOne(average(partyWinStanding)),
    averagePartyHitPointsOnWin: roundOne(average(partyWinHitPoints)),
    averageMonsterHitPointsOnWin: roundOne(average(monsterWinHitPoints)),
    heroSurvival: heroes.map((hero, index) => ({
      id: `hero:${hero.id}:${index}`,
      name: hero.name,
      survivalRate: roundOne((survivalCounts[index] / sampleSize) * 100)
    }))
  };
};
