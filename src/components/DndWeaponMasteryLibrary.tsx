import { useMemo, useState } from "react";
import { weaponCatalog2024 } from "../data/weaponCatalog2024";
import {
  WEAPON_MASTERY_SOURCE_REFERENCE,
  WEAPON_MASTERY_SOURCE_URL,
  weaponMasteryDefinitions2024,
  weaponMasteryOrder,
  type WeaponMasteryName
} from "../data/weaponMastery2024";
import {
  calculateToppleSaveDc,
  canActivateWeaponMastery,
  filterMasteryWeapons,
  findMasteryWeapon
} from "../utils/weaponMastery2024";
import "../styles/dnd-weapon-mastery.css";

export const DndWeaponMasteryLibrary = () => {
  const [selectedWeaponId, setSelectedWeaponId] = useState("greataxe");
  const [masteryUnlocked, setMasteryUnlocked] = useState(false);
  const [masteryUsedThisTurn, setMasteryUsedThisTurn] = useState(false);
  const [abilityModifier, setAbilityModifier] = useState(3);
  const [proficiencyBonus, setProficiencyBonus] = useState(2);
  const [query, setQuery] = useState("");
  const [masteryFilter, setMasteryFilter] = useState<WeaponMasteryName | "all">("all");

  const selectedWeapon = findMasteryWeapon(selectedWeaponId) ?? weaponCatalog2024[0];
  const selectedMastery = selectedWeapon.mastery!;
  const definition = weaponMasteryDefinitions2024[selectedMastery];
  const canUse = canActivateWeaponMastery(selectedWeapon, masteryUnlocked);
  const availableThisTurn = canUse && (!definition.oncePerTurn || !masteryUsedThisTurn);
  const toppleDc = calculateToppleSaveDc(abilityModifier, proficiencyBonus);
  const visibleWeapons = useMemo(
    () => filterMasteryWeapons(query, masteryFilter),
    [query, masteryFilter]
  );

  const selectWeapon = (weaponId: string) => {
    setSelectedWeaponId(weaponId);
    setMasteryUnlocked(false);
    setMasteryUsedThisTurn(false);
  };

  return (
    <section className="weapon-mastery-library" aria-labelledby="weapon-mastery-title">
      <header className="weapon-mastery-library__header">
        <div>
          <p>SRD 5.2.1 · 2024 rules only</p>
          <h1 id="weapon-mastery-title">Weapon Mastery</h1>
          <span>Select the weapon you mastered, check the trigger, and resolve the exact property without carrying the rule into 2014 play.</span>
        </div>
        <strong>39 weapons · 8 properties</strong>
      </header>

      <section className="weapon-mastery-runner" aria-label="Selected Weapon Mastery procedure">
        <div className="weapon-mastery-runner__controls">
          <label>
            Mastered weapon
            <select value={selectedWeaponId} onChange={(event) => selectWeapon(event.target.value)}>
              {weaponCatalog2024.map((weapon) => (
                <option key={weapon.id} value={weapon.id}>{weapon.name} — {weapon.mastery}</option>
              ))}
            </select>
          </label>
          <label className="weapon-mastery-check">
            <input type="checkbox" checked={masteryUnlocked} onChange={(event) => {
              setMasteryUnlocked(event.target.checked);
              setMasteryUsedThisTurn(false);
            }} />
            A class or other feature unlocks the mastery property for this weapon
          </label>
        </div>

        <article className={`weapon-mastery-procedure${canUse ? " is-unlocked" : ""}`}>
          <header>
            <div>
              <small>{selectedWeapon.name} · {selectedWeapon.damage} {selectedWeapon.damageType}</small>
              <h2>{selectedMastery}</h2>
            </div>
            <span>{availableThisTurn ? "Available" : canUse ? "Used this turn" : "Locked"}</span>
          </header>
          <dl>
            <div><dt>Trigger</dt><dd>{definition.trigger}</dd></div>
            <div><dt>Effect</dt><dd>{definition.effect}</dd></div>
          </dl>
          <ul>{definition.limits.map((limit) => <li key={limit}>{limit}</li>)}</ul>

          {selectedMastery === "Topple" && (
            <section className="weapon-mastery-topple">
              <header><small>Constitution save</small><strong>DC {toppleDc}</strong></header>
              <div>
                <label>Attack ability modifier<input min="-5" max="10" type="number" value={abilityModifier} onChange={(event) => setAbilityModifier(Math.trunc(Number(event.target.value) || 0))} /></label>
                <label>Proficiency Bonus<input min="0" max="10" type="number" value={proficiencyBonus} onChange={(event) => setProficiencyBonus(Math.max(0, Math.trunc(Number(event.target.value) || 0)))} /></label>
              </div>
              <p>8 + {abilityModifier} + {proficiencyBonus} = {toppleDc}</p>
            </section>
          )}

          {definition.oncePerTurn && (
            <div className="weapon-mastery-turn-tracker">
              <button disabled={!canUse || masteryUsedThisTurn} type="button" onClick={() => setMasteryUsedThisTurn(true)}>Mark {selectedMastery} used</button>
              <button disabled={!masteryUsedThisTurn} type="button" onClick={() => setMasteryUsedThisTurn(false)}>Start next turn</button>
            </div>
          )}

          {!canUse && <p className="weapon-mastery-warning">The weapon lists this property, but it does nothing until a feature unlocks the mastery for your character.</p>}
        </article>
      </section>

      <section className="weapon-mastery-reference" aria-labelledby="mastery-reference-title">
        <header><small>Procedure reference</small><h2 id="mastery-reference-title">All eight mastery properties</h2></header>
        <div>
          {weaponMasteryOrder.map((mastery) => {
            const item = weaponMasteryDefinitions2024[mastery];
            const weaponCount = weaponCatalog2024.filter((weapon) => weapon.mastery === mastery).length;
            return (
              <article key={mastery}>
                <header><h3>{mastery}</h3><span>{weaponCount} weapon{weaponCount === 1 ? "" : "s"}</span></header>
                <p><strong>Trigger:</strong> {item.trigger}</p>
                <p>{item.effect}</p>
                <ul>{item.limits.map((limit) => <li key={limit}>{limit}</li>)}</ul>
              </article>
            );
          })}
        </div>
      </section>

      <section className="weapon-mastery-catalog" aria-labelledby="mastery-weapons-title">
        <header>
          <div><small>SRD weapon assignments</small><h2 id="mastery-weapons-title">Find a weapon</h2></div>
          <div>
            <label>Search<input type="search" placeholder="Weapon, property, damage..." value={query} onChange={(event) => setQuery(event.target.value)} /></label>
            <label>Mastery<select value={masteryFilter} onChange={(event) => setMasteryFilter(event.target.value as WeaponMasteryName | "all")}>
              <option value="all">All properties</option>
              {weaponMasteryOrder.map((mastery) => <option key={mastery} value={mastery}>{mastery}</option>)}
            </select></label>
          </div>
        </header>
        <p>{visibleWeapons.length} matching weapon{visibleWeapons.length === 1 ? "" : "s"}</p>
        <div className="weapon-mastery-weapon-grid">
          {visibleWeapons.map((weapon) => (
            <button key={weapon.id} type="button" onClick={() => selectWeapon(weapon.id)}>
              <span aria-hidden="true">{weapon.icon ?? "⚔️"}</span>
              <strong>{weapon.name}</strong>
              <small>{weapon.damage} {weapon.damageType}</small>
              <em>{weapon.mastery}</em>
            </button>
          ))}
        </div>
      </section>

      <footer className="weapon-mastery-source">
        <strong>{WEAPON_MASTERY_SOURCE_REFERENCE}</strong>
        <a href={WEAPON_MASTERY_SOURCE_URL} target="_blank" rel="noreferrer">Open the official mastery rules</a>
      </footer>
    </section>
  );
};
