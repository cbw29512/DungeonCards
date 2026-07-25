export type CoverageSystemId = "dnd-2014" | "dnd-2024" | "coc-7e";

export type CoverageStatus =
  | "missing"
  | "reference-complete"
  | "procedure-complete"
  | "automation-complete"
  | "requires-owned-source";

export type RulesCoverageEntry = {
  id: string;
  system: CoverageSystemId;
  category: string;
  title: string;
  status: CoverageStatus;
  summary: string;
  nextStep?: string;
  route?: string;
};

export const COVERAGE_SYSTEM_LABELS: Record<CoverageSystemId, string> = {
  "dnd-2014": "D&D 2014 · SRD 5.1",
  "dnd-2024": "D&D 2024 · SRD 5.2.1",
  "coc-7e": "Call of Cthulhu 7th Edition"
};

export const COVERAGE_STATUS_LABELS: Record<CoverageStatus, string> = {
  missing: "Missing",
  "reference-complete": "Reference complete",
  "procedure-complete": "Procedure complete",
  "automation-complete": "Automation complete",
  "requires-owned-source": "Requires owned source"
};
