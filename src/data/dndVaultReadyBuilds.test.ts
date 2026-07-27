import { describe, expect, it } from "vitest";
import { isDndCharacterVaultReady } from "../utils/dndCharacterVaultValidation";
import {
  countDndVaultReadyBuilds,
  dndVaultReadyBuilds,
  getDndVaultReadyBuildById
} from "./dndVaultReadyBuilds";

describe("Character Vault Ready registry", () => {
  it("keeps profile and build-slot identities collision safe", () => {
    expect(new Set(dndVaultReadyBuilds.map((profile) => profile.id)).size).toBe(dndVaultReadyBuilds.length);
    expect(new Set(dndVaultReadyBuilds.map((profile) => profile.buildSlotId)).size).toBe(dndVaultReadyBuilds.length);
  });

  it("resolves every profile by immutable saved-build identity", () => {
    for (const profile of dndVaultReadyBuilds) {
      expect(getDndVaultReadyBuildById(profile.id)).toBe(profile);
    }
    expect(getDndVaultReadyBuildById("missing-profile")).toBeUndefined();
  });

  it("contains only verified profiles that pass the complete release gate", () => {
    const failures = dndVaultReadyBuilds
      .filter((profile) => !isDndCharacterVaultReady(profile))
      .map((profile) => profile.id);
    expect(failures).toEqual([]);
  });

  it("derives edition totals from the live registry", () => {
    for (const ruleset of ["srd-5.1-2014", "srd-5.2.1-2024"] as const) {
      expect(countDndVaultReadyBuilds(ruleset)).toBe(
        dndVaultReadyBuilds.filter((profile) => profile.ruleset === ruleset).length
      );
    }
  });
});
