import { useEffect, useMemo, useState } from "react";
import { srdManifest, srdMonsters, srdSpells } from "../data/srdCompendium";
import type { RulesetId } from "../types/ruleCards";
import { RULESET_LABELS } from "../types/ruleCards";
import { SrdMonsterReferenceCard } from "./SrdMonsterReferenceCard";
import { SrdSpellReferenceCard } from "./SrdSpellReferenceCard";

type CatalogKind = "spells" | "monsters";
type EditionFilter = RulesetId | "all";

const PAGE_SIZE = 48;

export const SrdCompendium = () => {
  const [kind, setKind] = useState<CatalogKind>("spells");
  const [edition, setEdition] = useState<EditionFilter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const normalizedQuery = query.trim().toLowerCase();

  useEffect(() => setPage(1), [edition, kind, normalizedQuery]);

  const records = useMemo(() => {
    const source = kind === "spells" ? srdSpells : srdMonsters;
    return source.filter((record) => {
      const matchesEdition = edition === "all" || record.edition === edition;
      const searchable = kind === "spells"
        ? `${record.name} ${record.school} ${record.level} ${record.classes.join(" ")}`
        : `${record.name} ${record.size} ${record.type} ${record.challenge}`;
      return matchesEdition
        && (!normalizedQuery || searchable.toLowerCase().includes(normalizedQuery));
    });
  }, [edition, kind, normalizedQuery]);

  const pageCount = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const visible = records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <section className="srd-compendium" aria-labelledby="srd-compendium-title">
      <header className="section-heading srd-compendium__heading">
        <p>complete licensed source library</p>
        <h1 id="srd-compendium-title">D&amp;D SRD Compendium</h1>
        <span>
          Search every generated spell and monster reference from the official SRD 5.1 and SRD 5.2.1 PDFs.
          Executable roll cards remain in the Player and DM libraries.
        </span>
      </header>

      <div className="srd-compendium__status">
        {srdManifest.sources.map((source) => (
          <span key={source.edition}>
            <strong>{RULESET_LABELS[source.edition]}</strong>
            {source.spellCount} spells · {source.monsterCount} monsters
          </span>
        ))}
      </div>

      <div className="srd-compendium__controls">
        <div className="workspace-view-toggle" role="group" aria-label="Compendium category">
          <button aria-pressed={kind === "spells"} onClick={() => setKind("spells")} type="button">Spells</button>
          <button aria-pressed={kind === "monsters"} onClick={() => setKind("monsters")} type="button">Monsters</button>
        </div>
        <label>
          <span>Ruleset</span>
          <select value={edition} onChange={(event) => setEdition(event.target.value as EditionFilter)}>
            <option value="all">Both editions</option>
            <option value="srd-5.1-2014">2014 · SRD 5.1</option>
            <option value="srd-5.2.1-2024">2024 · SRD 5.2.1</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Search the SRD compendium</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${kind}…`}
            type="search"
            value={query}
          />
        </label>
      </div>

      <div className="srd-compendium__result-line">
        <strong>{records.length}</strong> matching {kind}
        <span>Page {page} of {pageCount}</span>
      </div>

      {visible.length === 0 ? (
        <div className="workspace-empty">
          <span aria-hidden="true">📚</span>
          <h2>The generated catalog is not available yet.</h2>
          <p>The official-source synchronization must complete before these references appear.</p>
        </div>
      ) : (
        <div className="srd-reference-grid">
          {kind === "spells"
            ? visible.map((record) => <SrdSpellReferenceCard key={record.id} spell={record} />)
            : visible.map((record) => <SrdMonsterReferenceCard key={record.id} monster={record} />)}
        </div>
      )}

      <nav className="srd-compendium__pagination" aria-label="Compendium pages">
        <button disabled={page === 1} onClick={() => setPage((value) => value - 1)} type="button">Previous</button>
        <output>Page {page} of {pageCount}</output>
        <button disabled={page === pageCount} onClick={() => setPage((value) => value + 1)} type="button">Next</button>
      </nav>
    </section>
  );
};
