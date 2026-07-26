import { useMemo, useState } from "react";
import { pregenCatalog } from "../data/pregenCatalog";
import type { PregenCatalogFilters } from "../types/pregens";
import { filterPregenCharacters, isReadyToPlay } from "../utils/pregenCatalog";

const defaultFilters: PregenCatalogFilters = {
  edition: "all",
  classId: "all",
  subclassId: "all",
  level: "all",
  role: "all",
  complexity: "all",
  sourceScope: "all"
};

export function DndPregenLibrary() {
  const [filters, setFilters] = useState<PregenCatalogFilters>(defaultFilters);
  const readyCatalog = useMemo(() => pregenCatalog.filter(isReadyToPlay), []);
  const characters = useMemo(() => filterPregenCharacters(readyCatalog, filters), [filters, readyCatalog]);
  const classes = useMemo(() => [...new Map(readyCatalog.map((item) => [item.classId, item.className])).entries()], [readyCatalog]);
  const subclasses = useMemo(() => [...new Map(
    readyCatalog
      .filter((item) => filters.classId === "all" || item.classId === filters.classId)
      .map((item) => [item.subclassId, item.subclassName])
  ).entries()], [filters.classId, readyCatalog]);

  return (
    <section className="workspace pregen-library" aria-labelledby="pregen-library-title">
      <header className="workspace__header">
        <p className="hero__eyebrow">D&amp;D · ready-to-play characters</p>
        <h2 id="pregen-library-title">Premade Character Library</h2>
        <p>Choose a verified character by edition, class, subclass, level, role, and complexity. Draft or incomplete sheets never appear in this picker.</p>
      </header>

      <div className="pregen-library__status" role="status">
        <strong>{readyCatalog.length} verified pregens available</strong>
        <span>Public records use SRD or original content. Owned-book options remain private.</span>
      </div>

      <form className="pregen-filters" onSubmit={(event) => event.preventDefault()}>
        <label>Edition
          <select value={filters.edition} onChange={(event) => setFilters({ ...filters, edition: event.target.value as PregenCatalogFilters["edition"] })}>
            <option value="all">All editions</option><option value="dnd-2014">2014</option><option value="dnd-2024">2024</option>
          </select>
        </label>
        <label>Class
          <select value={filters.classId} onChange={(event) => setFilters({ ...filters, classId: event.target.value, subclassId: "all" })}>
            <option value="all">All classes</option>{classes.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </label>
        <label>Subclass
          <select value={filters.subclassId} onChange={(event) => setFilters({ ...filters, subclassId: event.target.value })}>
            <option value="all">All subclasses</option>{subclasses.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </label>
        <label>Level
          <select value={filters.level} onChange={(event) => setFilters({ ...filters, level: event.target.value === "all" ? "all" : Number(event.target.value) })}>
            <option value="all">All levels</option>{Array.from({ length: 20 }, (_, index) => index + 1).map((level) => <option key={level} value={level}>{level}</option>)}
          </select>
        </label>
        <label>Role
          <select value={filters.role} onChange={(event) => setFilters({ ...filters, role: event.target.value as PregenCatalogFilters["role"] })}>
            <option value="all">All roles</option><option value="defender">Defender</option><option value="support">Support</option><option value="striker">Striker</option><option value="controller">Controller</option><option value="scout">Scout</option><option value="face">Face</option><option value="generalist">Generalist</option>
          </select>
        </label>
        <label>Complexity
          <select value={filters.complexity} onChange={(event) => setFilters({ ...filters, complexity: event.target.value as PregenCatalogFilters["complexity"] })}>
            <option value="all">Any complexity</option><option value="beginner">Beginner</option><option value="standard">Standard</option><option value="advanced">Advanced</option>
          </select>
        </label>
        <button type="button" onClick={() => setFilters(defaultFilters)}>Reset filters</button>
      </form>

      {characters.length === 0 ? (
        <div className="pregen-library__empty">
          <h3>No verified character matches yet.</h3>
          <p>The catalog foundation is active. Characters will appear only after edition-specific rules review, playtesting, and final verification.</p>
        </div>
      ) : (
        <div className="pregen-grid">
          {characters.map((character) => (
            <article className="pregen-card" key={character.id}>
              <p>{character.edition === "dnd-2014" ? "2014" : "2024"} · Level {character.level}</p>
              <h3>{character.name}</h3>
              <strong>{character.className} · {character.subclassName}</strong>
              <dl><div><dt>AC</dt><dd>{character.armorClass}</dd></div><div><dt>HP</dt><dd>{character.maxHitPoints}</dd></div><div><dt>Speed</dt><dd>{character.speed} ft.</dd></div><div><dt>Initiative</dt><dd>{character.initiative >= 0 ? "+" : ""}{character.initiative}</dd></div></dl>
              <p>{character.tactics[0]}</p>
              <button type="button">Open character</button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
