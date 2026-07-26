import { useMemo, useState } from "react";
import {
  dndLargeVehicleCatalog,
  dndLargeVehicleSourceByRuleset
} from "../data/dndLargeVehicles";
import type { RulesetId } from "../types/ruleCards";
import {
  calculateDndPassengerFare,
  calculateDndShipRepair,
  calculateDndVehicleManifest
} from "../utils/dndLargeVehicles";
import "../styles/dnd-large-vehicles.css";

type DndLargeVehiclesProps = { ruleset: RulesetId };

const formatNumber = (value: number): string => value.toLocaleString("en-US", { maximumFractionDigits: 1 });

export const DndLargeVehicles = ({ ruleset }: DndLargeVehiclesProps) => {
  const [vehicleId, setVehicleId] = useState("sailing-ship");
  const [crewProvided, setCrewProvided] = useState(20);
  const [passengersProvided, setPassengersProvided] = useState(10);
  const [cargoTons, setCargoTons] = useState(20);
  const [hammockPassengers, setHammockPassengers] = useState(10);
  const [privatePassengers, setPrivatePassengers] = useState(0);
  const [tripDays, setTripDays] = useState(3);
  const [repairHitPoints, setRepairHitPoints] = useState(10);
  const [abundantSupplies, setAbundantSupplies] = useState(false);

  const visibleVehicles = dndLargeVehicleCatalog.filter((item) => item.rulesets.includes(ruleset));
  const selectedVehicle = useMemo(
    () => visibleVehicles.find((item) => item.id === vehicleId) ?? visibleVehicles[0],
    [vehicleId, visibleVehicles]
  );
  const manifest = calculateDndVehicleManifest(selectedVehicle, ruleset, crewProvided, passengersProvided, cargoTons);
  const fare = calculateDndPassengerFare(selectedVehicle, ruleset, hammockPassengers, privatePassengers, tripDays);
  const repair = calculateDndShipRepair(ruleset, repairHitPoints, abundantSupplies);
  const source = dndLargeVehicleSourceByRuleset[ruleset];
  const stats = ruleset === "srd-5.2.1-2024" ? selectedVehicle.stats2024 : undefined;

  return (
    <section className="dnd-large-vehicles" aria-labelledby="dnd-large-vehicles-title">
      <header className="dnd-large-vehicles__heading">
        <div>
          <small>Airborne and waterborne vehicles</small>
          <h2 id="dnd-large-vehicles-title">Choose the vessel before planning the voyage.</h2>
          <p>2014 publishes cost, speed, proficiency, and river operation. The richer crew, passenger, cargo, durability, fare, and repair procedures remain 2024-only.</p>
        </div>
        <strong>{visibleVehicles.length} vehicle{visibleVehicles.length === 1 ? "" : "s"} in this edition</strong>
      </header>

      <section className="dnd-large-vehicle-selector" aria-label="Large vehicle selection">
        <label>Vehicle<select value={selectedVehicle.id} onChange={(event) => setVehicleId(event.target.value)}>{visibleVehicles.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <article>
          <small>Published purchase data</small>
          <h3>{selectedVehicle.name}</h3>
          <p><strong>{formatNumber(selectedVehicle.speedMph)} mph</strong> · {formatNumber(selectedVehicle.costGp)} GP</p>
          {selectedVehicle.carriedWeightPounds && <p>Can be carried over land; published weight {formatNumber(selectedVehicle.carriedWeightPounds)} lb.</p>}
        </article>
      </section>

      {ruleset === "srd-5.1-2014" ? (
        <section className="dnd-large-vehicle-boundary">
          <header><small>2014 procedure boundary</small><h3>Do not backfill 2024 ship statistics.</h3></header>
          <p>Vehicle proficiency adds your Proficiency Bonus to checks made to control the relevant vehicle in difficult circumstances.</p>
          <p>Keelboats and rowboats can travel downstream with the current added to their Speed, cannot be rowed against a significant current, and can be pulled upstream by draft animals on shore.</p>
          <p>The 2014 equipment rules do not publish the 2024 table’s crew, passengers, cargo, AC, HP, damage threshold, fare, or repair values here.</p>
        </section>
      ) : stats ? (
        <>
          <section className="dnd-large-vehicle-stats" aria-label="2024 large vehicle statistics">
            <div><small>Speed</small><strong>{formatNumber(selectedVehicle.speedMph)} mph</strong></div>
            <div><small>Crew</small><strong>{formatNumber(stats.crew)}</strong></div>
            <div><small>Passengers</small><strong>{stats.passengers === undefined ? "Not published" : formatNumber(stats.passengers)}</strong></div>
            <div><small>Cargo</small><strong>{stats.cargoTons === undefined ? "Not published" : `${formatNumber(stats.cargoTons)} tons`}</strong></div>
            <div><small>AC</small><strong>{stats.armorClass}</strong></div>
            <div><small>HP</small><strong>{stats.hitPoints}</strong></div>
            <div><small>Threshold</small><strong>{stats.damageThreshold ?? "—"}</strong></div>
          </section>

          <section className="dnd-vehicle-manifest" aria-labelledby="dnd-vehicle-manifest-title">
            <header><small>2024 operations</small><h3 id="dnd-vehicle-manifest-title">Crew, passengers, and cargo</h3></header>
            <div className="dnd-vehicle-inputs">
              <label>Crew provided<input min="0" type="number" value={crewProvided} onChange={(event) => setCrewProvided(Math.max(0, Math.trunc(Number(event.target.value) || 0)))} /></label>
              <label>Passengers<input min="0" type="number" value={passengersProvided} onChange={(event) => setPassengersProvided(Math.max(0, Math.trunc(Number(event.target.value) || 0)))} /></label>
              <label>Cargo tons<input min="0" step="0.5" type="number" value={cargoTons} onChange={(event) => setCargoTons(Math.max(0, Number(event.target.value) || 0))} /></label>
            </div>
            <div className="dnd-vehicle-status-grid" aria-live="polite">
              <p className={manifest.crewRequirementMet ? "is-good" : "is-danger"}>{manifest.crewRequirementMet ? "Minimum skilled crew is present." : `Need at least ${stats.crew} skilled crew.`}</p>
              <p className={manifest.passengerCapacityMet === false ? "is-danger" : manifest.passengerCapacityMet ? "is-good" : "is-neutral"}>{manifest.passengerCapacityMet === undefined ? "Passenger capacity is not published for this vehicle." : manifest.passengerCapacityMet ? "Passenger count fits." : `Passenger count exceeds ${stats.passengers}.`}</p>
              <p className={manifest.cargoCapacityMet === false ? "is-danger" : manifest.cargoCapacityMet ? "is-good" : "is-neutral"}>{manifest.cargoCapacityMet === undefined ? "Cargo capacity is not published for this vehicle." : manifest.cargoCapacityMet ? "Cargo fits." : `Cargo exceeds ${stats.cargoTons} tons.`}</p>
            </div>
          </section>

          <section className="dnd-vehicle-fares" aria-labelledby="dnd-vehicle-fares-title">
            <header><small>2024 passenger costs</small><h3 id="dnd-vehicle-fares-title">Hammocks and private cabins</h3></header>
            <div className="dnd-vehicle-inputs">
              <label>Hammock passengers<input min="0" type="number" value={hammockPassengers} onChange={(event) => setHammockPassengers(Math.max(0, Math.trunc(Number(event.target.value) || 0)))} /></label>
              <label>Private passengers<input min="0" type="number" value={privatePassengers} onChange={(event) => setPrivatePassengers(Math.max(0, Math.trunc(Number(event.target.value) || 0)))} /></label>
              <label>Travel days<input min="0" step="0.5" type="number" value={tripDays} onChange={(event) => setTripDays(Math.max(0, Number(event.target.value) || 0))} /></label>
            </div>
            <article className="dnd-vehicle-result">
              <div><small>Typical total fare</small><strong>{formatNumber(fare.totalFareGp ?? 0)} GP</strong></div>
              <p>Hammocks are typically 5 SP per passenger per day. A small private cabin is typically 2 GP per passenger per day.</p>
              <p>{fare.maximumPrivatePassengers === undefined ? "A passenger capacity is not published, so DM Forge cannot validate private accommodations." : `Private accommodations reduce capacity to one-fifth: at most ${fare.maximumPrivatePassengers} whole passengers for this vessel.`}</p>
              {fare.capacityMet === false && <p className="is-danger">This cabin/hammock plan exceeds the published passenger capacity.</p>}
            </article>
          </section>

          <section className="dnd-vehicle-repairs" aria-labelledby="dnd-vehicle-repairs-title">
            <header><small>2024 berthed repairs</small><h3 id="dnd-vehicle-repairs-title">Repair damaged ships</h3></header>
            <div className="dnd-vehicle-inputs dnd-vehicle-inputs--two">
              <label>HP to repair<input min="0" type="number" value={repairHitPoints} onChange={(event) => setRepairHitPoints(Math.max(0, Math.trunc(Number(event.target.value) || 0)))} /></label>
              <label className="dnd-vehicle-check"><input type="checkbox" checked={abundantSupplies} onChange={(event) => setAbundantSupplies(event.target.checked)} />Abundant supplies and skilled labor</label>
            </div>
            <article className="dnd-vehicle-result"><div><small>Repair plan</small><strong>{formatNumber(repair.days ?? 0)} days · {formatNumber(repair.costGp ?? 0)} GP</strong></div><p>Normal repair is 1 HP per day and 20 GP per HP. An abundant city shipyard halves both time and cost.</p></article>
          </section>

          <section className="dnd-large-vehicle-notes">
            <p>A ship sailing against a strong wind moves at half Speed. In dead calm, sail-driven waterborne ships can’t move under sail and must be rowed; DM Forge does not invent an unlisted rowing Speed.</p>
            <p>Keelboats and rowboats add the current’s Speed—typically 3 mph—when moving downstream and cannot be rowed against a significant current.</p>
          </section>
        </>
      ) : null}

      <section className="dnd-large-vehicle-catalog" aria-labelledby="dnd-large-vehicle-catalog-title">
        <header><small>Edition catalog</small><h3 id="dnd-large-vehicle-catalog-title">Compare large vehicles</h3></header>
        <div>{visibleVehicles.map((item) => (
          <button aria-pressed={item.id === selectedVehicle.id} key={item.id} type="button" onClick={() => setVehicleId(item.id)}>
            <strong>{item.name}</strong>
            <span>{formatNumber(item.speedMph)} mph · {formatNumber(item.costGp)} GP</span>
            <small>{ruleset === "srd-5.2.1-2024" && item.stats2024 ? `Crew ${item.stats2024.crew} · AC ${item.stats2024.armorClass} · HP ${item.stats2024.hitPoints}` : "2014 cost and Speed reference"}</small>
          </button>
        ))}</div>
      </section>

      <footer className="dnd-large-vehicles__source"><a href={source.url} target="_blank" rel="noreferrer">{source.reference}</a></footer>
    </section>
  );
};
