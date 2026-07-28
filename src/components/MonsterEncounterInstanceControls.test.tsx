import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { ResolvedMonsterEncounterInstance } from "../types/monsterEncounterWorkspace";
import { MonsterEncounterInstanceControls } from "./MonsterEncounterInstanceControls";

const noOp = () => {};

const instance: ResolvedMonsterEncounterInstance = {
  instanceId: "sentinel-1",
  monsterId: "formatted-sentinel",
  label: "Sentinel 1",
  pinned: false,
  currentHitPoints: 85,
  maximumHitPoints: 85,
  initiative: 12,
  conditions: ["Poisoned", "Prone"],
  reactionAvailable: true,
  rechargeReady: false,
  legendaryActionsMaximum: 0,
  legendaryActionsRemaining: 0,
  monster: {
    id: "formatted-sentinel",
    kind: "formatted",
    name: "Formatted Sentinel",
    ruleset: "srd-5.1-2014",
    cr: "5",
    type: "Construct",
    size: "Large",
    source: "Original test record",
    monster: {
      id: "formatted-sentinel",
      ruleset: "srd-5.1-2014",
      source: "Original test record",
      name: "Formatted Sentinel",
      cr: "5",
      type: "Construct",
      size: "Large",
      layoutHint: "standard",
      ac: "18",
      hp: "85 (10d10 + 30)",
      speed: "30 ft.",
      abilities: { str: 18, dex: 10, con: 16, int: 6, wis: 10, cha: 5 },
      saves: [],
      skills: [],
      senses: "darkvision 60 ft.",
      languages: "understands Common but can't speak",
      resistances: [],
      immunities: [],
      conditionImmunities: ["Charmed", "Poisoned"],
      traits: [],
      actions: [],
      bonusActions: [],
      reactions: [],
      legendaryActions: [],
      spellcasting: null,
      lairActions: [],
      regionalEffects: []
    }
  }
};

describe("MonsterEncounterInstanceControls condition guidance", () => {
  it("marks an active immune condition as a deliberate override without hiding other conditions", () => {
    const html = renderToStaticMarkup(
      <MonsterEncounterInstanceControls
        instance={instance}
        ruleset="srd-5.1-2014"
        onAddCondition={noOp}
        onRemoveCondition={noOp}
        onRename={noOp}
        onSetHitPoints={noOp}
        onSetInitiative={noOp}
        onSetLegendaryRemaining={noOp}
        onSetMaximumHitPoints={noOp}
        onSetReaction={noOp}
        onSetRecharge={noOp}
        onStartTurn={noOp}
      />
    );

    expect(html).toContain('data-condition-immune="true"');
    expect(html).toContain("Poisoned · immune override");
    expect(html).toContain("Prone");
    expect(html).toContain("Stat block lists immunity to Poisoned. Remove override.");
  });
});