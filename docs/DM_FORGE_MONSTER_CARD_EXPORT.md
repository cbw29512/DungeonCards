# DM Forge Lazy Full-Stat Monster Card Export

**Schema:** 1  
**Index route:** `/DungeonCards/dm-forge/monster-cards/index.json`  
**Record route:** `/DungeonCards/dm-forge/monster-cards/records/<source-id>.json`  
**Generator:** `scripts/dm-forge/export-monster-card-records.mjs`

## Purpose

Monster Card Forge needs complete source text for traits, actions, bonus actions, reactions, legendary actions, spells, gear, and full stat blocks. Loading all 642 long records when the page opens would waste bandwidth and memory. DungeonCards therefore publishes:

1. One compact searchable index containing identity, ruleset, CR, AC, HP, speed, source page, and a record path.
2. One complete JSON record per monster, fetched only when the user selects that monster.

DungeonCards remains the source authority. The main DM Forge repository must not commit a copied 642-record catalog.

## Record contract

Each full record includes:

- Stable generated ID and path-safe record URL
- 5e or 5.5e ruleset and original SRD edition/version
- Source page, reference, official PDF URL, SHA-256 digest, required attribution, and CC BY 4.0 label
- Name, size, type, alignment, and full Challenge text
- Armor Class, Hit Points, Speed, Initiative, ability text, saves, skills, vulnerabilities, resistances, immunities, gear, senses, and languages
- Traits
- Actions
- Bonus Actions
- Reactions
- Legendary Actions
- Spells
- Complete generated raw stat block
- Explicit scope labels: `verified-srd-reference` and `reference-complete`

The export does not claim that every natural-language rule has executable roll automation.

## Output safety

- IDs must be path-safe before files are written.
- The export directory is deleted and rebuilt, preventing stale records.
- Unsupported editions fail the build.
- Missing source manifests or source digests fail the build.
- Every record must retain a complete raw stat block.
- Index entries intentionally exclude raw text and full sections.
- Identical inputs produce identical files; no current timestamp is embedded.

## Monster Card Forge consumer rules

Monster Card Forge may:

- Search the compact index.
- Fetch one full record after selection.
- Cache records in memory for the current page session.
- Derive a concise combat card from traceable text.
- Render ordered reference panels and continuation cards.

Monster Card Forge must:

- Preserve the original source and license metadata.
- Keep verified SRD records visually and semantically distinct from original and user-created homebrew.
- Never silently omit text because a fixed card is full.
- Never claim executable automation merely because a reference is complete.
- Keep the existing three hand-structured showcase monsters available while the full-record adapter matures.
- Fail clearly and retain local showcase/homebrew functionality when the companion is unavailable.

## Validation sequence

Before all records are promoted in Monster Card Forge, validate at least:

- One straightforward 5e creature
- One straightforward 5.5e creature
- One spellcaster
- One legendary creature
- One record with reactions or bonus actions
- One unusually long record that requires continuation panels

Physical print acceptance remains required after automated browser and overflow tests pass.
