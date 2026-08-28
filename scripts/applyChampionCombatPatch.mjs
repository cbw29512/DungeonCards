import fs from "node:fs";

const replaceOnce = (text, before, after, label) => {
  const first = text.indexOf(before);
  if (first < 0) throw new Error(`Missing patch anchor: ${label}`);
  if (text.indexOf(before, first + before.length) >= 0) throw new Error(`Ambiguous patch anchor: ${label}`);
  return text.slice(0, first) + after + text.slice(first + before.length);
};

const patchFile = (path, transform) => {
  const original = fs.readFileSync(path, "utf8");
  const next = transform(original);
  if (next === original) throw new Error(`Patch made no changes: ${path}`);
  fs.writeFileSync(path, next);
};

patchFile("src/utils/fightProfileAdapters.ts", (input) => {
  let text = input;
  text = replaceOnce(text,
`  const resources: NonNullable<FightCombatantProfile["resources"]> = [];
  const failedSaveRerolls: NonNullable<FightCombatantProfile["failedSaveRerolls"]> = [];
  const attackFollowUps: NonNullable<FightCombatantProfile["attackFollowUps"]> = [];
`,
`  const resources: NonNullable<FightCombatantProfile["resources"]> = [];
  const failedSaveRerolls: NonNullable<FightCombatantProfile["failedSaveRerolls"]> = [];
  const failedAttackRerolls: NonNullable<FightCombatantProfile["failedAttackRerolls"]> = [];
  const attackFollowUps: NonNullable<FightCombatantProfile["attackFollowUps"]> = [];
  const turnStartResourceGrants: NonNullable<FightCombatantProfile["turnStartResourceGrants"]> = [];
  const turnStartHealing: NonNullable<FightCombatantProfile["turnStartHealing"]> = [];
  const postCriticalMovement: NonNullable<FightCombatantProfile["postCriticalMovement"]> = [];
`, "profile trigger arrays");

  text = replaceOnce(text,
`    if (character.ruleset === "srd-5.2.1-2024" && character.level >= 9) {
`,
`    if (character.ruleset === "srd-5.2.1-2024" && isSupportedChampion && character.level >= 3) {
      postCriticalMovement.push({
        id: "remarkable-athlete",
        name: "Remarkable Athlete",
        maximumFeet: Math.floor(character.speedFeet / 2),
        opportunityAttackSafe: true,
        autoUse: "retreat-ranged-without-leaving-normal-range"
      });
    }
    if (character.ruleset === "srd-5.2.1-2024" && isSupportedChampion && character.level >= 10) {
      resources.push({
        id: "heroic-inspiration",
        name: "Heroic Inspiration",
        maximum: 1,
        initial: 0,
        refresh: "none"
      });
      turnStartResourceGrants.push({
        id: "heroic-warrior",
        name: "Heroic Warrior",
        resourceId: "heroic-inspiration",
        amount: 1,
        when: "missing"
      });
      failedAttackRerolls.unshift({
        id: "heroic-inspiration",
        name: "Heroic Inspiration",
        resourceId: "heroic-inspiration",
        autoUse: "when-can-hit"
      });
      failedSaveRerolls.unshift({
        id: "heroic-inspiration",
        name: "Heroic Inspiration",
        resourceId: "heroic-inspiration",
        bonus: 0,
        autoUse: "when-can-succeed"
      });
    }
    if (character.ruleset === "srd-5.2.1-2024" && isSupportedChampion && character.level >= 18) {
      turnStartHealing.push({
        id: "heroic-rally",
        name: "Heroic Rally",
        amount: Math.max(0, 5 + abilityModifier(character.abilityScores.con)),
        minimumHitPoints: 1,
        maximumHitPointFraction: 0.5
      });
    }
    if (character.ruleset === "srd-5.2.1-2024" && character.level >= 9) {
`, "Champion feature injection");

  text = replaceOnce(text,
`      failedSaveRerolls: failedSaveRerolls.length ? failedSaveRerolls : undefined,
      attackFollowUps: attackFollowUps.length ? attackFollowUps : undefined,
      actions,
`,
`      failedSaveRerolls: failedSaveRerolls.length ? failedSaveRerolls : undefined,
      failedAttackRerolls: failedAttackRerolls.length ? failedAttackRerolls : undefined,
      attackFollowUps: attackFollowUps.length ? attackFollowUps : undefined,
      turnStartResourceGrants: turnStartResourceGrants.length ? turnStartResourceGrants : undefined,
      turnStartHealing: turnStartHealing.length ? turnStartHealing : undefined,
      postCriticalMovement: postCriticalMovement.length ? postCriticalMovement : undefined,
      actions,
`, "profile output fields");
  return text;
});

patchFile("src/utils/fightBattle.ts", (input) => {
  let text = input;
  text = replaceOnce(text,
`import { appendFightPresentationEvent, recordFightAttackPresentation } from "./fightPresentationEvents";
import { assertFightBattleProfile } from "./fightBattleValidation";
import { resolveFightSavingThrow } from "./fightSavingThrow";
`,
`import { resolveFightAttackRoll, fightAttackHits } from "./fightAttackReroll";
import { resolveFightPostCriticalMovement } from "./fightPostCriticalMovement";
import { appendFightPresentationEvent, recordFightAttackPresentation } from "./fightPresentationEvents";
import { assertFightBattleProfile } from "./fightBattleValidation";
import { resolveFightSavingThrow } from "./fightSavingThrow";
import { resolveFightTurnStartTraits } from "./fightTurnStart";
`, "battle imports");

  text = replaceOnce(text,
`  const actionRollMode = combineFightRollModes(action.attackRollMode, distanceRollMode, followUpRollMode);
  const roll = rollDiceFormula(attackFormula(action.attackBonus), {
    advantageMode: fightAttackRollMode(state[attacker], state[target], actionRollMode, distanceFeet),
    naturalRollRule: "attack",
    randomInteger
  });
  const natural = naturalRoll(roll);
  const criticalAt = Math.min(20, Math.max(2, Math.trunc(action.criticalAt ?? 20)));
  const hitsArmorClass = natural === 20
  || (natural !== 1 && roll.total >= state[target].profile.armorClass);
const outcome = !hitsArmorClass
`,
`  const actionRollMode = combineFightRollModes(action.attackRollMode, distanceRollMode, followUpRollMode);
  const rollMode = fightAttackRollMode(state[attacker], state[target], actionRollMode, distanceFeet);
  const roll = resolveFightAttackRoll({
    state,
    side: attacker,
    action,
    armorClass: state[target].profile.armorClass,
    rollMode,
    randomInteger
  });
  const natural = roll.naturalRoll;
  const criticalAt = Math.min(20, Math.max(2, Math.trunc(action.criticalAt ?? 20)));
  const hitsArmorClass = fightAttackHits({
    natural,
    total: roll.total,
    armorClass: state[target].profile.armorClass,
    criticalAt
  });
const outcome = !hitsArmorClass
`, "attack roll resolver");

  text = replaceOnce(text,
`  let next = consumeFightAttackFollowUps(state, attacker, target);
`,
`  let next = consumeFightAttackFollowUps(roll.state, attacker, target);
`, "reroll state propagation");

  text = replaceOnce(text,
`  next = recordFightAttackPresentation({
    state: next,
    attacker,
    target,
    sourceName: action.name,
    outcome,
    damage: damage.appliedTotal,
    delivery: action.delivery ?? state[attacker].profile.attackDelivery ?? "weapon"
  });
  next = recordFightAttackFollowUps({
`,
`  next = recordFightAttackPresentation({
    state: next,
    attacker,
    target,
    sourceName: action.name,
    outcome,
    damage: damage.appliedTotal,
    delivery: action.delivery ?? state[attacker].profile.attackDelivery ?? "weapon"
  });
  if (outcome === "critical") {
    next = resolveFightPostCriticalMovement({ state: next, attacker, target, action });
  }
  next = recordFightAttackFollowUps({
`, "post critical movement");

  text = replaceOnce(text,
`  const attacker = state.initiative.order[state.activeIndex];
  let next = resolveFightTimedEffectSaves(state, attacker, "start", randomInteger);
  next = tickFightEffects(next, attacker, "start");
`,
`  const attacker = state.initiative.order[state.activeIndex];
  let next = resolveFightTurnStartTraits(state, attacker);
  next = resolveFightTimedEffectSaves(next, attacker, "start", randomInteger);
  next = tickFightEffects(next, attacker, "start");
`, "turn start traits");
  return text;
});

patchFile("src/utils/fightStatusPresentation.ts", (input) => {
  let text = input;
  text = replaceOnce(text,
`  resource: "◆",
  downed: "☓"
`,
`  resource: "◆",
  reroll: "↺",
  downed: "☓"
`, "reroll glyph");
  text = replaceOnce(text,
`  if (event.type === "critical") return "★";
  if (event.type === "miss") return "×";
`,
`  if (event.type === "critical") return "★";
  if (event.type === "miss") return "×";
  if (event.type === "attack-reroll" || event.type === "save-reroll") return "↺";
`, "reroll event glyph");
  text = replaceOnce(text,
`  if (event.type === "resource-used") return "◆";
`,
`  if (event.type === "resource-used" || event.type === "resource-gained") return "◆";
`, "resource glyph");
  text = replaceOnce(text,
`  if (event.type === "resource-used" && event.amount !== undefined) return `${event.amount} use${event.amount === 1 ? "" : "s"}`;
`,
`  if (event.type === "resource-used" && event.amount !== undefined) return `${event.amount} use${event.amount === 1 ? "" : "s"}`;
  if (event.type === "resource-gained" && event.amount !== undefined) return `+${event.amount}`;
`, "resource gained detail");
  return text;
});
