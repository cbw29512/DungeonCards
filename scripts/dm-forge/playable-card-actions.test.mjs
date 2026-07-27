import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const actionTypes = read("src/types/cardPlatformActions.ts");
const execution = read("src/utils/cardActionExecution.ts");
const history = read("src/utils/cardActionHistoryStorage.ts");
const transaction = read("src/utils/cardActionTransaction.ts");
const hook = read("src/hooks/useCardActionRuntime.ts");
const actions = read("src/components/cardPlatform/PlayableCardActions.tsx");
const workspace = read("src/components/cardPlatform/PlayableDeckWorkspace.tsx");
const application = read("src/styles/application.css");
const actionStyles = read("src/styles/playable-card-actions.css");
const historyStyles = read("src/styles/card-action-history.css");
const printStyles = read("src/styles/playable-deck-responsive-print.css");

describe("playable card action execution architecture", () => {
  it("keeps executable metadata structured and definition-owned", () => {
    expect(actionTypes).toContain("resourceCosts?: CardActionResourceCost[]");
    expect(actionTypes).toContain("percentileTarget?: number");
    expect(execution).toContain("const canonicalAction = definition.actions.find");
    expect(execution).toContain("calculateCardActionCosts(definition, instance, canonicalAction)");
  });

  it("reuses safe deterministic dice and percentile engines", () => {
    expect(execution).toContain("rollDiceFormula");
    expect(execution).toContain("rollCocPercentile");
    expect(execution).toContain("options.randomInteger");
    expect(execution).toContain("availableDefinitionIds");
  });

  it("isolates bounded exact-system history", () => {
    expect(history).toContain("dungeon-cards.card-action-history.v1");
    expect(history).toContain("MAX_CARD_ACTION_HISTORY_ENTRIES = 500");
    expect(history).toContain("value.gameSystemId !== expectedSystem");
    expect(history).toContain("contains duplicate IDs");
  });

  it("commits deck state and history together with rollback", () => {
    expect(transaction).toContain("previousLibrary");
    expect(transaction).toContain("previousHistory");
    expect(transaction).toContain("restore(storage, libraryKey, previousLibrary)");
    expect(transaction).toContain("restore(storage, historyKey, previousHistory)");
    expect(hook).toContain("commitCardActionTransaction");
  });

  it("keeps action controls and history outside the universal card shell", () => {
    expect(actions).toContain("playable-card-actions");
    expect(workspace).toContain("CardActionHistoryPanel");
    expect(application).toContain('@import "./playable-card-actions.css"');
    expect(application).toContain('@import "./card-action-history.css"');
    expect(actionStyles).not.toMatch(/250px|350px|2\.5in|3\.5in/);
    expect(historyStyles).not.toMatch(/250px|350px|2\.5in|3\.5in/);
  });

  it("excludes operational action state from physical printing", () => {
    for (const token of ["playable-card-runtime__controls", "playable-card-actions", "playable-card-action__result", "card-action-history"]) {
      expect(printStyles).toContain(token);
    }
    expect(printStyles).toContain("display: none !important");
    expect(printStyles).toContain("var(--dm-card-print-width)");
  });
});
