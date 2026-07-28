import { useMemo, useState } from "react";
import {
  cocRitualCatalog,
  cocRitualKinds,
  cocRitualRiskLevels
} from "../data/cocRitualCatalog";
import type { CocRitualKind, CocRitualRisk } from "../types/coc";
import { CocMagicProcedureCard } from "./CocMagicProcedureCard";
import { CocSpellCard } from "./CocSpellCard";

type KindFilter = CocRitualKind | "all";
type RiskFilter = CocRitualRisk | "all";

const titleCase = (value: string) => value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export const CocRitualLibrary = () => {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");
  const [risk, setRisk] = useState<RiskFilter>("all");
  const [selectedId, setSelectedId] = useState(cocRitualCatalog[0]?.id ?? "");
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(() => cocRitualCatalog.filter((ritual) => {
    const searchable = [
      ritual.name,
      ritual.kind,
      ritual.risk,
      ritual.castingSkillName,
      ritual.range,
      ritual.summary,
      ritual.effect,
      ritual.failure,
      ...ritual.contexts,
      ...ritual.requirements
    ].join(" ").toLowerCase();
    return (kind === "all" || ritual.kind === kind)
      && (risk === "all" || ritual.risk === risk)
      && (!normalizedQuery || searchable.includes(normalizedQuery));
  }), [kind, normalizedQuery, risk]);

  const selected = filtered.find((ritual) => ritual.id === selectedId) ?? filtered[0];

  return (
    <div className="coc-ritual-library">
      <section className="coc-ritual-library__summary" aria-label="Original ritual library summary">
        <div><strong>{cocRitualCatalog.length}</strong><span>original rituals</span></div>
        <div><strong>{cocRitualKinds.length}</strong><span>ritual families</span></div>
        <div><strong>{cocRitualRiskLevels.length}</strong><span>risk tiers</span></div>
        <p>
          Every public entry is original DM Forge content. The library supplies occult tools for
          percentile-horror play without reproducing official spells, tomes, scenarios, or protected prose.
        </p>
      </section>

      <section className="coc-ritual-library__procedure" aria-label="Magic procedure">
        <CocMagicProcedureCard />
      </section>

      <section className="coc-ritual-library__controls" aria-label="Ritual library filters">
        <label>
          <span>Search</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, effect, requirement, context…"
            type="search"
            value={query}
          />
        </label>
        <label>
          <span>Family</span>
          <select onChange={(event) => setKind(event.target.value as KindFilter)} value={kind}>
            <option value="all">All ritual families</option>
            {cocRitualKinds.map((value) => (
              <option key={value} value={value}>{titleCase(value)}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Risk</span>
          <select onChange={(event) => setRisk(event.target.value as RiskFilter)} value={risk}>
            <option value="all">All risk tiers</option>
            {cocRitualRiskLevels.map((value) => (
              <option key={value} value={value}>{titleCase(value)}</option>
            ))}
          </select>
        </label>
      </section>

      <div className="coc-ritual-library__result-line">
        <strong>{filtered.length}</strong> matching ritual records
      </div>

      {selected ? (
        <div className="coc-ritual-library__workspace">
          <nav className="coc-ritual-library__index" aria-label="Ritual record index">
            {filtered.map((ritual) => (
              <button
                aria-pressed={selected.id === ritual.id}
                key={ritual.id}
                onClick={() => setSelectedId(ritual.id)}
                type="button"
              >
                <span>
                  <strong>{ritual.name}</strong>
                  <small>{titleCase(ritual.kind)} · {ritual.contexts.join(" · ")}</small>
                </span>
                <em>{titleCase(ritual.risk)}</em>
                <small>{ritual.magicPointCost} MP · {ritual.sanityCostFormula} SAN · {titleCase(ritual.difficulty)}</small>
              </button>
            ))}
          </nav>
          <div className="coc-ritual-library__record">
            <CocSpellCard key={selected.id} spell={selected} />
          </div>
        </div>
      ) : (
        <div className="coc-ritual-library__empty">
          <h2>No rituals match those filters.</h2>
          <p>Clear the search or select a different family and risk tier.</p>
        </div>
      )}

      <div className="coc-legal-note">
        <strong>Occult-content boundary</strong>
        <p>Public rituals are original, creator-submitted, public-domain adaptations with new expression, or separately licensed. User-owned official material belongs in the private library.</p>
      </div>
    </div>
  );
};
