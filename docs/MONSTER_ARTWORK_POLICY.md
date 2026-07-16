# Monster Artwork Licensing Policy

Last reviewed: 2026-07-15

## Purpose

Dungeon Cards may display monster artwork only when the rights for that exact image are documented. A monster name or stat block appearing in an SRD does not grant permission to copy artwork from a rulebook, D&D Beyond, a card product, a video game, or another website.

This is a project policy and recordkeeping standard, not legal advice.

## Allowed artwork

An image may be added only when it is covered by one of these categories:

- public domain or Public Domain Mark;
- CC0 1.0;
- Creative Commons Attribution, with every required credit included;
- Creative Commons Attribution-ShareAlike, with attribution and share-alike obligations recorded;
- GPL-licensed game artwork, with the exact GPL version and project attribution recorded;
- direct written permission from the copyright holder;
- original artwork created specifically for Dungeon Cards.

## Rejected artwork

Do not add:

- official Wizards of the Coast, D&D Beyond, Monster Manual, adventure-book, card, miniature, or promotional artwork unless a separate written license explicitly covers this use;
- images whose only justification is the OGL or SRD license;
- fan art without the artist's written permission or an explicit compatible license;
- images marked "all rights reserved";
- images with no identifiable source or creator;
- Creative Commons NonCommercial images, because the public project must remain usable in commercial and noncommercial contexts;
- Creative Commons NoDerivatives images when the application crops, filters, recolors, or otherwise adapts the image;
- stock images whose license prohibits redistribution in a public source repository;
- AI-generated images copied from another person or service without documented reuse rights.

## Required manifest fields

Every approved non-fallback image must have one `MonsterArtworkRecord` in `src/data/monsterArtwork.ts` containing:

- stable artwork ID;
- monster name and applicable rulesets;
- direct display URL or local asset path;
- source-description page URL;
- work title;
- creator or credited project;
- machine-readable license ID;
- human-readable license name;
- license URL;
- complete attribution sentence;
- description of cropping, filtering, recoloring, or other modifications;
- date the source and license were verified.

No artwork record may be merged when any required field is blank.

## Attribution format

Use this order whenever practical:

`Title — Creator — Source — License — Modifications`

Example:

`European dragon — Friedrich Justin Bertuch — Wikimedia Commons — Public Domain — responsively cropped and darkened for the card.`

The compact card front may show creator and license. The complete record belongs in `ATTRIBUTION.md` and the artwork manifest.

## Modifications

Cropping, responsive resizing, contrast adjustment, and color treatment must be recorded. Never imply that a historical or open-source illustration is official D&D artwork or an exact canonical depiction of the SRD creature.

Share-alike and GPL assets must remain traceable to their original source and license. Modified copies must retain the applicable notices and source availability obligations.

## Current behavior

- A verified manifest record replaces the generated portrait fallback for the matching monster and ruleset.
- A missing, rejected, or failed image uses the original generated fallback.
- The first verified batch covers Goblin, Adult Black Dragon, and Lich.
- Additional monsters remain on generated fallbacks until an individual image passes this policy.

## User-supplied images

The Monster Builder may eventually accept user-provided artwork. Before such an image is published or exported, the user must confirm that they own it or have permission to use and redistribute it. User claims do not convert official or infringing artwork into permitted content.

## Removal and correction

When an attribution is incomplete, a license changes, ownership is disputed, or a rights holder requests removal, disable the manifest entry first and investigate before restoring it. Preserve the issue or pull-request record documenting the decision.
