import type {
  CoverageStatus,
  CoverageSystemId,
  RulesCoverageEntry
} from "../types/rulesCoverage";

type DndTemplate = {
  id: string;
  category: string;
  title: string;
  status: CoverageStatus;
  summary: string;
  nextStep?: string;
  route?: string;
  only?: CoverageSystemId;
};

const templates: DndTemplate[] = [
  { id: "d20-tests", category: "Core resolution", title: "d20 tests and DC resolution", status: "automation-complete", summary: "Executable checks, saves, attacks, modifiers, and roll history are available.", route: "?system=dnd&page=player" },
  { id: "advantage", category: "Core resolution", title: "Advantage and Disadvantage", status: "automation-complete", summary: "Normal, Advantage, and Disadvantage controls are built into eligible roll cards.", route: "?system=dnd&page=rules" },
  { id: "proficiency", category: "Core resolution", title: "Proficiency and expertise", status: "procedure-complete", summary: "Core use is explained, but a complete character-derived proficiency engine is not yet present.", nextStep: "Connect bonuses to a structured character record." },
  { id: "initiative-turns", category: "Combat", title: "Initiative, turns, actions, and reactions", status: "procedure-complete", summary: "Table procedure is documented; a persistent initiative and action-economy tracker remains unfinished.", nextStep: "Build encounter initiative and reaction tracking." },
  { id: "movement-special-attacks", category: "Combat", title: "Movement, cover, grappling, shoving, and special attacks", status: "procedure-complete", summary: "Edition-separated procedures cover movement costs, jumping, cover, Grapple, Shove, Hide, Search, and Opportunity Attacks, with live calculators for deterministic rules.", nextStep: "Integrate creature positions, reach, movement budgets, and reactions into a persistent encounter board.", route: "?system=dnd&page=movement" },
  { id: "damage-death", category: "Combat", title: "Damage, healing, zero HP, and death", status: "automation-complete", summary: "A persistent edition-labeled tracker applies Temporary HP before damage, massive-damage death, damage and Critical Hits at 0 HP, Death Saves including natural 1 and 20, healing resets, stabilization, 1d4-hour recovery, and 2024 Bloodied status.", nextStep: "Connect the tracker to future encounter combatants and add sourced resurrection and rest recovery workflows.", route: "?system=dnd&page=health" },
  { id: "conditions", category: "Combat", title: "Conditions and exhaustion", status: "procedure-complete", summary: "All 15 named conditions are searchable, printable, sourced, and separated by edition; Exhaustion has an interactive edition-specific tracker.", nextStep: "Add persistent condition ownership, duration, save-at-end, and effect timers to the encounter board.", route: "?system=dnd&page=conditions" },
  { id: "spell-reference", category: "Magic", title: "Complete SRD spell reference", status: "reference-complete", summary: "All generated SRD spells are searchable, edition-tagged, sourced, and attributed.", route: "?system=dnd&page=compendium" },
  { id: "spellcasting-upcasting", category: "Magic", title: "Spellcasting and higher-level slots", status: "procedure-complete", summary: "Every leveled SRD spell has a slot selector; tested common patterns calculate additive increments and irregular rules require manual review.", nextStep: "Expand reviewed automation patterns and add concentration and component trackers.", route: "?system=dnd&page=compendium" },
  { id: "weapons", category: "Equipment", title: "SRD weapon tables and attacks", status: "automation-complete", summary: "Complete SRD weapon tables feed executable attack and damage cards.", route: "?system=dnd&page=player" },
  { id: "weapon-mastery", category: "Equipment", title: "Weapon Mastery properties", status: "automation-complete", summary: "All eight SRD 5.2.1 properties and all 38 weapon assignments are searchable and source-linked, with an unlock gate, Topple DC calculator, and Cleave/Nick turn tracking.", route: "?system=dnd&page=mastery", only: "dnd-2024" },
  { id: "armor-loadout", category: "Equipment", title: "Armor, shields, carrying capacity, and encumbrance", status: "automation-complete", summary: "All twelve SRD armor types and the shield are edition-labeled and source-linked, with AC, Dexterity caps, training consequences, Strength and Stealth effects, don/doff timing, size-scaled carrying limits, and the optional 2014 encumbrance variant.", route: "?system=dnd&page=armor" },
  { id: "mounts-cargo", category: "Equipment", title: "Mounts, drawn vehicles, cargo, saddles, and barding", status: "automation-complete", summary: "All eight official mounts, five drawn vehicles, edition-available saddles, team pulling capacity, vehicle-inclusive cargo limits, purchase costs, and barding conversions are interactive and source-linked.", route: "?system=dnd&page=armor" },
  { id: "containers-packs", category: "Equipment", title: "Containers, storage capacity, and equipment packs", status: "automation-complete", summary: "Sixteen container and ammunition-storage entries plus all seven equipment packs are edition-separated, searchable, source-linked, and supported by weight-capacity, quantity, cost, and load-planning tools.", route: "?system=dnd&page=armor" },
  { id: "large-vehicles", category: "Equipment", title: "Airborne and waterborne vehicles", status: "automation-complete", summary: "All shared waterborne vehicles and the 2024 Airship are edition-separated and source-linked. The 2024 workspace adds crew, passenger, cargo, AC, HP, damage threshold, fare, weather, river, and repair operations without backfilling those values into 2014.", route: "?system=dnd&page=armor" },
  { id: "tools", category: "Equipment", title: "Artisan tools, kits, gaming sets, instruments, and tool checks", status: "automation-complete", summary: "All 25 nonvehicle tool families and 14 specific gaming/instrument variants are searchable and source-linked. The runner preserves 2014 DM-selected abilities and 2024 fixed abilities, Utilize DCs, Craft lists, proficiency bonuses, and relevant-skill Advantage.", route: "?system=dnd&page=armor" },
  { id: "gear-catalog", category: "Equipment", title: "Remaining adventuring gear and item procedures", status: "missing", summary: "The remaining licensed adventuring-gear catalog and item-specific procedures are not yet organized into a searchable workspace.", nextStep: "Import the remaining edition-separated adventuring gear, costs, weights, attacks, saving throws, light, restraints, traps, and other licensed procedures." },
  { id: "monster-reference", category: "Creatures", title: "Complete SRD monster reference", status: "reference-complete", summary: "All generated SRD monsters are searchable and receive structured quick-combat faces with full sourced folios.", route: "?system=dnd&page=monster" },
  { id: "character-creation", category: "Characters", title: "Character creation and advancement", status: "missing", summary: "Ability generation, leveling, hit points, multiclassing, and advancement are not yet a complete workflow.", nextStep: "Build an SRD character record and advancement engine." },
  { id: "srd-options", category: "Characters", title: "SRD classes, species, backgrounds, and feats", status: "missing", summary: "The legally reusable SRD character-option catalog has not yet been imported into the workspace.", nextStep: "Generate edition-separated SRD option references." },
  { id: "exploration", category: "Exploration and social", title: "Travel, visibility, hiding, hazards, and survival", status: "missing", summary: "Exploration procedures are not yet complete.", nextStep: "Add travel, light, search, falling, suffocation, food, and navigation tools." },
  { id: "social", category: "Exploration and social", title: "Social interaction and influence", status: "missing", summary: "A complete licensed social-procedure guide is not yet available.", nextStep: "Add source-grounded social procedures without inventing mandatory mechanics." },
  { id: "rests-downtime", category: "Campaign play", title: "Rests, downtime, crafting, lifestyle, and services", status: "missing", summary: "These campaign procedures are not yet reference- or procedure-complete.", nextStep: "Build edition-specific rest and downtime workspaces." },
  { id: "gm-operations", category: "GM operations", title: "Encounter building, hazards, treasure, and improvisation", status: "missing", summary: "The GM workspace has selected tools, but not complete encounter, hazard, treasure, and improvisation coverage.", nextStep: "Add CR/XP, encounter budgets, hazard DCs, objects, and treasure workflows." },
  { id: "campaign-tracking", category: "GM operations", title: "Initiative, concentration, condition, and effect tracking", status: "missing", summary: "Persistent session-state tracking remains unfinished.", nextStep: "Build a local-first live encounter board." },
  { id: "homebrew", category: "Creator tools", title: "Homebrew cards and monsters", status: "automation-complete", summary: "Users can create, preview, save, print, and remove local homebrew cards and monster folios.", route: "?system=dnd&page=homebrew" },
  { id: "non-srd", category: "Owned content", title: "Paid-book and non-SRD content", status: "requires-owned-source", summary: "DM Forge cannot republish protected book content. A private user-owned import layer is required.", nextStep: "Add private structured imports that never publish protected text." }
];

const systems: CoverageSystemId[] = ["dnd-2014", "dnd-2024"];

export const dndRulesCoverage: RulesCoverageEntry[] = systems.flatMap((system) =>
  templates
    .filter((item) => !item.only || item.only === system)
    .map((item) => ({
      id: `${system}-${item.id}`,
      system,
      category: item.category,
      title: item.title,
      status: item.status,
      summary: item.summary,
      nextStep: item.nextStep,
      route: item.route
    }))
);
