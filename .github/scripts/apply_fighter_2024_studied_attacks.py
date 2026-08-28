from pathlib import Path


def replace_once(path: str, old: str, new: str, label: str) -> None:
    file_path = Path(path)
    text = file_path.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 exact match, got {count}")
    file_path.write_text(text.replace(old, new, 1))


battle_path = "src/utils/fightBattle.ts"
replace_once(
    battle_path,
    'import { fightActionMaximumRangeFeet, fightAttackDistanceRollMode } from "./fightAttackRange";\n',
    'import { fightActionMaximumRangeFeet, fightAttackDistanceRollMode } from "./fightAttackRange";\nimport {\n  consumeFightAttackFollowUps,\n  expireFightAttackFollowUps,\n  fightAttackFollowUpRollMode,\n  recordFightAttackFollowUps\n} from "./fightAttackFollowUps";\n',
    "follow-up engine import",
)
replace_once(
    battle_path,
    'import {\n  fightAttackRollMode,\n',
    'import {\n  combineFightRollModes,\n  fightAttackRollMode,\n',
    "roll-mode combiner import",
)
replace_once(
    battle_path,
    '''    character: {
      positionFeet: 0,
      profile: character,''',
    '''    character: {
      combatantId: character.id,
      positionFeet: 0,
      turnsStarted: 0,
      profile: character,''',
    "character identity/turn clock",
)
replace_once(
    battle_path,
    '''      effects: [],
      resources: initialResources(character),''',
    '''      effects: [],
      attackFollowUps: [],
      resources: initialResources(character),''',
    "character follow-up state",
)
replace_once(
    battle_path,
    '''    monster: {
      positionFeet: 30,
      profile: monster,''',
    '''    monster: {
      combatantId: monster.id,
      positionFeet: 30,
      turnsStarted: 0,
      profile: monster,''',
    "monster identity/turn clock",
)
replace_once(
    battle_path,
    '''      effects: [],
      resources: initialResources(monster),''',
    '''      effects: [],
      attackFollowUps: [],
      resources: initialResources(monster),''',
    "monster follow-up state",
)
replace_once(
    battle_path,
    '''    [side]: {
      ...state[side],
      resources,''',
    '''    [side]: {
      ...state[side],
      turnsStarted: (state[side].turnsStarted ?? 0) + 1,
      resources,''',
    "per-combatant turn clock",
)

old_roll = '''  const distanceFeet = fightBattleDistanceFeet(state);
  const distanceRollMode = fightAttackDistanceRollMode(action, distanceFeet, state[target]);
  const roll = rollDiceFormula(attackFormula(action.attackBonus), {
    advantageMode: fightAttackRollMode(state[attacker], state[target], distanceRollMode, distanceFeet),
    naturalRollRule: "attack",
    randomInteger
  });'''
new_roll = '''  const distanceFeet = fightBattleDistanceFeet(state);
  const distanceRollMode = fightAttackDistanceRollMode(action, distanceFeet, state[target]);
  const followUpRollMode = fightAttackFollowUpRollMode(state[attacker], state[target]);
  const actionRollMode = combineFightRollModes(action.attackRollMode, distanceRollMode, followUpRollMode);
  const roll = rollDiceFormula(attackFormula(action.attackBonus), {
    advantageMode: fightAttackRollMode(state[attacker], state[target], actionRollMode, distanceFeet),
    naturalRollRule: "attack",
    randomInteger
  });'''
replace_once(battle_path, old_roll, new_roll, "attack roll-mode composition")
replace_once(
    battle_path,
    '  let next = recordDamageDefenses(state, target, attacker, action.name, damage.components);\n',
    '  let next = consumeFightAttackFollowUps(state, attacker, target);\n  next = recordDamageDefenses(next, target, attacker, action.name, damage.components);\n',
    "consume next attack follow-up",
)
old_after_presentation = '''  next = recordFightAttackPresentation({
    state: next,
    attacker,
    target,
    sourceName: action.name,
    outcome,
    damage: damage.appliedTotal,
    delivery: action.delivery ?? state[attacker].profile.attackDelivery ?? "weapon"
  });
  if (outcome !== "miss") next = applyActionEffects(next, target, attacker, action.name, action.effectsOnHit);'''
new_after_presentation = '''  next = recordFightAttackPresentation({
    state: next,
    attacker,
    target,
    sourceName: action.name,
    outcome,
    damage: damage.appliedTotal,
    delivery: action.delivery ?? state[attacker].profile.attackDelivery ?? "weapon"
  });
  next = recordFightAttackFollowUps({
    state: next,
    attacker,
    target,
    outcome,
    damage: damage.appliedTotal
  });
  if (outcome !== "miss") next = applyActionEffects(next, target, attacker, action.name, action.effectsOnHit);'''
replace_once(battle_path, old_after_presentation, new_after_presentation, "record attack follow-up")
replace_once(
    battle_path,
    '  next = tickFightEffects(next, attacker, "end");\n  return next.activeIndex === 0\n',
    '  next = tickFightEffects(next, attacker, "end");\n  next = expireFightAttackFollowUps(next, attacker);\n  return next.activeIndex === 0\n',
    "end-of-next-turn expiration",
)

adapter_path = "src/utils/fightProfileAdapters.ts"
replace_once(
    adapter_path,
    '  const failedSaveRerolls: NonNullable<FightCombatantProfile["failedSaveRerolls"]> = [];\n',
    '  const failedSaveRerolls: NonNullable<FightCombatantProfile["failedSaveRerolls"]> = [];\n  const attackFollowUps: NonNullable<FightCombatantProfile["attackFollowUps"]> = [];\n',
    "attack follow-up profile declaration",
)
old_close = '''    if (character.ruleset === "srd-5.2.1-2024" && character.level >= 9) {
      const indomitableMaximum = character.level >= 17 ? 3 : character.level >= 13 ? 2 : 1;
      resources.push({
        id: "indomitable",
        name: "Indomitable",
        maximum: indomitableMaximum,
        refresh: "long-rest",
        longRestRecovery: "all"
      });
      failedSaveRerolls.push({
        id: "indomitable",
        name: "Indomitable",
        resourceId: "indomitable",
        bonus: character.level,
        autoUse: "when-can-succeed"
      });
    }
  }
  const spells = characterSpellActions(character);'''
new_close = '''    if (character.ruleset === "srd-5.2.1-2024" && character.level >= 9) {
      const indomitableMaximum = character.level >= 17 ? 3 : character.level >= 13 ? 2 : 1;
      resources.push({
        id: "indomitable",
        name: "Indomitable",
        maximum: indomitableMaximum,
        refresh: "long-rest",
        longRestRecovery: "all"
      });
      failedSaveRerolls.push({
        id: "indomitable",
        name: "Indomitable",
        resourceId: "indomitable",
        bonus: character.level,
        autoUse: "when-can-succeed"
      });
    }
    if (character.ruleset === "srd-5.2.1-2024" && character.level >= 13) {
      attackFollowUps.push({
        id: "studied-attacks",
        name: "Studied Attacks",
        trigger: "miss",
        rollMode: "advantage",
        target: "same-creature",
        expires: "end-of-next-turn"
      });
    }
  }
  const spells = characterSpellActions(character);'''
replace_once(adapter_path, old_close, new_close, "2024 Fighter Studied Attacks profile")
replace_once(
    adapter_path,
    '      failedSaveRerolls: failedSaveRerolls.length ? failedSaveRerolls : undefined,\n',
    '      failedSaveRerolls: failedSaveRerolls.length ? failedSaveRerolls : undefined,\n      attackFollowUps: attackFollowUps.length ? attackFollowUps : undefined,\n',
    "attack follow-up profile field",
)
