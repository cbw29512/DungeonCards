import { useMemo, useState } from "react";
import { getCocOccupation } from "../data/cocOccupationCatalog";
import { cocWeaponCatalog } from "../data/cocWeaponCatalog";
import type { CocInvestigatorRecord } from "../types/cocInvestigatorCatalog";
import {
  COC_CHARACTERISTIC_NAMES,
  calculateCocDerivedAttributes,
  calculateCocThresholds
} from "../utils/cocInvestigator";

const formatBuild = (build: number): string => build > 0 ? `+${build}` : `${build}`;

const ResourceInput = ({
  label,
  value,
  maximum,
  onChange
}: {
  label: string;
  value: number;
  maximum: number;
  onChange(value: number): void;
}) => (
  <label>
    <small>{label}</small>
    <input
      aria-label={`Current ${label}`}
      max={maximum}
      min="0"
      onChange={(event) => onChange(Math.max(0, Math.min(maximum, Math.trunc(Number(event.target.value) || 0))))}
      type="number"
      value={value}
    />
    <span>/ {maximum}</span>
  </label>
);

export const CocInvestigatorDossier = ({ investigator }: { investigator: CocInvestigatorRecord }) => {
  const occupation = getCocOccupation(investigator.occupationId);
  const derived = useMemo(() => calculateCocDerivedAttributes(investigator.characteristics), [investigator.characteristics]);
  const [hitPoints, setHitPoints] = useState(derived.hitPoints);
  const [sanity, setSanity] = useState(investigator.characteristics.POW);
  const [magicPoints, setMagicPoints] = useState(derived.magicPoints);
  const [luck, setLuck] = useState(investigator.luck);
  const sortedSkills = Object.entries(investigator.skills).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
  const weapons = investigator.weaponIds.map((weaponId) => cocWeaponCatalog.find((weapon) => weapon.id === weaponId)).filter(Boolean);
  const topSkill = sortedSkills[0];

  return (
    <article className="coc-investigator-dossier">
      <header className="coc-investigator-dossier__header">
        <div>
          <small>Original premade Investigator · {investigator.era}</small>
          <h2>{investigator.name}</h2>
          <p>{occupation.name} · age {investigator.age} · {investigator.pronouns}</p>
          <span>{investigator.residence} · born in {investigator.birthplace}</span>
        </div>
        <button type="button" onClick={() => window.print()}>Print dossier</button>
      </header>

      <blockquote>{investigator.biography}</blockquote>

      <section className="coc-investigator-dossier__characteristics" aria-label="Investigator characteristics">
        {COC_CHARACTERISTIC_NAMES.map((name) => {
          const value = investigator.characteristics[name];
          const thresholds = calculateCocThresholds(value);
          return (
            <div key={name}>
              <small>{name}</small>
              <strong>{value}</strong>
              <span>{thresholds.hard} / {thresholds.extreme}</span>
            </div>
          );
        })}
      </section>

      <section className="coc-investigator-dossier__derived">
        <span><small>Move</small><strong>{derived.move}</strong></span>
        <span><small>Damage Bonus</small><strong>{derived.damageBonus}</strong></span>
        <span><small>Build</small><strong>{formatBuild(derived.build)}</strong></span>
        <span><small>Top Skill</small><strong>{topSkill ? `${topSkill[0]} ${topSkill[1]}%` : "—"}</strong></span>
      </section>

      <section className="coc-investigator-dossier__resources" aria-label="Live Investigator resources">
        <ResourceInput label="Hit Points" maximum={derived.hitPoints} onChange={setHitPoints} value={hitPoints} />
        <ResourceInput label="Sanity" maximum={investigator.characteristics.POW} onChange={setSanity} value={sanity} />
        <ResourceInput label="Magic Points" maximum={derived.magicPoints} onChange={setMagicPoints} value={magicPoints} />
        <ResourceInput label="Luck" maximum={99} onChange={setLuck} value={luck} />
        <button type="button" onClick={() => {
          setHitPoints(derived.hitPoints);
          setSanity(investigator.characteristics.POW);
          setMagicPoints(derived.magicPoints);
          setLuck(investigator.luck);
        }}>Reset resources</button>
      </section>

      <div className="coc-investigator-dossier__columns">
        <section>
          <h3>Skills</h3>
          <div className="coc-investigator-dossier__skills">
            {sortedSkills.map(([skill, value]) => {
              const thresholds = calculateCocThresholds(value);
              return <span key={skill}><strong>{skill}</strong><em>{value}%</em><small>{thresholds.hard}/{thresholds.extreme}</small></span>;
            })}
          </div>
        </section>

        <section>
          <h3>Field loadout</h3>
          {weapons.length > 0 ? (
            <ul>{weapons.map((weapon) => weapon && <li key={weapon.id}>{weapon.name} · {weapon.damageFormula}{weapon.usesDamageBonus ? " + DB" : ""}</li>)}</ul>
          ) : <p>No weapon is listed. Use the Equipment library to add one if the scenario calls for it.</p>}
          <p>The full {occupation.name} package appears once in the occupation directory below.</p>
        </section>
      </div>

      <div className="coc-investigator-dossier__story">
        <section><h3>Ideology</h3><p>{investigator.ideology}</p></section>
        <section><h3>Significant people</h3><ul>{investigator.significantPeople.map((entry) => <li key={entry}>{entry}</li>)}</ul></section>
        <section><h3>Meaningful locations</h3><ul>{investigator.meaningfulLocations.map((entry) => <li key={entry}>{entry}</li>)}</ul></section>
        <section><h3>Treasured possessions</h3><ul>{investigator.treasuredPossessions.map((entry) => <li key={entry}>{entry}</li>)}</ul></section>
        <section><h3>Traits</h3><p>{investigator.traits.join(" · ")}</p></section>
        <section><h3>Play notes</h3><ul>{investigator.notes.map((entry) => <li key={entry}>{entry}</li>)}</ul></section>
      </div>

      <footer>Original DM Forge Investigator · Public-safe character content · Complete private campaign state remains browser-local.</footer>
    </article>
  );
};
