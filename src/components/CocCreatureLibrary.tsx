import { useMemo, useState } from "react";
import {
  cocCreatureCatalog,
  cocCreatureKinds,
  cocCreatureThreatLevels
} from "../data/cocCreatureCatalog";
import type {
  CocCreatureKind,
  CocCreatureThreatLevel
} from "../types/coc";
import { CocCreatureDossier } from "./CocCreatureDossier";

type KindFilter = CocCreatureKind | "all";
type ThreatFilter = CocCreatureThreatLevel | "all";

const titleCase = (value: string) => value.replace(/\b\w/g, (letter) => letter.toUpperCase());

export const CocCreatureLibrary = () => {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");
  const [threat, setThreat] = useState<ThreatFilter>("all");
  const [selectedId, setSelectedId] = useState(cocCreatureCatalog[0]?.id ?? "");

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = useMemo(() => cocCreatureCatalog.filter((creature) => {
    const searchable = [
      creature.name,
      creature.classification,
      creature.keeperTag,
      creature.kind,
      creature.threat,
      ...creature.environments,
      ...creature.traits
    ].join(" ").toLowerCase();
    return (kind === "all" || creature.kind === kind)
      && (threat === "all" || creature.threat === threat)
      && (!normalizedQuery || searchable.includes(normalizedQuery));
  }), [kind, normalizedQuery, threat]);

  const selected = filtered.find((creature) => creature.id === selectedId) ?? filtered[0];

  return (
    <div className="coc-creature-library">
      <section className="coc-creature-library__summary" aria-label="Original creature library summary">
        <div><strong>{cocCreatureCatalog.length}</strong><span>original records</span></div>
        <div><strong>{cocCreatureKinds.length}</strong><span>creature families</span></div>
        <div><strong>{cocCreatureThreatLevels.length}</strong><span>threat tiers</span></div>
        <p>
          Every public record is original DM Forge content. It is designed for percentile-horror play
          without copying official creatures, scenarios, artwork, or protected sourcebook prose.
        </p>
      </section>

      <section className="coc-creature-library__controls" aria-label="Creature library filters">
        <label>
          <span>Search</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, environment, behavior…"
            type="search"
            value={query}
          />
        </label>
        <label>
          <span>Family</span>
          <select onChange={(event) => setKind(event.target.value as KindFilter)} value={kind}>
            <option value="all">All families</option>
            {cocCreatureKinds.map((value) => (
              <option key={value} value={value}>{titleCase(value)}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Threat</span>
          <select onChange={(event) => setThreat(event.target.value as ThreatFilter)} value={threat}>
            <option value="all">All threat tiers</option>
            {cocCreatureThreatLevels.map((value) => (
              <option key={value} value={value}>{titleCase(value)}</option>
            ))}
          </select>
        </label>
      </section>

      <div className="coc-creature-library__result-line">
        <strong>{filtered.length}</strong> matching creatures and NPCs
      </div>

      {selected ? (
        <div className="coc-creature-library__workspace">
          <nav className="coc-creature-library__index" aria-label="Creature dossier index">
            {filtered.map((creature) => (
              <button
                aria-pressed={selected.id === creature.id}
                key={creature.id}
                onClick={() => setSelectedId(creature.id)}
                type="button"
              >
                <span>
                  <strong>{creature.name}</strong>
                  <small>{creature.classification}</small>
                </span>
                <em>{titleCase(creature.threat)}</em>
                <small>{creature.environments.join(" · ")}</small>
              </button>
            ))}
          </nav>
          <div className="coc-creature-library__dossier">
            <CocCreatureDossier creature={selected} key={selected.id} />
          </div>
        </div>
      ) : (
        <div className="coc-creature-library__empty">
          <h2>No dossiers match those filters.</h2>
          <p>Clear the search or select a different family and threat tier.</p>
        </div>
      )}
    </div>
  );
};
