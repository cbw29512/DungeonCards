# Percentile Horror Creature Library

Status: first public-library release  
Issue: #101  
Content boundary: original DM Forge records only

## Release contents

The first release replaces the single creature demonstration with 24 complete Keeper-facing records:

- 6 human adversaries;
- 6 altered animals and swarms;
- 8 unnatural creatures;
- 4 catastrophic entities.

Every record contains:

- stable ID and searchable name;
- creature family, threat tier, classification, and environments;
- STR, CON, SIZ, DEX, INT, and POW;
- HP, MP, Move, Build, Damage Bonus, armor, and Dodge;
- failed Sanity-loss formula;
- original description, three Keeper-facing traits or cues, and at least two attacks;
- executable attack, damage, Dodge, and Sanity-loss Card Platform actions;
- independently tracked HP and MP resources;
- universal print metadata.

## User experience

The Creatures & NPCs page provides:

- full-text search across names, classifications, environments, threat tiers, and Keeper cues;
- creature-family filtering;
- threat-tier filtering;
- a compact dossier index;
- one active live dossier with attack, damage, Dodge, Sanity, HP, and MP controls;
- print behavior that prints the selected dossier rather than the index.

All 24 records also appear in the unified Call of Cthulhu Card Catalog as Keeper-only original cards.

## Public-content and licensing boundary

These records do not reproduce official Call of Cthulhu creatures, scenarios, artwork, spell text, or protected sourcebook prose. Names, descriptions, statistics, attacks, and Keeper cues were created for DM Forge.

The public library may continue to grow through original content, public-domain inspiration with new expression and statistics, creator submissions with appropriate permission, or separately licensed material. User-owned official material belongs in the private library rather than the public repository.

## Release gates

Automated tests require:

- exactly 24 records in this release;
- unique IDs and names;
- coverage of all four creature families and all four threat tiers;
- complete characteristics, environments, traits, attacks, and resource values;
- bounded percentile attack and Dodge values;
- valid dice formulas;
- successful Card Platform adaptation and validation for every record.

## Next library milestones

1. Add persistent encounter instances so multiple copies of one creature can track independent state.
2. Add structured attack damage type, impaling/blunt behavior, range, target count, and opposed-response metadata.
3. Expand to 50 original creatures and NPCs.
4. Build original weapon, ritual, occupation, investigator, location, clue, and case-framework libraries to the same standard.
