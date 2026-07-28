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
import {
  clearCocInvestigatorState,
  createDefaultCocInvestigatorState,
  loadCocInvestigatorState,
  normalizeCocInvestigatorState,
  saveCocInvestigatorState,
  type CocInvestigatorLiveState
} from "../utils/cocInvestigatorStateStorage";

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
      aria-label={label}
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
  const [liveState, setLiveState] = useState<CocInvestigatorLiveState>(() => createDefaultCocInvestigatorState(investigator));
  const [storageMessage, setStorageMessage] = useState("Session state is ready.");
  const sortedSkills = Object.entries(investigator.skills).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
  const weapons = investigator.weaponIds.map((weaponId) => cocWeaponCatalog.find((weapon) => weapon.id === weaponId)).filter(Boolean);
  const topSkill = sortedSkills[0];
  const maximumSanity = calculateMaximumSanity(liveState.cthulhuMythos);

  useEffect(() => {
    if (typeof window === "undefined") {
      setLiveState(createDefaultCocInvestigatorState(investigator));
      return;
    }
    const loaded = loadCocInvestigatorState(window.localStorage, investigator);
    setLiveState(loaded.state);
    setStorageMessage(loaded.error ?? "Saved locally on this browser.");
  }, [investigator]);

  const updateLiveState = (patch: Partial<CocInvestigatorLiveState>) => {
    setLiveState((current) => {
      const next = normalizeCocInvestigatorState(investigator, { ...current, ...patch });
      if (typeof window !== "undefined") {
        try {
          const saved = saveCocInvestigatorState(window.localStorage, investigator, next);
          setStorageMessage("Saved locally on this browser.");
          return saved;
        } catch {
          setStorageMessage("This browser could not save the Investigator state. Current changes remain open for this visit.");
        }
      }
      return next;
    });
  };

  const resetCurrentResources = () => {
    const defaults = createDefaultCocInvestigatorState(investigator);
    updateLiveState({
      hitPoints: defaults.hitPoints,
      sanity: Math.min(investigator.characteristics.POW, maximumSanity),
      magicPoints: defaults.magicPoints,
      luck: defaults.luck
    });
  };

  const restorePremadeState = () => {
    if (typeof window === "undefined") {
      setLiveState(createDefaultCocInvestigatorState(investigator));
      return;
    }
    const restored = clearCocInvestigatorState(window.localStorage, investigator);
    setLiveState(restored);
    setStorageMessage("Premade starting state restored and the saved copy was cleared.");
  };

  const printDossier = () => {
    if (typeof window === "undefined") return;
    const cleanup = () => document.body.classList.remove("print-coc-investigator-dossier");
    document.body.classList.add("print-coc-investigator-dossier");
    window.addEventListener("afterprint", cleanup, { once: true });
    window.print();
    window.setTimeout(cleanup, 1500);
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
        <button type="button" onClick={printDossier}>Print this dossier</button>
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
        <ResourceInput label="Current Hit Points" maximum={derived.hitPoints} onChange={(value) => updateLiveState({ hitPoints: value })} value={liveState.hitPoints} />
        <ResourceInput label="Current Sanity" maximum={maximumSanity} onChange={(value) => updateLiveState({ sanity: value })} value={liveState.sanity} />
        <ResourceInput label="Current Magic Points" maximum={derived.magicPoints} onChange={(value) => updateLiveState({ magicPoints: value })} value={liveState.magicPoints} />
        <ResourceInput label="Current Luck" maximum={99} onChange={(value) => updateLiveState({ luck: value })} value={liveState.luck} />
        <ResourceInput label="Cthulhu Mythos" maximum={99} onChange={(value) => updateLiveState({ cthulhuMythos: value })} value={liveState.cthulhuMythos} />
        <div className="coc-investigator-dossier__resource-actions">
          <button type="button" onClick={resetCurrentResources}>Reset current resources</button>
          <button type="button" onClick={restorePremadeState}>Restore premade state</button>
        </div>
        <p className="coc-investigator-dossier__save-status" aria-live="polite">
          Maximum Sanity {maximumSanity} = 99 − Cthulhu Mythos. {storageMessage}
        </p>
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

      <footer>Original DM Forge Investigator · Public-safe character content · Live resources save locally per Investigator on this browser.</footer>
    </article>
  );
};