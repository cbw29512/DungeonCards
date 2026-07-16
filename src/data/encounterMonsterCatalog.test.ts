import { describe, expect, it } from "vitest";
import { encounterMonsterCatalog } from "./encounterMonsterCatalog";
import { srdMonsters } from "./srdCompendium";

const key = (ruleset: string, name: string) =>
  `${ruleset}:${name.trim().toLowerCase()}`;

describe("encounter monster catalog", () => {
  it("represents every generated SRD monster exactly once", () => {
    expect(encounterMonsterCatalog).toHaveLength(srdMonsters.length);

    const encounterKeys = encounterMonsterCatalog.map((monster) =>
      key(monster.ruleset, monster.name)
    );
    const generatedKeys = srdMonsters.map((monster) =>
      key(monster.edition, monster.name)
    );

    expect(new Set(encounterKeys).size).toBe(encounterKeys.length);
    expect(new Set(encounterKeys)).toEqual(new Set(generatedKeys));
  });

  it("keeps the three richer formatted monsters in place of duplicate references", () => {
    const formattedNames = encounterMonsterCatalog
      .filter((entry) => entry.kind === "formatted")
      .map((entry) => entry.name)
      .sort();

    expect(formattedNames).toEqual([
      "Adult Black Dragon",
      "Goblin",
      "Lich"
    ]);
  });

  it("keeps IDs unique for encounter selection and persistence", () => {
    const ids = encounterMonsterCatalog.map((monster) => monster.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("stores only CR values in visible encounter metadata", () => {
    encounterMonsterCatalog.forEach((monster) => {
      expect(monster.cr).not.toMatch(/\bXP\b/i);
      expect(monster.cr).not.toContain("(");
    });
  });
});
