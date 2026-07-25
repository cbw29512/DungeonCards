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
  { id: "damage-death", category: "Combat", title: "Damage, healing, zero HP, and death", status: "procedure-complete", summary: "Core procedures are explained, with executable damage and healing cards for supported effects.", nextStep: "Add persistent death-save, temporary-HP, and stabilization tracking." },
  { id: "conditions", category: "Combat", title: "Conditions and exhaustion", status: "procedure-complete", summary: "All 15 named conditions are searchable, printable, sourced, and separated by edition; Exhaustion has an interactive edition-specific tracker.", nextStep: "Add persistent condition ownership, duration, save-at-end, and effect timers to the encounter board.", route: "?system=dnd&page=conditions" },
  { id: "spell-reference", category: "Magic", title: "Complete SRD spell reference", status: "reference-complete", summary: "All generated SRD spells are searchable, edition-tagged, sourced, and attributed.", route: "?system=dnd&page=compendium" },
  { id: "spellcasting-upcasting", category: "Magic", title: "Spellcasting and higher-level slots", status: "procedure-complete", summary: "Every leveled SRD spell has a slot selector; tested common patterns calculate additive increments and irregular rules require manual review.", nextStep: "Expand reviewed automation patterns and add concentration and component trackers.", route: "?system=dnd&page=compendium" },
  { id: "weapons", category: "Equipment", title: "SRD weapon tables and attacks", status: "automation-complete", summary: "Complete SRD weapon tables feed executable attack and damage cards.", route: "?system=dnd&page=player" },
  { id: "weapon-mastery", category: "Equipment", title: "Weapon Mastery properties", status: "missing", summary: "The 2024 mastery system is not yet represented as a complete reference and automation layer.", nextStep: "Add SRD 5.2.1 mastery references and per-weapon procedures.", only: "dnd-2024" },
  { id: "armor-gear", category: "Equipment", title: "Armor, tools, adventuring gear, costs, and encumbrance", status: "missing", summary: "A complete equipment catalog and carrying engine are not yet present.", nextStep: "Import licensed SRD equipment and add load calculations." },
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
