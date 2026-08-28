import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import { createFightBattle } from "../utils/fightBattle";
import { applyFightEffect, grantFightTemporaryHitPoints, startFightConcentration } from "../utils/fightBattleEffects";
import { appendFightPresentationEvent } from "../utils/fightPresentationEvents";
import { DndFightPixelArena } from "./DndFightPixelArena";

const profile = (name: string): FightCombatantProfile => ({
  id: name.toLowerCase(),
  name,
  ruleset: "srd-5.1-2014",
  armorClass: 14,
  hitPoints: 20,
  attackBonus: 5,
  averageDamageOnHit: 7,
  attacksPerRound: 1,
  attackDamageFormula: "1d8+3",
  criticalBonusFormula: "1d8",
  sourceActionName: "Longsword"
});

describe("8-bit Fight Card arena", () => {
  it("renders two cards with HP, stick combatants, persistent statuses, and the latest transient event", () => {
    let battle = createFightBattle(profile("Hero"), profile("Monster"));
    battle = startFightConcentration(battle, "character", "Bless");
    battle = grantFightTemporaryHitPoints(battle, "character", 5, "Heroism");
    battle = applyFightEffect(battle, "monster", {
      id: "poisoned",
      name: "Poisoned",
      kind: "condition",
      iconKey: "poisoned",
      tickTiming: "manual",
      saveAbility: "CON",
      saveDc: 14
    });
    battle = appendFightPresentationEvent(battle, {
      type: "save-failure",
      delivery: "condition",
      side: "monster",
      label: "Poisoned: save fails",
      iconKey: "poisoned",
      saveAbility: "CON",
      saveDc: 14,
      saveTotal: 11
    });

    const html = renderToStaticMarkup(<DndFightPixelArena battle={battle} />);
    expect((html.match(/fight-status-card /g) ?? [])).toHaveLength(2);
    expect((html.match(/fight-stick/g) ?? []).length).toBeGreaterThanOrEqual(2);
    expect(html).toContain("5 TEMP HP");
    expect(html).toContain("Bless");
    expect(html).toContain("Poisoned");
    expect(html).toContain("fight-status-burst--save-failure");
    expect(html).toContain("CON 11 / DC 14");
  });

  it("keeps persistent status truth separate from a transient hit burst", () => {
    let battle = createFightBattle(profile("Hero"), profile("Monster"));
    battle = applyFightEffect(battle, "monster", {
      id: "frightened",
      name: "Frightened",
      kind: "condition",
      iconKey: "frightened",
      remainingRounds: 2,
      tickTiming: "end"
    });
    battle = appendFightPresentationEvent(battle, {
      type: "hit",
      delivery: "spell",
      side: "monster",
      sourceSide: "character",
      sourceName: "Fire Bolt",
      label: "Fire Bolt hits",
      amount: 8
    });

    const html = renderToStaticMarkup(<DndFightPixelArena battle={battle} />);
    expect(html).toContain("Frightened");
    expect(html).toContain("fight-status-burst--spell");
    expect(html).toContain("Fire Bolt hits");
    expect(html).toContain("-8");
  });
});
