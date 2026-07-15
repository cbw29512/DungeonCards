const corrections = {
  "srd-5.1-2014:Animal Friendship": (spell) => ({
    ...spell,
    description: spell.description.replace("the spells ends", "the spell ends"),
    higherLevels: "At Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, you can affect one additional beast for each slot level above 1st."
  }),
  "srd-5.2.1-2024:Animal Friendship": (spell) => ({
    ...spell,
    description: spell.description.replace("the spells ends", "the spell ends")
  }),
  "srd-5.1-2014:Animal Messenger": (spell) => ({
    ...spell,
    higherLevels: spell.higherLevels.replace("3nd level", "3rd level")
  })
};

export const applySpellSourceCorrections = (spells) => spells.map((spell) => {
  const correction = corrections[`${spell.edition}:${spell.name}`];
  if (!correction) return spell;

  console.warn("Applying documented SRD PDF text correction", {
    edition: spell.edition,
    spell: spell.name
  });
  return correction(spell);
});
