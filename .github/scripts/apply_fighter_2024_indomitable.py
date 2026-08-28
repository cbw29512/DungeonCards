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
    'import { assertFightBattleProfile } from "./fightBattleValidation";\n',
    'import { assertFightBattleProfile } from "./fightBattleValidation";\nimport { resolveFightSavingThrow } from "./fightSavingThrow";\n',
    "saving throw import",
)
replace_once(
    battle_path,
    "  fightMovementAllowance,\n  fightSaveRollMode,\n  isFightIncapacitated,",
    "  fightMovementAllowance,\n  isFightIncapacitated,",
    "remove direct save roll mode import",
)

old_concentration = '''const resolveConcentrationDamageCheck = (
  state: FightBattleState,
  target: FightSide,
  damage: number,
  randomInteger?: RandomIntegerSource
): FightBattleState => {
  if (damage <= 0 || !state[target].concentration || state[target].currentHitPoints <= 0) return state;
  const dc = Math.max(10, Math.floor(damage / 2));
  const bonus = state[target].profile.savingThrowBonuses?.con ?? 0;
  const roll = rollDiceFormula(attackFormula(bonus), {
    advantageMode: fightSaveRollMode(state[target]),
    randomInteger
  });
  const succeeded = roll.total >= dc;
  let next = appendFightPresentationEvent(state, {
    type: succeeded ? "save-success" : "save-failure",
    delivery: "spell",
    side: target,
    sourceSide: target,
    label: `Concentration save ${succeeded ? "succeeds" : "fails"}`,
    iconKey: "concentration",
    sourceName: state[target].concentration?.sourceName,
    saveAbility: "con",
    saveDc: dc,
    saveTotal: roll.total
  });
  if (!succeeded) next = breakFightConcentration(next, target);
  return next;
};'''
new_concentration = '''const resolveConcentrationDamageCheck = (
  state: FightBattleState,
  target: FightSide,
  damage: number,
  randomInteger?: RandomIntegerSource
): FightBattleState => {
  if (damage <= 0 || !state[target].concentration || state[target].currentHitPoints <= 0) return state;
  const dc = Math.max(10, Math.floor(damage / 2));
  const result = resolveFightSavingThrow({
    state,
    side: target,
    ability: "con",
    dc,
    randomInteger
  });
  let next = appendFightPresentationEvent(result.state, {
    type: result.succeeded ? "save-success" : "save-failure",
    delivery: "spell",
    side: target,
    sourceSide: target,
    label: `Concentration save ${result.succeeded ? "succeeds" : "fails"}`,
    iconKey: "concentration",
    sourceName: state[target].concentration?.sourceName,
    saveAbility: "con",
    saveDc: dc,
    saveTotal: result.total
  });
  if (!result.succeeded) next = breakFightConcentration(next, target);
  return next;
};'''
replace_once(battle_path, old_concentration, new_concentration, "concentration save integration")

old_save = '''  const target: FightSide = attacker === "character" ? "monster" : "character";
  const bonus = state[target].profile.savingThrowBonuses?.[action.saveAbility] ?? 0;
  const saveRoll = rollDiceFormula(attackFormula(bonus), {
    advantageMode: fightSaveRollMode(state[target]),
    randomInteger
  });
  const succeeded = saveRoll.total >= action.saveDc;
  const delivery = action.delivery ?? "spell";
  let next = appendFightPresentationEvent(state, {
    type: succeeded ? "save-success" : "save-failure",
    delivery,
    side: target,
    sourceSide: attacker,
    label: `${action.name}: ${action.saveAbility.toUpperCase()} save ${succeeded ? "succeeds" : "fails"}`,
    sourceName: action.name,
    saveAbility: action.saveAbility,
    saveDc: action.saveDc,
    saveTotal: saveRoll.total
  });'''
new_save = '''  const target: FightSide = attacker === "character" ? "monster" : "character";
  const result = resolveFightSavingThrow({
    state,
    side: target,
    ability: action.saveAbility,
    dc: action.saveDc,
    randomInteger
  });
  const succeeded = result.succeeded;
  const delivery = action.delivery ?? "spell";
  let next = appendFightPresentationEvent(result.state, {
    type: succeeded ? "save-success" : "save-failure",
    delivery,
    side: target,
    sourceSide: attacker,
    label: `${action.name}: ${action.saveAbility.toUpperCase()} save ${succeeded ? "succeeds" : "fails"}`,
    sourceName: action.name,
    saveAbility: action.saveAbility,
    saveDc: action.saveDc,
    saveTotal: result.total
  });'''
replace_once(battle_path, old_save, new_save, "ordinary save integration")

adapter_path = "src/utils/fightProfileAdapters.ts"
replace_once(
    adapter_path,
    '  const resources: NonNullable<FightCombatantProfile["resources"]> = [];\n',
    '  const resources: NonNullable<FightCombatantProfile["resources"]> = [];\n  const failedSaveRerolls: NonNullable<FightCombatantProfile["failedSaveRerolls"]> = [];\n',
    "failed save reroll declaration",
)
old_fighter_close = '''    }
  }
  const spells = characterSpellActions(character);'''
new_fighter_close = '''    }
    if (character.ruleset === "srd-5.2.1-2024" && character.level >= 9) {
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
replace_once(adapter_path, old_fighter_close, new_fighter_close, "Indomitable Fighter profile")
replace_once(
    adapter_path,
    '      savingThrowBonuses: characterSaveBonuses(character),\n',
    '      savingThrowBonuses: characterSaveBonuses(character),\n      failedSaveRerolls: failedSaveRerolls.length ? failedSaveRerolls : undefined,\n',
    "failed save reroll profile field",
)
