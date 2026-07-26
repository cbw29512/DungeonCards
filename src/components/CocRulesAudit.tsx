import { cocInvestigatorRuleSources } from "../data/cocInvestigatorRuleSources";
import { cocLuckRuleSources } from "../data/cocLuckRuleSources";
import { cocRuleSources, cocRuleVerificationLabels } from "../data/cocRuleSources";
import { cocSanityCampaignSources } from "../data/cocSanityCampaignSources";
import type { CocRuleVerificationStatus } from "../types/coc";
import { CocRuleStatus } from "./CocRuleStatus";

const statusOrder: CocRuleVerificationStatus[] = [
  "disputed",
  "needs-review",
  "prototype",
  "verified"
];

const auditedSources = [
  ...cocRuleSources,
  ...cocLuckRuleSources,
  ...cocInvestigatorRuleSources,
  ...cocSanityCampaignSources
];

export const CocRulesAudit = () => {
  const counts = Object.fromEntries(
    statusOrder.map((status) => [
      status,
      auditedSources.filter((source) => source.status === status).length
    ])
  ) as Record<CocRuleVerificationStatus, number>;

  return (
    <section className="coc-section coc-section--page">
      <header className="coc-section__heading">
        <small>Rules accuracy ledger</small>
        <h1>Nothing becomes official because the interface looks finished.</h1>
        <p>
          Every rule family remains traceable to a source record. Prototype and needs-review entries are usable for interface testing, but they are not presented as certified rules.
        </p>
      </header>

      <div className="coc-record-grid">
        {statusOrder.map((status) => (
          <span key={status}>
            <small>{cocRuleVerificationLabels[status]}</small>
            <strong>{counts[status]}</strong>
          </span>
        ))}
      </div>

      <div className="coc-rule-audit-list">
        {auditedSources.map((source) => (
          <article className="coc-card" key={source.id}>
            <header className="coc-card__header">
              <div>
                <small>{source.edition} · {source.chapterOrSection}</small>
                <h2>{source.ruleName}</h2>
              </div>
              <span className="coc-card__stamp">SRC</span>
            </header>
            <CocRuleStatus source={source} />
          </article>
        ))}
      </div>
    </section>
  );
};
