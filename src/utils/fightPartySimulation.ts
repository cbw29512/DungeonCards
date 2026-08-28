import type { FightBattleCombatantState, FightBattleState, FightSide } from "../types/fightBattle";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import { createFightBattle, fightActionsForProfile, resolveFightTurn } from "./fightBattle";
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

const hasConcentrationDependency = (profile: FightCombatantProfile): boolean => fightActionsForProfile(profile).some((action) => (
  action.requiresConcentration
  || (action.kind === "attack" && action.effectsOnHit?.some((effect) => effect.concentrationLinked))
  || (action.kind === "save" && (
    action.effectsOnFailure?.some((effect) => effect.concentrationLinked)
    || action.effectsOnSuccess?.some((effect) => effect.concentrationLinked)
  ))
));

export const getFightPartySimulationIssue = (
  heroes: FightCombatantProfile[],
  monster: FightCombatantProfile
): string | undefined => {
  if (heroes.length < 1) return "Choose at least one hero for the party simulation.";
  if (heroes.length > 6) return "Party simulation currently supports up to six heroes.";
  const rulesets = new Set([...heroes.map((hero) => hero.ruleset), monster.ruleset]);
  if (rulesets.size !== 1) return "Party simulation requires every combatant to use the same ruleset.";
  const concentrationProfile = [...heroes, monster].find(hasConcentrationDependency);
  if (concentrationProfile) {
    return `${concentrationProfile.name} uses concentration-linked combat mechanics. Party simulation waits until concentration ownership is tracked by unique combatant ID.`;
  }
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
  round,
  distanceFeet
}: {
  hero: FightBattleCombatantState;
  monster: FightBattleCombatantState;
  actor: FightSide;
  round: number;
  distanceFeet: number;
}): FightBattleState => ({
  status: "active",
  round,
  activeIndex: 0,
  distanceFeet,
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

const chooseMonsterTarget = (
  heroes: PartyHeroState[],
  policy: FightPartyMonsterTargetPolicy,
  randomInteger: RandomIntegerSource
): PartyHeroState => {
  const living = heroes.filter((hero) => hero.combatant.currentHitPoints > 0);
  if (!living.length) throw new Error("Monster target selection requires a living hero.");
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
  randomInteger,
  maxRounds = 100
}: {
  heroProfiles: FightCombatantProfile[];
  monsterProfile: FightCombatantProfile;
  targetPolicy: FightPartyMonsterTargetPolicy;
  randomInteger: RandomIntegerSource;
  maxRounds?: number;
}) => {
  const first = createFightBattle(heroProfiles[0], monsterProfile);
  const heroes: PartyHeroState[] = heroProfiles.map((profile, index) => ({
    id: `${profile.id}:${index}`,
    profile,
    combatant: createFightBattle(profile, monsterProfile).character
  }));
  let monster = first.monster;
  let distanceFeet = first.distanceFeet;
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
        const duel = transientBattle({ hero: hero.combatant, monster, actor: "character", round, distanceFeet });
        const resolved = resolveFightTurn(duel, randomInteger);
        hero.combatant = resolved.character;
        monster = resolved.monster;
        distanceFeet = resolved.distanceFeet;
      } else {
        const target = chooseMonsterTarget(heroes, targetPolicy, randomInteger);
        const duel = transientBattle({ hero: target.combatant, monster, actor: "monster", round, distanceFeet });
        const resolved = resolveFightTurn(duel, randomInteger);
        target.combatant = resolved.character;
        monster = resolved.monster;
        distanceFeet = resolved.distanceFeet;
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
  seed = stableFightSimulationSeed(...heroes.map((hero) => hero.id), monster.id, monster.ruleset, targetPolicy)
}: {
  heroes: FightCombatantProfile[];
  monster: FightCombatantProfile;
  iterations?: number;
  targetPolicy?: FightPartyMonsterTargetPolicy;
  seed?: number;
}): FightPartySimulationSummary => {
  const issue = getFightPartySimulationIssue(heroes, monster);
  if (issue) throw new Error(issue);
  const sampleSize = Math.min(2000, Math.max(1, Math.trunc(iterations)));
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
    const result = runPartyEncounter({ heroProfiles: heroes, monsterProfile: monster, targetPolicy, randomInteger });
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
      id: `${hero.id}:${index}`,
      name: hero.name,
      survivalRate: roundOne((survivalCounts[index] / sampleSize) * 100)
    }))
  };
};
