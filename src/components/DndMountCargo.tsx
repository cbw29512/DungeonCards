import { useMemo, useState } from "react";
import { dndArmorCatalog, getArmorName } from "../data/dndArmor";
import {
  dndDrawnVehicleCatalog,
  dndMountCatalog,
  dndMountSourceByRuleset,
  dndSaddleCatalog
} from "../data/dndMounts";
import type { RulesetId } from "../types/ruleCards";
import { calculateDndBarding, calculateDndMountTeam } from "../utils/dndMounts";
import "../styles/dnd-mount-cargo.css";

type DndMountCargoProps = { ruleset: RulesetId };

const formatNumber = (value: number): string => value.toLocaleString("en-US", { maximumFractionDigits: 1 });

export const DndMountCargo = ({ ruleset }: DndMountCargoProps) => {
  const [mountId, setMountId] = useState("draft-horse");
  const [animalCount, setAnimalCount] = useState(2);
  const [vehicleId, setVehicleId] = useState("wagon");
  const [cargoWeight, setCargoWeight] = useState(1000);
  const [bardingArmorId, setBardingArmorId] = useState("plate");
  const [saddleId, setSaddleId] = useState("riding");

  const mount = useMemo(() => dndMountCatalog.find((item) => item.id === mountId) ?? dndMountCatalog[0], [mountId]);
  const vehicle = useMemo(() => dndDrawnVehicleCatalog.find((item) => item.id === vehicleId) ?? dndDrawnVehicleCatalog[0], [vehicleId]);
  const bardingArmor = useMemo(() => dndArmorCatalog.find((item) => item.id === bardingArmorId) ?? dndArmorCatalog[0], [bardingArmorId]);
  const visibleSaddles = dndSaddleCatalog.filter((saddle) => saddle.rulesets.includes(ruleset));
  const saddle = visibleSaddles.find((item) => item.id === saddleId) ?? visibleSaddles[0];
  const calculation = calculateDndMountTeam({ mount, ruleset, animalCount, vehicle, cargoWeight });
  const barding = calculateDndBarding(bardingArmor);
  const source = dndMountSourceByRuleset[ruleset];

  return (
    <section className="dnd-mount-cargo" aria-labelledby="dnd-mount-cargo-title">
      <header className="dnd-mount-cargo__heading">
        <div>
          <small>Mounts and drawn vehicles</small>
          <h2 id="dnd-mount-cargo-title">Build the team before loading the wagon.</h2>
          <p>Multiple animals add their base carrying capacities together. The team can pull five times that total, including the vehicle’s own weight.</p>
        </div>
        <strong>{mount.names[ruleset]} · {formatNumber(mount.carryingCapacity[ruleset])} lb. each</strong>
      </header>

      <section className="dnd-mount-cargo__calculator" aria-label="Mount team cargo calculator">
        <div className="dnd-mount-cargo__controls">
          <label>Animal<select value={mountId} onChange={(event) => setMountId(event.target.value)}>{dndMountCatalog.map((item) => <option key={item.id} value={item.id}>{item.names[ruleset]}</option>)}</select></label>
          <label>Number of animals<input min="1" max="20" type="number" value={animalCount} onChange={(event) => setAnimalCount(Math.min(20, Math.max(1, Math.trunc(Number(event.target.value) || 1))))} /></label>
          <label>Drawn vehicle<select value={vehicleId} onChange={(event) => setVehicleId(event.target.value)}>{dndDrawnVehicleCatalog.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label>Cargo and passenger weight<input min="0" step="1" type="number" value={cargoWeight} onChange={(event) => setCargoWeight(Math.max(0, Number(event.target.value) || 0))} /></label>
        </div>

        <article className={`dnd-mount-cargo__result ${calculation.withinPulledMaximum ? "is-valid" : "is-overloaded"}`} aria-live="polite">
          <header><div><small>Team result</small><h3>{calculation.withinPulledMaximum ? "Load fits" : "Team overloaded"}</h3></div><strong>{formatNumber(calculation.totalPulledWeight)} / {formatNumber(calculation.pulledWeightMaximum)} lb.</strong></header>
          <dl>
            <div><dt>Base team carry</dt><dd>{formatNumber(calculation.teamCarryingCapacity)} lb.</dd></div>
            <div><dt>Pull maximum</dt><dd>{formatNumber(calculation.pulledWeightMaximum)} lb.</dd></div>
            <div><dt>Vehicle weight</dt><dd>{formatNumber(calculation.vehicleWeight)} lb.</dd></div>
            <div><dt>Maximum cargo</dt><dd>{formatNumber(calculation.maximumCargoWeight)} lb.</dd></div>
            <div><dt>Capacity left</dt><dd>{formatNumber(calculation.remainingCapacityAfterLoad)} lb.</dd></div>
            <div><dt>Purchase cost</dt><dd>{formatNumber(calculation.totalPurchaseCostGp)} GP</dd></div>
          </dl>
          <p>{calculation.withinPulledMaximum
            ? `The ${vehicle.name.toLowerCase()} and current load are within the team’s normal pulled-weight maximum.`
            : `Reduce the load or add animals. The vehicle’s ${formatNumber(vehicle.weightPounds)} lb. counts toward the maximum.`}</p>
          {ruleset === "srd-5.1-2014" && mount.speedFeet2014 && <p>The 2014 equipment table lists this mount at Speed {mount.speedFeet2014} feet.</p>}
        </article>
      </section>

      <section className="dnd-mount-catalog" aria-labelledby="dnd-mount-catalog-title">
        <header><small>Eight official options</small><h3 id="dnd-mount-catalog-title">Mount carrying capacities</h3></header>
        <div>{dndMountCatalog.map((item) => (
          <button aria-pressed={item.id === mountId} key={item.id} type="button" onClick={() => setMountId(item.id)}>
            <strong>{item.names[ruleset]}</strong>
            <span>{formatNumber(item.carryingCapacity[ruleset])} lb.</span>
            <small>{formatNumber(item.costGp)} GP{ruleset === "srd-5.1-2014" && item.speedFeet2014 ? ` · Speed ${item.speedFeet2014} ft.` : ""}</small>
          </button>
        ))}</div>
      </section>

      <section className="dnd-vehicle-catalog" aria-labelledby="dnd-vehicle-catalog-title">
        <header><small>Drawn vehicles</small><h3 id="dnd-vehicle-catalog-title">The vehicle counts against the load.</h3></header>
        <div>{dndDrawnVehicleCatalog.map((item) => (
          <button aria-pressed={item.id === vehicleId} key={item.id} type="button" onClick={() => setVehicleId(item.id)}>
            <strong>{item.name}</strong><span>{formatNumber(item.weightPounds)} lb.</span><small>{formatNumber(item.costGp)} GP</small>
          </button>
        ))}</div>
      </section>

      <section className="dnd-barding-calculator" aria-labelledby="dnd-barding-title">
        <header><small>Mount equipment</small><h3 id="dnd-barding-title">Barding and saddles</h3></header>
        <div className="dnd-barding-calculator__controls">
          <label>Barding armor<select value={bardingArmorId} onChange={(event) => setBardingArmorId(event.target.value)}>{dndArmorCatalog.map((armor) => <option key={armor.id} value={armor.id}>{getArmorName(armor, ruleset)}</option>)}</select></label>
          <label>Saddle<select value={saddle.id} onChange={(event) => setSaddleId(event.target.value)}>{visibleSaddles.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        </div>
        <div className="dnd-barding-summary">
          <article><small>{getArmorName(bardingArmor, ruleset)} barding</small><strong>{formatNumber(barding.costGp)} GP</strong><span>{formatNumber(barding.weightPounds)} lb.</span><p>Four times the armor’s normal cost and twice its normal weight.</p></article>
          <article><small>{saddle.name}</small><strong>{formatNumber(saddle.costGp)} GP</strong><span>{formatNumber(saddle.weightPounds)} lb.</span><p>{saddle.note}</p></article>
        </div>
      </section>

      <footer className="dnd-mount-cargo__source"><a href={source.url} target="_blank" rel="noreferrer">{source.reference}</a></footer>
    </section>
  );
};
