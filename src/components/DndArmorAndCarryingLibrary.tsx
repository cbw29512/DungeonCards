import { useMemo, useState } from "react";
import { armorCatalog, armorSourceByRuleset, armorTimingByRuleset, type ArmorRuleset } from "../data/armorCatalog";
import { calculateCarryingOutcome, resolveArmorOutcome, type CreatureSize } from "../utils/armorAndCarrying";
import "../styles/dnd-armor-carrying.css";

const armorOptions = armorCatalog.filter((item) => item.category !== "Shield");
const sizes: CreatureSize[] = ["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"];

export const DndArmorAndCarryingLibrary = () => {
  const [ruleset, setRuleset] = useState<ArmorRuleset>("dnd-2024");
  const [armorId, setArmorId] = useState("chain-mail");
  const [dexterityModifier, setDexterityModifier] = useState(2);
  const [strengthScore, setStrengthScore] = useState(13);
  const [armorTrained, setArmorTrained] = useState(true);
  const [shieldEquipped, setShieldEquipped] = useState(false);
  const [shieldTrained, setShieldTrained] = useState(true);
  const [size, setSize] = useState<CreatureSize>("Medium");
  const [carriedWeight, setCarriedWeight] = useState(75);
  const [useVariantEncumbrance, setUseVariantEncumbrance] = useState(false);
  const [pushingDraggingOrLifting, setPushingDraggingOrLifting] = useState(false);
  const [query, setQuery] = useState("");

  const selectedArmor = armorOptions.find((item) => item.id === armorId) ?? armorOptions[0];
  const armorOutcome = resolveArmorOutcome({
    ruleset,
    armor: selectedArmor,
    dexterityModifier,
    strengthScore,
    armorTrained,
    shieldEquipped,
    shieldTrained
  });
  const carryingOutcome = calculateCarryingOutcome({
    ruleset,
    strengthScore,
    size,
    carriedWeight,
    use2014VariantEncumbrance: useVariantEncumbrance,
    pushingDraggingOrLifting
  });
  const visibleArmor = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return armorCatalog;
    return armorCatalog.filter((item) => [item.name, item.category, item.baseAc, item.weight, item.costGp]
      .join(" ").toLowerCase().includes(normalized));
  }, [query]);

  const source = armorSourceByRuleset[ruleset];
  const statusLabel = carryingOutcome.loadStatus.replaceAll("-", " ");

  return (
    <section className="armor-carrying-library" aria-labelledby="armor-carrying-title">
      <header className="armor-carrying-library__header">
        <div>
          <p>Edition-separated equipment procedures</p>
          <h1 id="armor-carrying-title">Armor, Shields &amp; Carrying</h1>
          <span>Calculate Armor Class, training consequences, armor speed penalties, carrying limits, and edition-specific encumbrance without mixing 2014 and 2024.</span>
        </div>
        <div className="armor-ruleset-switch" aria-label="D&D rules edition">
          <button aria-pressed={ruleset === "dnd-2014"} type="button" onClick={() => {
            setRuleset("dnd-2014");
            setUseVariantEncumbrance(false);
          }}>2014</button>
          <button aria-pressed={ruleset === "dnd-2024"} type="button" onClick={() => {
            setRuleset("dnd-2024");
            setUseVariantEncumbrance(false);
          }}>2024</button>
        </div>
      </header>

      <div className="armor-carrying-workspaces">
        <section className="armor-builder" aria-labelledby="armor-builder-title">
          <header><small>Armor procedure</small><h2 id="armor-builder-title">Calculate Armor Class</h2></header>
          <div className="armor-control-grid">
            <label>Armor<select value={armorId} onChange={(event) => setArmorId(event.target.value)}>
              {armorOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select></label>
            <label>Dexterity modifier<input type="number" min="-10" max="20" value={dexterityModifier} onChange={(event) => setDexterityModifier(Math.trunc(Number(event.target.value) || 0))} /></label>
            <label>Strength score<input type="number" min="1" max="30" value={strengthScore} onChange={(event) => setStrengthScore(Math.min(30, Math.max(1, Math.trunc(Number(event.target.value) || 1))))} /></label>
          </div>
          <div className="armor-check-grid">
            <label><input type="checkbox" checked={armorTrained} onChange={(event) => setArmorTrained(event.target.checked)} />{ruleset === "dnd-2014" ? "Proficient with this armor" : "Trained with this armor"}</label>
            <label><input type="checkbox" checked={shieldEquipped} onChange={(event) => setShieldEquipped(event.target.checked)} />Shield equipped</label>
            <label><input type="checkbox" disabled={!shieldEquipped} checked={shieldTrained} onChange={(event) => setShieldTrained(event.target.checked)} />{ruleset === "dnd-2014" ? "Proficient with Shields" : "Shield training"}</label>
          </div>

          <article className="armor-result" aria-live="polite">
            <header><small>{selectedArmor.name}</small><strong>AC {armorOutcome.armorClass}</strong></header>
            <dl>
              <div><dt>Category</dt><dd>{selectedArmor.category}</dd></div>
              <div><dt>Don / Doff</dt><dd>{armorTimingByRuleset[ruleset][selectedArmor.category]}</dd></div>
              <div><dt>Strength</dt><dd>{selectedArmor.strengthRequired ? `Str ${selectedArmor.strengthRequired}` : "None"}</dd></div>
              <div><dt>Stealth</dt><dd>{armorOutcome.stealthDisadvantage ? "Disadvantage" : "No listed penalty"}</dd></div>
              <div><dt>Weight</dt><dd>{selectedArmor.weight} lb.</dd></div>
              <div><dt>Cost</dt><dd>{selectedArmor.costGp.toLocaleString("en-US")} GP</dd></div>
            </dl>
            {shieldEquipped && <p>Shield: {armorOutcome.shieldBonusApplied ? "+2 AC applied" : "no AC bonus without Shield training"}. {armorTimingByRuleset[ruleset].Shield}.</p>}
            {armorOutcome.speedPenalty > 0 && <p className="armor-warning">Strength below {selectedArmor.strengthRequired}: Speed decreases by {armorOutcome.speedPenalty} feet.</p>}
            {armorOutcome.trainingWarning && <p className="armor-warning">{armorOutcome.trainingWarning}</p>}
          </article>
        </section>

        <section className="carrying-builder" aria-labelledby="carrying-builder-title">
          <header><small>Lifting and carrying</small><h2 id="carrying-builder-title">Check the Load</h2></header>
          <div className="armor-control-grid">
            <label>Creature size<select value={size} onChange={(event) => setSize(event.target.value as CreatureSize)}>{sizes.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Strength score<input type="number" min="1" max="30" value={strengthScore} onChange={(event) => setStrengthScore(Math.min(30, Math.max(1, Math.trunc(Number(event.target.value) || 1))))} /></label>
            <label>Weight involved (lb.)<input type="number" min="0" step="0.5" value={carriedWeight} onChange={(event) => setCarriedWeight(Math.max(0, Number(event.target.value) || 0))} /></label>
          </div>
          <div className="armor-check-grid">
            <label><input type="checkbox" checked={pushingDraggingOrLifting} onChange={(event) => setPushingDraggingOrLifting(event.target.checked)} />Pushing, dragging, or lifting this weight</label>
            {ruleset === "dnd-2014" && <label><input type="checkbox" checked={useVariantEncumbrance} onChange={(event) => setUseVariantEncumbrance(event.target.checked)} />Use 2014 Variant: Encumbrance</label>}
          </div>

          <article className="carrying-result" aria-live="polite">
            <header><small>{size} creature · Strength {strengthScore}</small><strong>{statusLabel}</strong></header>
            <div>
              <span><small>Carry</small><strong>{carryingOutcome.carryingCapacity.toLocaleString("en-US")} lb.</strong></span>
              <span><small>Drag / Lift / Push</small><strong>{carryingOutcome.pushDragLift.toLocaleString("en-US")} lb.</strong></span>
              <span><small>Current weight</small><strong>{carriedWeight.toLocaleString("en-US")} lb.</strong></span>
            </div>
            {carryingOutcome.speedPenalty > 0 && <p className="armor-warning">Variant encumbrance: Speed decreases by {carryingOutcome.speedPenalty} feet.</p>}
            {carryingOutcome.disadvantageOnPhysicalTests && <p className="armor-warning">Heavily encumbered: Disadvantage on ability checks, attack rolls, and saving throws using Strength, Dexterity, or Constitution.</p>}
            {carryingOutcome.pushDragSpeedLimitedToFive && <p className="armor-warning">While moving this weight above carrying capacity, Speed can be no more than 5 feet.</p>}
            {carryingOutcome.loadStatus === "over-capacity" && !pushingDraggingOrLifting && <p className="armor-warning">This load exceeds carrying capacity. Switch to push/drag/lift to check whether it can still be moved.</p>}
            {ruleset === "dnd-2024" && <p className="armor-note">The 2024 free rules use carrying capacity and push/drag/lift limits; they do not include the 2014 Variant: Encumbrance thresholds.</p>}
          </article>
        </section>
      </div>

      <section className="armor-catalog" aria-labelledby="armor-catalog-title">
        <header>
          <div><small>Licensed armor table</small><h2 id="armor-catalog-title">Armor &amp; Shield Reference</h2></div>
          <label>Search<input type="search" placeholder="Armor, category, weight..." value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        </header>
        <div className="armor-table-wrap">
          <table>
            <thead><tr><th>Armor</th><th>Category</th><th>AC</th><th>Strength</th><th>Stealth</th><th>Weight</th><th>Cost</th></tr></thead>
            <tbody>{visibleArmor.map((item) => <tr key={item.id}>
              <th>{item.name}</th>
              <td>{item.category}</td>
              <td>{item.category === "Shield" ? "+2" : item.dexterity === "full" ? `${item.baseAc} + Dex` : item.dexterity === "max-2" ? `${item.baseAc} + Dex (max 2)` : item.baseAc}</td>
              <td>{item.strengthRequired ? `Str ${item.strengthRequired}` : "—"}</td>
              <td>{item.stealthDisadvantage ? "Disadvantage" : "—"}</td>
              <td>{item.weight} lb.</td>
              <td>{item.costGp.toLocaleString("en-US")} GP</td>
            </tr>)}</tbody>
          </table>
        </div>
      </section>

      <footer className="armor-source">
        <strong>{source.reference}</strong>
        <a href={source.url} target="_blank" rel="noreferrer">Open the official equipment rules</a>
      </footer>
    </section>
  );
};
