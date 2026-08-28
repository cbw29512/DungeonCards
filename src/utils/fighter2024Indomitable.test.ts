import { describe, expect, it } from "vitest";
import { dndVaultReadyBuilds } from "../data/dndVaultReadyBuilds";
import { buildCharacterFightProfile } from "./fightProfileAdapters";

const fighterProfileAt = (level: number) => {
  const build = dndVaultReadyBuilds.find((candidate) => (
    candidate.ruleset === "srd-5.2.1-2024"
    && candidate.classId === "fighter"
    && candidate.level === level
  ));
  expect(build, `Missing reviewed 2024 Fighter level ${level} pregen`).toBeDefined();
  if (!build) throw new Error(`Missing Fighter ${level}`);
  const result = buildCharacterFightProfile(build.character);
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.issues.join(" "));
  return result.profile;
};

describe("2024 Fighter Indomitable profile", () => {
  it("is absent before Fighter 9", () => {
    const profile = fighterProfileAt(8);
    expect(profile.resources?.find((resource) => resource.id === "indomitable")).toBeUndefined();
    expect(profile.failedSaveRerolls).toBeUndefined();
  });

  it.each([
    [9, 1],
    [12, 1],
    [13, 2],
    [16, 2],
    [17, 3],
    [20, 3]
  ])("gives Fighter %i the correct Indomitable uses and +level reroll bonus", (level, maximum) => {
    const profile = fighterProfileAt(level);
    expect(profile.resources?.find((resource) => resource.id === "indomitable")).toMatchObject({
      maximum,
      refresh: "long-rest",
      longRestRecovery: "all"
    });
    expect(profile.failedSaveRerolls).toEqual([{
      id: "indomitable",
      name: "Indomitable",
      resourceId: "indomitable",
      bonus: level,
      autoUse: "when-can-succeed"
    }]);
  });
});
