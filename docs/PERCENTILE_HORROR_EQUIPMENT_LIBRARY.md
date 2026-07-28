# Percentile Horror Equipment Library

Status: first public armory release  
Issue: #101  
Content boundary: original DM Forge tabletop records only

## Release contents

The first equipment-library release replaces the single weapon demonstration with 24 complete records:

- 6 melee weapons;
- 3 thrown weapons;
- 6 handguns;
- 5 long guns;
- 4 shotguns.

Every record contains:

- stable ID, name, category, and weapon family;
- 1920s, modern, or universal era metadata;
- common, restricted, or special availability;
- one- or two-handed use;
- percentile skill and an original default value;
- tabletop damage formula and Damage Bonus behavior;
- practical tabletop range and attacks-per-round field;
- remaining-use capacity where applicable;
- malfunction field where applicable;
- reload or recovery summary;
- impaling classification and original usage notes;
- executable percentile, damage, and procedure actions;
- universal print metadata.

## User experience

The Equipment page now provides:

- full-text search across names, categories, skills, eras, availability, range, and notes;
- weapon-family filtering;
- era filtering;
- a compact armory index;
- one active live card with skill adjustment, Bonus/Penalty dice, Damage Bonus input, remaining-use tracking, damage resolution, and print behavior;
- direct access to the existing firearm, injury, and healing procedure cards.

All 24 records also appear in the unified Card Catalog as original player-safe weapon cards.

## Public-content boundary

These records are original game content. They do not reproduce an official Call of Cthulhu equipment table, sourcebook prose, artwork, scenarios, or proprietary record set. Names describing ordinary object categories are used with newly authored game values, summaries, and interaction metadata.

User-owned official equipment records belong in the private library rather than the public repository.

## Release gates

Automated tests require:

- exactly 24 records;
- unique IDs and names;
- all five weapon families;
- all three era values;
- all three availability tiers;
- complete skill, damage, range, action, and descriptive fields;
- firearm remaining-use and malfunction consistency;
- melee and thrown Damage Bonus consistency;
- valid Card Platform adaptation for every record;
- exact Card Catalog source counts.

## Next library milestones

1. Build a full original ritual and unnatural-effect library.
2. Add mundane field gear, medical supplies, investigative tools, vehicles, and protective equipment as `item` cards.
3. Build original occupations and complete investigator records.
4. Add persistent equipment instances with independent ammunition, condition, and ownership state.
