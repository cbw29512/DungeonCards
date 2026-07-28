import type { RulesetId } from "../types/ruleCards";
import type { WorkspaceView } from "../types/workspaces";
import type {
  MonsterFeatureFilter,
  MonsterWorkspaceSort
} from "../utils/monsterWorkspaceCatalog";

const editionLabel = (ruleset: RulesetId): string => (
  ruleset === "srd-5.1-2014" ? "2014 / SRD 5.1" : "2024 / SRD 5.2.1"
);

const displayType = (value: string): string => (
  value.replace(/\b\w/g, (character) => character.toUpperCase())
);

const challengeOptions = [
  { value: "", label: "Any CR" },
  { value: "0", label: "CR 0" },
  { value: "0.125", label: "CR 1/8" },
  { value: "0.25", label: "CR 1/4" },
  { value: "0.5", label: "CR 1/2" },
  ...Array.from({ length: 30 }, (_, index) => ({ value: String(index + 1), label: `CR ${index + 1}` }))
];

const featureOptions: Array<{ value: MonsterFeatureFilter; label: string }> = [
  { value: "all", label: "All capabilities" },
  { value: "legendary", label: "Legendary actions" },
  { value: "recharge", label: "Recharge ability" },
  { value: "special-reaction", label: "Special reaction" },
  { value: "spellcaster", label: "Spellcaster" }
];

const sortOptions: Array<{ value: MonsterWorkspaceSort; label: string }> = [
  { value: "name-asc", label: "Name A–Z" },
  { value: "cr-asc", label: "CR low to high" },
  { value: "cr-desc", label: "CR high to low" },
  { value: "hp-desc", label: "HP high to low" },
  { value: "ac-desc", label: "AC high to low" }
];

type Props = {
  query: string;
  ruleset: RulesetId;
  type: string;
  types: string[];
  size: string;
  sizes: string[];
  feature: MonsterFeatureFilter;
  minimumChallenge: number | null;
  maximumChallenge: number | null;
  sort: MonsterWorkspaceSort;
  view: WorkspaceView;
  onQueryChange(query: string): void;
  onRulesetChange(ruleset: RulesetId): void;
  onTypeChange(type: string): void;
  onSizeChange(size: string): void;
  onFeatureChange(feature: MonsterFeatureFilter): void;
  onMinimumChallengeChange(value: number | null): void;
  onMaximumChallengeChange(value: number | null): void;
  onSortChange(sort: MonsterWorkspaceSort): void;
  onClear(): void;
};

const EditionControl = ({
  ruleset,
  onRulesetChange
}: Pick<Props, "ruleset" | "onRulesetChange">) => (
  <label className="monster-filter-field">
    <span>Edition</span>
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
);

export const MonsterDeckFilters = ({
  query,
  ruleset,
  type,
  types,
  size,
  sizes,
  feature,
  minimumChallenge,
  maximumChallenge,
  sort,
  view,
  onQueryChange,
  onRulesetChange,
  onTypeChange,
  onSizeChange,
  onFeatureChange,
  onMinimumChallengeChange,
  onMaximumChallengeChange,
  onSortChange,
  onClear
}: Props) => {
  if (view === "table") {
    return (
      <section className="monster-deck__filter-panel" aria-label="Encounter edition">
        <div className="monster-deck__filters">
          <EditionControl ruleset={ruleset} onRulesetChange={onRulesetChange} />
          <p className="monster-filter-note" role="note">
            Monster Library search and filters are paused here so every saved combatant stays visible.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="monster-deck__filter-panel" aria-label="Monster Library filters">
      <div className="monster-deck__filters">
        <label className="monster-filter-field monster-filter-field--search">
          <span>Search</span>
          <input
            aria-label="Search monsters"
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Name, action, trait, source…"
            type="search"
            value={query}
          />
        </label>
        <EditionControl ruleset={ruleset} onRulesetChange={onRulesetChange} />
        <label className="monster-filter-field">
          <span>Creature type</span>
          <select aria-label="Filter monster type" onChange={(event) => onTypeChange(event.target.value)} value={type}>
            {types.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All creature types" : displayType(option)}
              </option>
            ))}
          </select>
        </label>
        <label className="monster-filter-field">
          <span>Size</span>
          <select aria-label="Filter monster size" onChange={(event) => onSizeChange(event.target.value)} value={size}>
            {sizes.map((option) => (
              <option key={option} value={option}>{option === "all" ? "All sizes" : displayType(option)}</option>
            ))}
          </select>
        </label>
        <label className="monster-filter-field">
          <span>Capability</span>
          <select
            aria-label="Filter monster capability"
            onChange={(event) => onFeatureChange(event.target.value as MonsterFeatureFilter)}
            value={feature}
          >
            {featureOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="monster-filter-field">
          <span>Minimum CR</span>
          <select
            aria-label="Minimum challenge rating"
            onChange={(event) => onMinimumChallengeChange(event.target.value === "" ? null : Number(event.target.value))}
            value={minimumChallenge ?? ""}
          >
            {challengeOptions.map((option) => <option key={`min-${option.value}`} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="monster-filter-field">
          <span>Maximum CR</span>
          <select
            aria-label="Maximum challenge rating"
            onChange={(event) => onMaximumChallengeChange(event.target.value === "" ? null : Number(event.target.value))}
            value={maximumChallenge ?? ""}
          >
            {challengeOptions.map((option) => <option key={`max-${option.value}`} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="monster-filter-field">
          <span>Sort library</span>
          <select aria-label="Sort monster library" onChange={(event) => onSortChange(event.target.value as MonsterWorkspaceSort)} value={sort}>
            {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      </div>
      <button className="monster-filter-clear" onClick={onClear} type="button">Clear filters</button>
    </section>
  );
};