import { useMemo, useState } from "react";
import { cocInvestigatorCatalog } from "../data/cocInvestigatorCatalog";
import {
  cocOccupationCatalog,
  cocOccupationCategories,
  getCocOccupation
} from "../data/cocOccupationCatalog";
import type {
  CocInvestigatorEra,
  CocOccupationCategory
} from "../types/cocInvestigatorCatalog";
import { CocInvestigatorDossier } from "./CocInvestigatorDossier";

type EraFilter = CocInvestigatorEra | "all";
type CategoryFilter = CocOccupationCategory | "all";

const titleCase = (value: string) => value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export const CocInvestigatorLibrary = () => {
  const [query, setQuery] = useState("");
  const [era, setEra] = useState<EraFilter>("all");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [selectedId, setSelectedId] = useState(cocInvestigatorCatalog[0]?.id ?? "");
  const normalizedQuery = query.trim().toLowerCase();

  const matchingOccupations = useMemo(() => cocOccupationCatalog.filter((occupation) => {
    const searchable = [
      occupation.name,
      occupation.category,
      occupation.summary,
      occupation.complication,
      ...occupation.eras,
      ...occupation.suggestedSkills,
      ...occupation.contacts,
      ...occupation.typicalGear
    ].join(" ").toLowerCase();
    return (era === "all" || occupation.eras.includes(era))
      && (category === "all" || occupation.category === category)
      && (!normalizedQuery || searchable.includes(normalizedQuery));
  }), [category, era, normalizedQuery]);

  const matchingInvestigators = useMemo(() => cocInvestigatorCatalog.filter((investigator) => {
    const occupation = getCocOccupation(investigator.occupationId);
    const searchable = [
      investigator.name,
      investigator.era,
      investigator.residence,
      investigator.birthplace,
      investigator.biography,
      investigator.ideology,
      occupation.name,
      occupation.category,
      ...Object.keys(investigator.skills),
      ...investigator.traits,
      ...investigator.notes
    ].join(" ").toLowerCase();
    return (era === "all" || investigator.era === era)
      && (category === "all" || occupation.category === category)
      && (!normalizedQuery || searchable.includes(normalizedQuery));
  }), [category, era, normalizedQuery]);

  const selected = matchingInvestigators.find((investigator) => investigator.id === selectedId)
    ?? matchingInvestigators[0];

  return (
    <div className="coc-investigator-library">
      <section className="coc-investigator-library__summary" aria-label="Original Investigator library summary">
        <div><strong>{cocOccupationCatalog.length}</strong><span>original occupations</span></div>
        <div><strong>{cocInvestigatorCatalog.length}</strong><span>premade Investigators</span></div>
        <div><strong>2</strong><span>supported eras</span></div>
        <p>
          Use a complete premade sheet immediately or borrow an occupation package for the existing builder.
          Every public record is original and avoids copied official occupation or character catalogs.
        </p>
      </section>

      <section className="coc-investigator-library__controls" aria-label="Investigator library filters">
        <label>
          <span>Search</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, occupation, skill, location, trait…"
            type="search"
            value={query}
          />
        </label>
        <label>
          <span>Era</span>
          <select onChange={(event) => setEra(event.target.value as EraFilter)} value={era}>
            <option value="all">Both eras</option>
            <option value="1920s">1920s</option>
            <option value="modern">Modern</option>
          </select>
        </label>
        <label>
          <span>Occupation category</span>
          <select onChange={(event) => setCategory(event.target.value as CategoryFilter)} value={category}>
            <option value="all">All categories</option>
            {cocOccupationCategories.map((value) => <option key={value} value={value}>{titleCase(value)}</option>)}
          </select>
        </label>
      </section>

      <div className="coc-investigator-library__result-line">
        <strong>{matchingInvestigators.length}</strong> premade Investigators · <strong>{matchingOccupations.length}</strong> occupation packages
      </div>

      {selected ? (
        <div className="coc-investigator-library__workspace">
          <nav className="coc-investigator-library__index" aria-label="Premade Investigator index">
            {matchingInvestigators.map((investigator) => {
              const occupation = getCocOccupation(investigator.occupationId);
              return (
                <button
                  aria-pressed={selected.id === investigator.id}
                  key={investigator.id}
                  onClick={() => setSelectedId(investigator.id)}
                  type="button"
                >
                  <span><strong>{investigator.name}</strong><small>{occupation.name}</small></span>
                  <em>{investigator.era}</em>
                  <small>{investigator.residence} · Luck {investigator.luck}</small>
                </button>
              );
            })}
          </nav>
          <div className="coc-investigator-library__dossier">
            <CocInvestigatorDossier investigator={selected} key={selected.id} />
          </div>
        </div>
      ) : (
        <div className="coc-investigator-library__empty">
          <h2>No premade Investigators match those filters.</h2>
          <p>Clear the search or choose a different era and occupation category.</p>
        </div>
      )}

      <section className="coc-investigator-library__occupations" aria-labelledby="original-occupation-directory">
        <header>
          <small>Original public-safe packages</small>
          <h2 id="original-occupation-directory">Occupation directory</h2>
          <p>Each package supplies eight suggested skills, a Credit Rating range, contacts, gear, and a story complication.</p>
        </header>
        <div>
          {matchingOccupations.map((occupation) => (
            <article key={occupation.id}>
              <header><small>{titleCase(occupation.category)} · {occupation.eras.join(" / ")}</small><h3>{occupation.name}</h3></header>
              <p>{occupation.summary}</p>
              <dl>
                <div><dt>Skills</dt><dd>{occupation.suggestedSkills.join(" · ")}</dd></div>
                <div><dt>Credit Rating</dt><dd>{occupation.creditRatingRange[0]}–{occupation.creditRatingRange[1]}</dd></div>
                <div><dt>Contacts</dt><dd>{occupation.contacts.join(" · ")}</dd></div>
                <div><dt>Gear</dt><dd>{occupation.typicalGear.join(" · ")}</dd></div>
                <div><dt>Complication</dt><dd>{occupation.complication}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
