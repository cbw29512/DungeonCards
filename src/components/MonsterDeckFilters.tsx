import type { RulesetId } from "../types/ruleCards";
import type { WorkspaceView } from "../types/workspaces";

const editionLabel = (ruleset: RulesetId): string => (
  ruleset === "srd-5.1-2014" ? "2014 / SRD 5.1" : "2024 / SRD 5.2.1"
);

const displayType = (value: string): string => (
  value.replace(/\b\w/g, (character) => character.toUpperCase())
);

type Props = {
  query: string;
  ruleset: RulesetId;
  type: string;
  types: string[];
  view: WorkspaceView;
  onQueryChange(query: string): void;
  onRulesetChange(ruleset: RulesetId): void;
  onTypeChange(type: string): void;
};

export const MonsterDeckFilters = ({
  query,
  ruleset,
  type,
  types,
  view,
  onQueryChange,
  onRulesetChange,
  onTypeChange
}: Props) => (
  <div className="monster-deck__filters">
    <input
      aria-label="Search monsters"
      onChange={(event) => onQueryChange(event.target.value)}
      placeholder={view === "table" ? "Search My Encounter…" : "Search this edition's monsters…"}
      type="search"
      value={query}
    />
    <label>
      <span className="sr-only">Encounter edition</span>
      <select
        aria-label="Encounter edition"
        onChange={(event) => onRulesetChange(event.target.value as RulesetId)}
        value={ruleset}
      >
        {(["srd-5.1-2014", "srd-5.2.1-2024"] as const).map((option) => (
          <option key={option} value={option}>{editionLabel(option)}</option>
        ))}
      </select>
    </label>
    <select
      aria-label="Filter monster type"
      onChange={(event) => onTypeChange(event.target.value)}
      value={type}
    >
      {types.map((option) => (
        <option key={option} value={option}>
          {option === "all" ? "All creature types" : displayType(option)}
        </option>
      ))}
    </select>
  </div>
);
