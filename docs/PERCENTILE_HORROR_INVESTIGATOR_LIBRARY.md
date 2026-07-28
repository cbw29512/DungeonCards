# Percentile Horror Investigator Library

Status: first public occupation and premade-Investigator release  
Issue: #101  
Content boundary: original DM Forge records only

## Release contents

The release adds 24 original occupation packages across six categories:

- academic;
- investigative;
- medical;
- technical;
- social;
- field.

It also adds 12 complete premade Investigators:

- 6 for 1920s play;
- 6 for modern play.

Every occupation contains:

- stable ID, name, category, and supported eras;
- original summary;
- eight suggested skills;
- Credit Rating range;
- contacts;
- typical gear;
- a story complication.

Every premade Investigator contains:

- identity, age, pronouns, era, residence, and birthplace;
- one original occupation link;
- the complete fixed characteristic array;
- derived HP, Move, Sanity, Magic Points, Damage Bonus, and Build;
- Luck;
- thirteen or more skills with regular, hard, and extreme thresholds;
- linked original weapons where appropriate;
- biography, ideology, significant people, meaningful locations, treasured possessions, traits, and play notes.

## User experience

The Investigator page now provides:

- search across names, occupations, skills, locations, and traits;
- era filtering;
- occupation-category filtering;
- a compact premade-Investigator index;
- one selected live dossier;
- independent HP, Sanity, Magic Point, and Luck tracking;
- complete characteristic and skill thresholds;
- linked field loadout;
- print-ready character dossier;
- one occupation directory containing all full package details.

The existing builder remains available and can now load any original occupation package into its eight editable skill slots.

All 12 premade Investigators also appear in the unified Card Catalog as original player-safe `investigator` cards with executable top-skill actions and independent resources.

## Duplicate-content boundary

- The selected dossier does not repeat the full occupation package shown in the directory.
- The Investigator route exposes one percentile roller.
- Premade records have unique IDs and names.
- Occupations have unique IDs and names.
- The unified catalog rejects duplicate storage IDs and duplicate normalized visible identities.

See `docs/NO_DUPLICATE_CONTENT_POLICY.md` for the repository-wide rule.

## Public-content boundary

The occupations and Investigators are original game content. They do not reproduce an official occupation catalog, iconic published Investigators, scenario characters, protected sourcebook prose, artwork, or proprietary statistics.

User-owned official characters and occupations belong in the private library.

## Release gates

Automated tests require:

- exactly 24 occupations;
- all six occupation categories and both eras;
- unique occupation IDs, names, and suggested skills;
- exactly 12 premade Investigators split evenly between eras;
- valid fixed characteristic arrays;
- complete skill packages with no creation-level Mythos allocation;
- valid occupation and weapon links;
- complete story fields;
- valid Card Platform adaptation;
- unique exact-system Card Catalog identities;
- duplicate-free routed page composition.

## Next milestones

1. Add original mundane field gear, investigative tools, protective equipment, and vehicles.
2. Add browser-local saved Investigator instances with independent long-term advancement history.
3. Add original clues, locations, handouts, NPC motives, and case frameworks.
4. Add export/import for complete private Investigator sheets.
