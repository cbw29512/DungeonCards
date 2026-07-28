import { useMemo, useState } from "react";
import {
  cocWeaponCatalog,
  cocWeaponEras,
  cocWeaponKinds
} from "../data/cocWeaponCatalog";
import type { CocWeaponEra, CocWeaponKind } from "../types/coc";
import { CocFirearmProcedureCard } from "./CocFirearmProcedureCard";
import { CocHealingCard } from "./CocHealingCard";
import { CocInjuryCard } from "./CocInjuryCard";
import { CocWeaponCard } from "./CocWeaponCard";

type KindFilter = CocWeaponKind | "all";
type EraFilter = CocWeaponEra | "all";

const titleCase = (value: string) => value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export const CocEquipmentLibrary = () => {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");
  const [era, setEra] = useState<EraFilter>("all");
  const [selectedId, setSelectedId] = useState(cocWeaponCatalog[0]?.id ?? "");
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(() => cocWeaponCatalog.filter((weapon) => {
    const searchable = [
      weapon.name,
      weapon.category,
      weapon.kind,
      weapon.skillName,
      weapon.availability,
      weapon.range,
      weapon.notes,
      ...weapon.eras
    ].join(" ").toLowerCase();
    return (kind === "all" || weapon.kind === kind)
      && (era === "all" || weapon.eras.includes(era))
      && (!normalizedQuery || searchable.includes(normalizedQuery));
  }), [era, kind, normalizedQuery]);

  const selected = filtered.find((weapon) => weapon.id === selectedId) ?? filtered[0];

  return (
    <div className="coc-equipment-library">
      <section className="coc-equipment-library__summary" aria-label="Original equipment library summary">
        <div><strong>{cocWeaponCatalog.length}</strong><span>original weapon records</span></div>
        <div><strong>{cocWeaponKinds.length}</strong><span>weapon families</span></div>
        <div><strong>{cocWeaponEras.length}</strong><span>era filters</span></div>
        <p>
          These are original tabletop records for percentile-horror campaigns. They do not reproduce an
          official equipment table, protected sourcebook text, or proprietary statistics.
        </p>
      </section>

      <section className="coc-equipment-library__procedures" aria-label="Equipment procedures">
        <CocFirearmProcedureCard />
        <CocInjuryCard />
        <CocHealingCard />
      </section>

      <section className="coc-equipment-library__controls" aria-label="Equipment library filters">
        <label>
          <span>Search</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, category, skill, era…"
            type="search"
            value={query}
          />
        </label>
        <label>
          <span>Family</span>
          <select onChange={(event) => setKind(event.target.value as KindFilter)} value={kind}>
            <option value="all">All weapon families</option>
            {cocWeaponKinds.map((value) => (
              <option key={value} value={value}>{titleCase(value)}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Era</span>
          <select onChange={(event) => setEra(event.target.value as EraFilter)} value={era}>
            <option value="all">All eras</option>
            {cocWeaponEras.map((value) => (
              <option key={value} value={value}>{titleCase(value)}</option>
            ))}
          </select>
        </label>
      </section>

      <div className="coc-equipment-library__result-line">
        <strong>{filtered.length}</strong> matching weapon records
      </div>

      {selected ? (
        <div className="coc-equipment-library__workspace">
          <nav className="coc-equipment-library__index" aria-label="Weapon record index">
            {filtered.map((weapon) => (
              <button
                aria-pressed={selected.id === weapon.id}
                key={weapon.id}
                onClick={() => setSelectedId(weapon.id)}
                type="button"
              >
                <span>
                  <strong>{weapon.name}</strong>
                  <small>{weapon.category} · {weapon.skillName}</small>
                </span>
                <em>{weapon.damageFormula}{weapon.usesDamageBonus ? " + DB" : ""}</em>
                <small>{titleCase(weapon.kind)} · {weapon.eras.join(" / ")}</small>
              </button>
            ))}
          </nav>
          <div className="coc-equipment-library__record">
            <CocWeaponCard key={selected.id} weapon={selected} />
          </div>
        </div>
      ) : (
        <div className="coc-equipment-library__empty">
          <h2>No equipment matches those filters.</h2>
          <p>Clear the search or select a different weapon family and era.</p>
        </div>
      )}
    </div>
  );
};
