import { useMemo, useState } from "react";
import { rulesCoverageCatalog } from "../data/rulesCoverageCatalog";
import {
  COVERAGE_STATUS_LABELS,
  COVERAGE_SYSTEM_LABELS,
  type CoverageStatus,
  type CoverageSystemId
} from "../types/rulesCoverage";
import {
  countCoverageStatuses,
  filterRulesCoverage,
  groupCoverageByCategory
} from "../utils/rulesCoverage";
import "../styles/rules-coverage.css";

const statusOrder: CoverageStatus[] = [
  "automation-complete",
  "procedure-complete",
  "reference-complete",
  "missing",
  "requires-owned-source"
];

export const RulesCoverageDashboard = () => {
  const [system, setSystem] = useState<CoverageSystemId | "all">("all");
  const [status, setStatus] = useState<CoverageStatus | "all">("all");
  const [query, setQuery] = useState("");
  const visible = useMemo(
    () => filterRulesCoverage(rulesCoverageCatalog, { system, status, query }),
    [system, status, query]
  );
  const counts = useMemo(() => countCoverageStatuses(
    system === "all" ? rulesCoverageCatalog : rulesCoverageCatalog.filter((entry) => entry.system === system)
  ), [system]);
  const groups = useMemo(() => groupCoverageByCategory(visible), [visible]);

  return (
    <section className="coverage-dashboard">
      <header className="coverage-dashboard__heading">
        <p>DM Forge completeness ledger</p>
        <h1>Coverage is a contract—not a marketing claim.</h1>
        <span>Every tracked rule family is labeled by what the public workspace can actually provide today. Paid or protected material is never disguised as missing engineering work.</span>
      </header>

      <div className="coverage-metrics" aria-label="Coverage status totals">
        {statusOrder.map((item) => (
          <article className={`coverage-metric coverage-status--${item}`} key={item}>
            <strong>{counts[item]}</strong>
            <span>{COVERAGE_STATUS_LABELS[item]}</span>
          </article>
        ))}
      </div>

      <div className="coverage-controls" aria-label="Coverage filters">
        <label><span>System</span><select value={system} onChange={(event) => setSystem(event.target.value as CoverageSystemId | "all")}>
          <option value="all">All systems</option>
          {Object.entries(COVERAGE_SYSTEM_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select></label>
        <label><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value as CoverageStatus | "all")}>
          <option value="all">All statuses</option>
          {statusOrder.map((item) => <option key={item} value={item}>{COVERAGE_STATUS_LABELS[item]}</option>)}
        </select></label>
        <label><span>Search rule families</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="conditions, Luck, exploration…" type="search" /></label>
      </div>

      <div className="coverage-result-line" aria-live="polite">
        <strong>{visible.length} tracked rule families</strong>
        <span>Issue #26 is the governing completion program.</span>
      </div>

      {groups.length > 0 ? groups.map(([category, entries]) => (
        <section className="coverage-category" key={category}>
          <header><h2>{category}</h2><span>{entries.length}</span></header>
          <div className="coverage-grid">
            {entries.map((entry) => (
              <article className={`coverage-entry coverage-status--${entry.status}`} key={entry.id}>
                <div className="coverage-entry__meta">
                  <small>{COVERAGE_SYSTEM_LABELS[entry.system]}</small>
                  <span>{COVERAGE_STATUS_LABELS[entry.status]}</span>
                </div>
                <h3>{entry.title}</h3>
                <p>{entry.summary}</p>
                {entry.nextStep && <p className="coverage-entry__next"><strong>Next:</strong> {entry.nextStep}</p>}
                {entry.route && <a href={entry.route}>Open related workspace</a>}
              </article>
            ))}
          </div>
        </section>
      )) : <p className="coverage-empty">No tracked rule families match these filters.</p>}
    </section>
  );
};
