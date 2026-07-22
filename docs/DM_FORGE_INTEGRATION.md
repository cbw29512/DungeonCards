# DungeonCards → DM Forge Integration

**Owner:** `cbw29512`  
**Product name:** DM Forge — Rules Compendium & Roll Cards  
**Source repository:** `cbw29512/DungeonCards`  
**Public route:** `https://cbw29512.github.io/DungeonCards/`

## Purpose

DungeonCards is the verified rules-reference and executable-card engine for DM Forge. It remains a separately built GitHub Pages companion during the first integration phase so its React/TypeScript application, generated SRD pipeline, locked dependencies, tests, and print behavior are not destabilized by copying compiled assets into the static `monstercardforge` repository.

The user experience should still feel like one product:

- DM Forge links directly to the requested D&D workspace.
- DungeonCards identifies itself as **DM Forge — Rules Compendium & Roll Cards**.
- A persistent link returns to the main DM Forge toolkit.
- Public metadata uses the DM Forge identity.
- All data remains local and account-free.

## Stable deep links

The integration contract uses these query parameters:

| Destination | Route |
|---|---|
| Home | `?system=dnd&page=home` |
| Rules Guide | `?system=dnd&page=rules` |
| SRD Compendium | `?system=dnd&page=compendium` |
| Player Workspace | `?system=dnd&page=player` |
| DM Workspace | `?system=dnd&page=dm` |
| Monster Encounter | `?system=dnd&page=monster` |
| Card Builder | `?system=dnd&page=homebrew` |
| Monster Builder | `?system=dnd&page=monster-homebrew` |

Unknown pages fall back to Home. Direct D&D links bypass the experimental multi-system gateway. The gateway remains available when DungeonCards is opened without a recognized system parameter.

## Rules and licensing boundary

The D&D integration may promote only content that is:

- generated from the recorded SRD 5.1 or SRD 5.2.1 source PDFs;
- original DungeonCards/DM Forge functionality or homebrew;
- accompanied by required CC BY 4.0 attribution and source metadata;
- covered by the existing catalog and generation tests.

The Call of Cthulhu preview is not part of the DM Forge D&D integration. It remains an explicitly unofficial private-development preview until its separate licensing and manual-acceptance requirements are resolved.

## Data boundary

During the companion phase:

- DungeonCards retains its existing local-storage workspaces and homebrew records.
- DM Forge does not claim those records are synchronized into Campaign Hub.
- No credentials, accounts, cloud database, or paid service are introduced.
- The current downloadable/local recovery systems remain separate by origin because browsers isolate storage between `/DungeonCards/` and `/monstercardforge/` only by origin, not path; both project sites share `https://cbw29512.github.io` and therefore require careful key namespacing before any shared-store adapter is added.

## Next integration phases

1. Add a DM Forge landing page and navigation links for the companion.
2. Add live-route and deep-link browser tests in both repositories.
3. Add a namespaced, privacy-reviewed campaign-context adapter.
4. Reuse generated monster summaries in Encounter Forge without duplicating source authority.
5. Add exact spell/monster deep links from Campaign Search.
6. Evaluate a unified GitHub Actions deployment only after the companion route is stable and rollback is documented.

## Rollback

The integration is reversible:

- remove DM Forge links from the main toolkit;
- revert the DungeonCards metadata, navigation lockup, and URL parser;
- continue deploying DungeonCards from its existing GitHub Pages workflow.

The generated catalogs, card engine, and local user data are unchanged by the branding and routing layer.
