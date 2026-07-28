import { useEffect, useMemo, useState } from "react";
import { getCocOccupation } from "../data/cocOccupationCatalog";
import { cocWeaponCatalog } from "../data/cocWeaponCatalog";
import type { CocInvestigatorRecord } from "../types/cocInvestigatorCatalog";
import {
  COC_CHARACTERISTIC_NAMES,
  calculateCocDerivedAttributes,
  calculateCocThresholds
} from "../utils/cocInvestigator";
import { calculateMaximumSanity } from "../utils/cocSanityCampaign";

const formatBuild = (build: number): string => build > 0 ? `+${build}` : `${build}`;

type InvestigatorResourceState = {
  hitPoints: number;
  sanity: number;
  magicPoints: number;
  luck: number;
};

const storageKey = (investigatorId: string) => `dm-forge-coc-investigator-state-v1:${investigatorId}`;

const clamp = (value: number, maximum: number): number => Math.max(0, Math.min(maximum, Math.trunc(value) || 0));

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
      onChange={(event) => onChange(clamp(Number(event.target.value), maximum))}
      type="number"
      value={value}
    />
    <span>/ {maximum}</span>
  </label>
);

export const CocInvestigatorDossier = ({ investigator }: { investigator: CocInvestigatorRecord }) => {
  const occupation = getCocOccupation(investigator.occupationId);
  const derived = useMemo(() => calculateCocDerivedAttributes(investigator.characteristics), [investigator.characteristics]);
  const mythosSkill = investigator.skills["Cthulhu Mythos"] ?? 0;
  const maximumSanity = calculateMaximumSanity(mythosSkill);
  const defaults = useMemo<InvestigatorResourceState>(() => ({
    hitPoints: derived.hitPoints,
    sanity: clamp(investigator.characteristics.POW, maximumSanity),
    magicPoints: derived.magicPoints,
    luck: investigator.luck
  }), [derived.hitPoints, derived.magicPoints, investigator.characteristics.POW, investigator.luck, maximumSanity]);
  const [resources, setResources] = useState<InvestigatorResourceState>(() => {
    if (typeof window === "undefined") return defaults;
    try {
      const raw = window.localStorage.getItem(storageKey(investigator.id));
      if (!raw) return defaults;
      const saved = JSON.parse(raw) as Partial<InvestigatorResourceState>;
      return {
        hitPoints: clamp(saved.hitPoints ?? defaults.hitPoints, derived.hitPoints),
        sanity: clamp(saved.sanity ?? defaults.sanity, maximumSanity),
        magicPoints: clamp(saved.magicPoints ?? defaults.magicPoints, derived.magicPoints),
        luck: clamp(saved.luck ?? defaults.luck, 99)
      };
    } catch {
      return defaults;
    }
  });
  const sortedSkills = Object.entries(investigator.skills).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
  const weapons = investigator.weaponIds.map((weaponId) => cocWeaponCatalog.find((weapon) => weapon.id === weaponId)).filter(Boolean);
  const topSkill = sortedSkills[0];

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey(investigator.id), JSON.stringify(resources));
    } catch {
      // Browser storage can be unavailable in privacy-restricted sessions; live tracking still works.
    }
  }, [investigator.id, resources]);

  const updateResource = (key: keyof InvestigatorResourceState, value: number) => {
    setResources((current) => ({ ...current, [key]: value }));
  };

  const printDossier = () => {
    document.body.classList.add("print-investigator-dossier");
    window.print();
    window.setTimeout(() => document.body.classList.remove("print-investigator-dossier"), 0);
  };

  return (
    <article className="coc-investigator-dossier">
      <header className="coc-investigator-dossier__header">
        <div>
          <small>Original premade Investigator · {investigator.era}</small>
          <h2>{investigator.name}</h2>
          <p>{occupation.name} · age {investigator.age} · {investigator.pronouns}</p>
          <span>{investigator.residence} · born in {investigator.birthplace}</span>
        </div>
        <button type="button" onClick={printDossier}>Print dossier</button>
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

      <section className="coc-investigator-dossier__resources" aria-label="Saved Investigator resources">
        <ResourceInput label="Hit Points" maximum={derived.hitPoints} onChange={(value) => updateResource("hitPoints", value)} value={resources.hitPoints} />
        <ResourceInput label="Sanity" maximum={maximumSanity} onChange={(value) => updateResource("sanity", value)} value={resources.sanity} />
        <ResourceInput label="Magic Points" maximum={derived.magicPoints} onChange={(value) => updateResource("magicPoints", value)} value={resources.magicPoints} />
        <ResourceInput label="Luck" maximum={99} onChange={(value) => updateResource("luck", value)} value={resources.luck} />
        <button type="button" onClick={() => setResources(defaults)}>Reset resources</button>
        <small className="coc-investigator-dossier__save-note">Saved automatically in this browser. Maximum Sanity is 99 minus Cthulhu Mythos ({mythosSkill}).</small>
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

      <footer>Original DM Forge Investigator · Public-safe character content · Resource state is saved in this browser.</footer>
    </article>
  );
};