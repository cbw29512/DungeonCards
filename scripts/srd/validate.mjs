const requiredSentinels = {
  "srd-5.1-2014": {
    spells: ["Acid Splash", "Fireball", "Wish"],
    monsters: ["Goblin", "Adult Black Dragon", "Lich"]
  },
  "srd-5.2.1-2024": {
    spells: ["Acid Splash", "Elementalism", "Starry Wisp", "Wish"],
    monsters: ["Goblin Minion", "Allosaurus", "Adult Black Dragon", "Lich"]
  }
};

const assert = (condition, message, context = {}) => {
  if (condition) return;
  console.error("SRD catalog validation failed", { message, ...context });
  throw new Error(message);
};

const validateUnique = (records, label) => {
  const ids = records.map((record) => record.id);
  const names = records.map((record) => `${record.edition}:${record.name}`);
  assert(new Set(ids).size === ids.length, `${label} IDs must be unique.`);
  assert(new Set(names).size === names.length, `${label} names must be unique per edition.`);
};

const validateEdition = (spells, monsters, edition) => {
  const editionSpells = spells.filter((record) => record.edition === edition);
  const editionMonsters = monsters.filter((record) => record.edition === edition);
  const sentinels = requiredSentinels[edition];

  assert(editionSpells.length >= 300, `${edition} must contain at least 300 spells.`, {
    count: editionSpells.length
  });
  assert(editionMonsters.length >= 250, `${edition} must contain at least 250 monsters.`, {
    count: editionMonsters.length
  });

  sentinels.spells.forEach((name) => assert(
    editionSpells.some((record) => record.name === name),
    `${edition} is missing spell ${name}.`
  ));
  sentinels.monsters.forEach((name) => assert(
    editionMonsters.some((record) => record.name === name),
    `${edition} is missing monster ${name}.`
  ));
};

const validateEditionDifferences = (spells, monsters) => {
  const oldAcid = spells.find((record) => (
    record.edition === "srd-5.1-2014" && record.name === "Acid Splash"
  ));
  const newAcid = spells.find((record) => (
    record.edition === "srd-5.2.1-2024" && record.name === "Acid Splash"
  ));

  assert(oldAcid?.description.includes("two creatures"), "2014 Acid Splash wording was not detected.");
  assert(newAcid?.description.includes("5-foot-radius Sphere"), "2024 Acid Splash wording was not detected.");
  assert(!newAcid?.description.includes("two creatures"), "2014 Acid Splash leaked into the 2024 catalog.");
  assert(!monsters.some((record) => (
    record.edition === "srd-5.1-2014" && record.name === "Goblin Minion"
  )), "2024 Goblin Minion leaked into the 2014 catalog.");
};

export const validateCatalogs = ({ spells, monsters, manifest }) => {
  validateUnique(spells, "Spell");
  validateUnique(monsters, "Monster");
  Object.keys(requiredSentinels).forEach((edition) => validateEdition(spells, monsters, edition));
  validateEditionDifferences(spells, monsters);
  assert(manifest.length === 2, "Both official SRD source manifests are required.");
  manifest.forEach((source) => {
    assert(/^[a-f0-9]{64}$/.test(source.sha256), "Each source PDF needs a SHA-256 digest.", {
      edition: source.edition
    });
    assert(source.attribution.includes("Creative Commons Attribution 4.0"), "Attribution is incomplete.", {
      edition: source.edition
    });
  });
};
