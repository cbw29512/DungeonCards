import { describe, expect, it } from "vitest";
import { validateDndCharacterRecord } from "../utils/dndCharacterRecord";
import {
  countDndReadyPregens,
  dndReadyPregenRecords,
  getDndReadyPregenRecord
} from "./dndReadyPregens";

describe("live released pregen catalog", () => {
  it("publishes Fighter, Barbarian, and Cleric in both editions", () => {
    expect(dndReadyPregenRecords).toHaveLength(120);
    expect(countDndReadyPregens("srd-5.1-2014")).toBe(60);
    expect(countDndReadyPregens("srd-5.2.1-2024")).toBe(60);
    expect(getDndReadyPregenRecord("srd-5.1-2014", "fighter", "champion", 20)).toBeDefined();
    expect(getDndReadyPregenRecord("srd-5.2.1-2024", "barbarian", "path-berserker", 20)).toBeDefined();
    expect(getDndReadyPregenRecord("srd-5.2.1-2024", "cleric", "life-domain", 20)).toBeDefined();
  });

  it("keeps every released ID and build slot unique", () => {
    expect(new Set(dndReadyPregenRecords.map((record) => record.id)).size).toBe(dndReadyPregenRecords.length);
    expect(new Set(dndReadyPregenRecords.map((record) => record.buildSlotId)).size).toBe(dndReadyPregenRecords.length);
  });

  it("requires every live record to pass the readiness validator", () => {
    const failures = dndReadyPregenRecords
      .map((record) => ({ record, validation: validateDndCharacterRecord(record) }))
      .filter(({ validation }) => !validation.ready)
      .map(({ record, validation }) => ({ id: record.id, issues: validation.issues }));
    expect(failures).toEqual([]);
  });
});
