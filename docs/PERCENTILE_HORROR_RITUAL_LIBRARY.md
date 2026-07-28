# Percentile Horror Ritual Library

Status: first public ritual-library release  
Issue: #101  
Content boundary: original DM Forge records only

## Release contents

This release replaces the single occult demonstration with 24 complete Keeper-facing rituals:

- 4 wards;
- 4 divinations;
- 4 bindings;
- 4 transformations;
- 4 passages;
- 4 afflictions.

The library also spans four explicit risk tiers: low, moderate, severe, and catastrophic.

Every record contains:

- stable ID, name, ritual family, and risk tier;
- searchable scene contexts;
- casting time, Magic Point cost, and Sanity-cost formula;
- casting skill, original default value, and difficulty;
- range, duration formula, and duration unit;
- two or more physical or fictional requirements;
- concise summary and complete original effect text;
- explicit failure or backlash;
- executable casting, Sanity-cost, duration, and procedure actions;
- universal print metadata.

## User experience

The Spells & Rituals page now provides:

- full-text search across names, effects, failures, requirements, and contexts;
- ritual-family filtering;
- risk-tier filtering;
- a compact Keeper index;
- one active live ritual card;
- editable Magic Points, Sanity, casting skill, and Bonus/Penalty dice;
- casting checks at the record's selected difficulty;
- rolled Sanity cost and duration;
- visible requirements, effect, failure, and source-safe content notice;
- print behavior that prints the selected ritual rather than the index.

All 24 rituals also appear in the unified Card Catalog as original Keeper-only cards.

## Public-content boundary

These rituals do not reproduce official Call of Cthulhu spells, tomes, scenarios, artwork, names, or protected sourcebook prose. Their names, requirements, effects, costs, and backlash text were authored for DM Forge.

The live cards link to the separately verified generic Magic Point and first-casting procedure. The individual ritual effects remain original content rather than claims about an official catalog.

User-owned official rituals belong in the private library rather than the public repository.

## Release gates

Automated tests require:

- exactly 24 records;
- unique IDs and names;
- complete coverage of all six ritual families and four risk tiers;
- valid percentile skills and difficulties;
- valid Magic Point, Sanity, and duration fields;
- complete contexts, requirements, summaries, effects, and backlash;
- mechanically increasing average Magic Point cost by risk tier;
- valid Card Platform adaptation for every record;
- exact Card Catalog source counts.

## Next library milestones

1. Add original occupations and complete Investigator records.
2. Build original field gear, investigative tools, protective equipment, and vehicles as item cards.
3. Add persistent ritual instances for learned status, first-casting state, active duration, and independent resource history.
4. Build original clues, locations, handouts, NPC motives, and case frameworks.
