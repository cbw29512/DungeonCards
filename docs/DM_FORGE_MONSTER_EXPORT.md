# DM Forge Monster Summary Export

**Schema:** 1  
**Generated route:** `/DungeonCards/dm-forge/srd-monster-summaries.json`  
**Generator:** `scripts/dm-forge/export-monster-summaries.mjs`

## Purpose

DungeonCards owns the deterministic SRD spell and monster generation pipeline. DM Forge tools must not copy those 642 records into handwritten JavaScript files. This export provides the small, source-traceable subset required by Encounter Forge while keeping DungeonCards as the source authority.

## Exported fields

Each monster summary contains:

- Stable generated source ID
- DM Forge ruleset ID (`2014` or `2024`)
- Original SRD edition ID and source version
- Name, size, creature type, and alignment
- Numeric Armor Class plus original AC text
- Numeric average Hit Points plus original HP text
- Speed text
- Challenge Rating and XP
- Dexterity score and modifier
- Legendary-action presence
- Source page and source-reference label

The export deliberately does not invent:

- Environment tags absent from the generated SRD record
- Tactics
- Encounter roles
- Artwork
- Lair or regional material not present in the parsed record
- Structured automated attacks for records that remain reference-only

## Source and license metadata

The root payload includes each SRD source's:

- Edition and version
- Official PDF URL
- SHA-256 digest
- Required attribution
- Monster count
- CC BY 4.0 license label

Consumers must preserve that metadata in documentation and any printed or exported content derived from the records.

## Determinism

The generated payload has no current timestamp. Identical SRD inputs and generator code produce byte-equivalent JSON. The production build regenerates the file before Vite assembles `dist`.

## Validation

The test suite requires:

- Exactly 314 SRD 5.1 records
- Exactly 328 SRD 5.2.1 records
- Exactly 642 unique IDs
- Parsable AC, HP, CR, XP, Dexterity, and source pages for every record
- Known edition mapping only
- Manifest count agreement
- Valid source digests and attribution
- Deterministic repeated output

A generation failure blocks the DungeonCards production build and therefore blocks deployment.

## Consumer rules

Encounter Forge may cache the export for the current browser session, but it must:

- Show which records came from DungeonCards SRD data
- Keep 5e and 5.5e records separated
- Preserve the source ID and source-reference label
- Fail clearly when the companion export is unavailable
- Keep the existing custom-monster workflow available offline
- Avoid silently substituting a stale handwritten fallback catalog

Monster Card Forge will require a later, richer adapter because its printable stat cards need full traits, actions, reactions, legendary actions, raw text, and attribution—not only encounter-summary fields.
