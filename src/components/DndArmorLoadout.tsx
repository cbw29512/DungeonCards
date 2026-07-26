import { useMemo, useState } from "react";
import {
  dndArmorCatalog,
  dndArmorEditionRules,
  getArmorName
} from "../data/dndArmor";
import type { DndCreatureSize, DndVariantEncumbranceStatus } from "../types/dndArmor";
import { RULESET_LABELS, type RulesetId } from "../types/ruleCards";
import {
  calculate2014VariantEncumbrance,
  calculateDndArmor,
  calculateDndCapacity,
  calculateLoadoutWeight
} from "../utils/dndArmor";
import { DndContainersPacks } from "./DndContainersPacks";
import { DndLargeVehicles } from "./DndLargeVehicles";
import { DndMountCargo } from "./DndMountCargo";
import "../styles/dnd-armor-loadout.css";

const sizeLabels: Record<DndCreatureSize, string> = {
  tiny: "Tiny",
  small: "Small",
  medium: "Medium",
  large: "Large",
  huge: "Huge",
  gargantuan: "Gargantuan"
};

const variantStatusText: Record<DndVariantEncumbranceStatus, string> = {
  normal: "Not encumbered",
  encumbered: "Encumbered: Speed −10 feet",
  "heavily-encumbered": "Heavily encumbered: Speed −20 feet and Disadvantage on Strength-, Dexterity-, and Constitution-based ability checks, attack rolls, and saving throws",
  "over-capacity": "Over carrying capacity: this load can’t be carried normally"
};

const formatWeight = (weight: number): string => Number.isInteger(weight) ? `${weight}` : weight.toFixed(1);

export const DndArmorLoadout = () => {
  const [ruleset, setRuleset] = useState<RulesetId>("srd-5.2.1-2024");
  const [armorId, setArmorId] = useState<string>("chain-mail");
  const [dexterityModifier, setDexterityModifier] = useState(2);
  const [strengthScore, setStrengthScore] = useState(12);
  const [size, setSize] = useState<DndCreatureSize>("medium");
  const [armorTrained, setArmorTrained] = useState(true);
  const [shieldEquipped, setShieldEquipped] = useState(false);
  const [shieldTrained, setShieldTrained] = useState(false);
  const [otherWeight, setOtherWeight] = useState(20);
  const [variantEncumbrance, setVariantEncumbrance] = useState(false);

  const editionRules = dndArmorEditionRules[ruleset];
  const selectedArmor = useMemo(
    () => dndArmorCatalog.find((armor) => armor.id === armorId),
    [armorId]
  );
  const totalWeight = calculateLoadoutWeight(selectedArmor, shieldEquipped, otherWeight);
  const useVariant = ruleset === "srd-5.1-2014" && variantEncumbrance;
  const armorResult = calculateDndArmor({
    ruleset,
    armor: selectedArmor,
    dexterityModifier,
    strengthScore,
    armorTrained,
    shieldEquipped,
    shieldTrained,
    ignoreArmorStrengthRequirement: useVariant
  });
  const capacity = calculateDndCapacity(strengthScore, size, totalWeight);
  const variantStatus = useVariant
    ? calculate2014VariantEncumbrance(strengthScore, size, totalWeight)
    : undefined;
  const shieldTrainingWarning = ruleset === "srd-5.2.1-2024" && shieldEquipped && !shieldTrained;

  const changeRuleset = (nextRuleset: RulesetId) => {
    setRuleset(nextRuleset);
    if (nextRuleset === "srd-5.2.1-2024") setVariantEncumbrance(false);
  };

  return (
    <section className="dnd-armor-loadout" aria-labelledby="dnd-armor-loadout-title">
      <header className="dnd-armor-loadout__heading">
        <p>Equipment and loadout</p>
        <h1 id="dnd-armor-loadout-title">Calculate the loadout in the edition actually being played.</h1>
        <span>Armor, carrying, mounts, storage, packs, and large vehicles follow one edition selector so 2014 and 2024 procedures never blend silently.</span>
      </header>

      <div className="dnd-armor-loadout__ruleset">
        <fieldset>
          <legend>Ruleset</legend>
          {(Object.keys(RULESET_LABELS) as RulesetId[]).map((option) => (
            <button aria-pressed={ruleset === option} key={option} type="button" onClick={() => changeRuleset(option)}>{RULESET_LABELS[option]}</button>
          ))}
        </fieldset>
        <strong>{RULESET_LABELS[ruleset]} only</strong>
      </div>

      <section className="dnd-loadout-calculator" aria-label="Armor Class and carrying calculator">
        <div className="dnd-loadout-controls">
          <label>
            Armor
            <select value={armorId} onChange={(event) => setArmorId(event.target.value)}>
              <option value="">No armor</option>
              {dndArmorCatalog.map((armor) => <option key={armor.id} value={armor.id}>{getArmorName(armor, ruleset)}</option>)}
            </select>
          </label>
          <div className="dnd-loadout-control-grid">
            <label>Dexterity modifier<input min="-5" max="10" type="number" value={dexterityModifier} onChange={(event) => setDexterityModifier(Math.trunc(Number(event.target.value) || 0))} /></label>
            <label>Strength score<input min="0" max="30" type="number" value={strengthScore} onChange={(event) => setStrengthScore(Math.max(0, Math.trunc(Number(event.target.value) || 0)))} /></label>
            <label>Creature size<select value={size} onChange={(event) => setSize(event.target.value as DndCreatureSize)}>{(Object.keys(sizeLabels) as DndCreatureSize[]).map((option) => <option key={option} value={option}>{sizeLabels[option]}</option>)}</select></label>
            <label>Other carried weight<input min="0" step="0.5" type="number" value={otherWeight} onChange={(event) => setOtherWeight(Math.max(0, Number(event.target.value) || 0))} /></label>
          </div>

          <div className="dnd-loadout-checks">
            {selectedArmor && <label><input type="checkbox" checked={armorTrained} onChange={(event) => setArmorTrained(event.target.checked)} />{ruleset === "srd-5.1-2014" ? "Proficient with this armor" : "Trained with this armor"}</label>}
            <label><input type="checkbox" checked={shieldEquipped} onChange={(event) => setShieldEquipped(event.target.checked)} />Shield equipped</label>
            {shieldEquipped && <label><input type="checkbox" checked={shieldTrained} onChange={(event) => setShieldTrained(event.target.checked)} />{ruleset === "srd-5.1-2014" ? "Proficient with shields" : "Shield training"}</label>}
            {editionRules.supportsVariantEncumbrance && <label><input type="checkbox" checked={variantEncumbrance} onChange={(event) => setVariantEncumbrance(event.target.checked)} />Use the optional 2014 encumbrance variant</label>}
          </div>
        </div>

        <article className="dnd-loadout-result" aria-live="polite">
          <header>
            <div><small>Current loadout</small><h2>Armor Class {armorResult.armorClass}</h2></div>
            <strong>{formatWeight(totalWeight)} lb.</strong>
          </header>

          <dl>
            <div><dt>Base</dt><dd>{selectedArmor ? selectedArmor.baseArmorClass : 10}</dd></div>
            <div><dt>Dexterity</dt><dd>{armorResult.armorDexterityContribution >= 0 ? "+" : ""}{armorResult.armorDexterityContribution}</dd></div>
            <div><dt>Shield</dt><dd>+{armorResult.shieldBonus}</dd></div>
            <div><dt>Carry</dt><dd>{formatWeight(capacity.carryingCapacity)} lb.</dd></div>
            <div><dt>Push/Drag/Lift</dt><dd>{formatWeight(capacity.pushDragLiftMaximum)} lb.</dd></div>
          </dl>

          <div className="dnd-loadout-effects">
            {armorResult.speedPenaltyFeet > 0 && <p className="is-warning">Armor Strength requirement not met: Speed −{armorResult.speedPenaltyFeet} feet.</p>}
            {armorResult.stealthDisadvantage && <p className="is-warning">This armor imposes Disadvantage on Dexterity (Stealth) checks.</p>}
            {armorResult.trainingIssue && armorResult.trainingSummary && <p className="is-danger">Training requirement not met: {armorResult.trainingSummary}</p>}
            {shieldTrainingWarning && <p className="is-danger">Shield training is missing, so the 2024 shield grants no AC bonus.</p>}
            {capacity.loadStatus === "within-capacity" && <p className="is-good">The load is within normal carrying capacity.</p>}
            {capacity.loadStatus === "over-carrying-capacity" && <p className="is-danger">The load exceeds carrying capacity. It can be pushed, dragged, or lifted, but Speed can be no more than {capacity.speedMaximumFeet} feet while moving the excess.</p>}
            {capacity.loadStatus === "over-push-drag-lift" && <p className="is-danger">The load exceeds the normal push, drag, or lift maximum.</p>}
            {variantStatus && <p className={variantStatus === "normal" ? "is-good" : "is-warning"}>{variantStatusText[variantStatus]}</p>}
            {useVariant && <p>The 2014 variant tells you to ignore the Armor table’s Strength column, so that armor Speed penalty is not added.</p>}
          </div>
        </article>
      </section>

      <section className="dnd-armor-procedures" aria-labelledby="dnd-armor-procedures-title">
        <header><small>Edition procedure</small><h2 id="dnd-armor-procedures-title">Training and don/doff timing</h2></header>
        <div>
          <article><h3>Armor training</h3><p>{editionRules.armorTrainingSummary}</p></article>
          <article><h3>Shield training</h3><p>{editionRules.shieldTrainingSummary}</p></article>
          <article><h3>Don and doff</h3><ul>
            <li>Light: {editionRules.categoryTiming.light.don} to don; {editionRules.categoryTiming.light.doff} to doff.</li>
            <li>Medium: {editionRules.categoryTiming.medium.don} to don; {editionRules.categoryTiming.medium.doff} to doff.</li>
            <li>Heavy: {editionRules.categoryTiming.heavy.don} to don; {editionRules.categoryTiming.heavy.doff} to doff.</li>
            <li>Shield: {editionRules.shieldTiming.don} to don; {editionRules.shieldTiming.doff} to doff.</li>
          </ul>{editionRules.doffHelpSummary && <p>{editionRules.doffHelpSummary}</p>}</article>
        </div>
      </section>

      <section className="dnd-armor-catalog" aria-labelledby="dnd-armor-catalog-title">
        <header><div><small>Complete SRD armor table</small><h2 id="dnd-armor-catalog-title">Choose armor by protection and consequence</h2></div><strong>12 armor types + shield</strong></header>
        <div className="dnd-armor-grid">
          {dndArmorCatalog.map((armor) => (
            <button aria-pressed={armorId === armor.id} key={armor.id} type="button" onClick={() => setArmorId(armor.id)}>
              <span>{armor.category}</span>
              <strong>{getArmorName(armor, ruleset)}</strong>
              <small>AC {armor.baseArmorClass}{armor.dexterityMode === "full" ? " + Dex" : armor.dexterityMode === "max-2" ? " + Dex (max 2)" : ""}</small>
              <em>{armor.weightPounds} lb. · {armor.costGp.toLocaleString("en-US")} GP</em>
              <i>{armor.strengthRequirement ? `Str ${armor.strengthRequirement}` : "No Strength requirement"}{armor.stealthDisadvantage ? " · Stealth Disadvantage" : ""}</i>
            </button>
          ))}
        </div>
      </section>

      <DndMountCargo ruleset={ruleset} />
      <DndContainersPacks ruleset={ruleset} />
      <DndLargeVehicles ruleset={ruleset} />

      <footer className="dnd-armor-sources">
        <a href={editionRules.armorSourceUrl} target="_blank" rel="noreferrer">{editionRules.armorSourceReference}</a>
        <a href={editionRules.carryingSourceUrl} target="_blank" rel="noreferrer">{editionRules.carryingSourceReference}</a>
      </footer>
    </section>
  );
};
