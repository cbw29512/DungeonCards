import { useMemo, useState } from "react";
import {
  dndContainerCatalog,
  dndContainerPackSourceByRuleset,
  dndEquipmentPackCatalog
} from "../data/dndContainersPacks";
import type { RulesetId } from "../types/ruleCards";
import {
  calculateDndContainerPlan,
  formatDndCoinPrice
} from "../utils/dndContainersPacks";
import "../styles/dnd-containers-packs.css";

type DndContainersPacksProps = { ruleset: RulesetId };

const formatWeight = (value: number): string => value.toLocaleString("en-US", { maximumFractionDigits: 1 });

export const DndContainersPacks = ({ ruleset }: DndContainersPacksProps) => {
  const [containerId, setContainerId] = useState("backpack");
  const [quantity, setQuantity] = useState(1);
  const [contentsWeight, setContentsWeight] = useState(20);
  const [containerQuery, setContainerQuery] = useState("");
  const [packId, setPackId] = useState("explorer");

  const selectedContainer = useMemo(
    () => dndContainerCatalog.find((item) => item.id === containerId) ?? dndContainerCatalog[0],
    [containerId]
  );
  const selectedPack = useMemo(
    () => dndEquipmentPackCatalog.find((item) => item.id === packId) ?? dndEquipmentPackCatalog[0],
    [packId]
  );
  const plan = calculateDndContainerPlan({
    container: selectedContainer,
    ruleset,
    quantity,
    contentsWeightPounds: contentsWeight
  });
  const normalizedQuery = containerQuery.trim().toLowerCase();
  const visibleContainers = dndContainerCatalog.filter((item) => !normalizedQuery || [
    item.names[ruleset],
    item.capacity[ruleset],
    item.notes?.[ruleset]
  ].filter(Boolean).join(" ").toLowerCase().includes(normalizedQuery));
  const source = dndContainerPackSourceByRuleset[ruleset];
  const packWeight = selectedPack.totalWeightPounds[ruleset];

  return (
    <section className="dnd-containers-packs" aria-labelledby="dnd-containers-packs-title">
      <header className="dnd-containers-packs__heading">
        <div>
          <small>Containers and equipment packs</small>
          <h2 id="dnd-containers-packs-title">Know what fits—and what the pack actually contains.</h2>
          <p>Weight limits are enforced only when the selected edition publishes one. Volume-only containers remain manual rather than receiving an invented pound limit.</p>
        </div>
        <strong>16 containers · 7 packs</strong>
      </header>

      <section className="dnd-container-planner" aria-label="Container capacity planner">
        <div className="dnd-container-planner__controls">
          <label>Container<select value={containerId} onChange={(event) => setContainerId(event.target.value)}>{dndContainerCatalog.map((item) => <option key={item.id} value={item.id}>{item.names[ruleset]}</option>)}</select></label>
          <div>
            <label>Quantity<input min="1" max="100" type="number" value={quantity} onChange={(event) => setQuantity(Math.min(100, Math.max(1, Math.trunc(Number(event.target.value) || 1))))} /></label>
            <label>Contents weight<input min="0" step="0.5" type="number" value={contentsWeight} onChange={(event) => setContentsWeight(Math.max(0, Number(event.target.value) || 0))} /></label>
          </div>
          <p><strong>Published capacity:</strong> {selectedContainer.capacity[ruleset]}</p>
          {selectedContainer.notes?.[ruleset] && <p>{selectedContainer.notes[ruleset]}</p>}
        </div>

        <article className={`dnd-container-plan ${plan.overWeightCapacity ? "is-overloaded" : ""}`} aria-live="polite">
          <header><div><small>Storage plan</small><h3>{plan.overWeightCapacity ? "Weight limit exceeded" : "Container plan ready"}</h3></div><strong>{formatDndCoinPrice(plan.totalCostCp)}</strong></header>
          <dl>
            <div><dt>Empty weight</dt><dd>{formatWeight(plan.emptyWeightPounds)} lb.</dd></div>
            <div><dt>Contents</dt><dd>{formatWeight(plan.contentsWeightPounds)} lb.</dd></div>
            <div><dt>Total carried</dt><dd>{formatWeight(plan.totalWeightPounds)} lb.</dd></div>
            <div><dt>Weight limit</dt><dd>{plan.totalWeightCapacityPounds === undefined ? "Volume only" : `${formatWeight(plan.totalWeightCapacityPounds)} lb.`}</dd></div>
            <div><dt>Capacity left</dt><dd>{plan.remainingWeightCapacityPounds === undefined ? "Track volume" : `${formatWeight(plan.remainingWeightCapacityPounds)} lb.`}</dd></div>
          </dl>
          {plan.overWeightCapacity
            ? <p className="is-danger">Reduce the contents or add more containers. The published combined weight limit is {formatWeight(plan.totalWeightCapacityPounds ?? 0)} pounds.</p>
            : plan.totalWeightCapacityPounds === undefined
              ? <p>DM Forge has not invented a weight maximum. Confirm that the contents fit the published liquid, volume, sheet, or ammunition capacity.</p>
              : <p className="is-good">The entered contents remain within the published combined weight limit.</p>}
        </article>
      </section>

      <section className="dnd-container-catalog" aria-labelledby="dnd-container-catalog-title">
        <header>
          <div><small>Capacity reference</small><h3 id="dnd-container-catalog-title">Find a container</h3></div>
          <label>Search<input type="search" placeholder="backpack, liquid, arrows…" value={containerQuery} onChange={(event) => setContainerQuery(event.target.value)} /></label>
        </header>
        <p>{visibleContainers.length} matching container{visibleContainers.length === 1 ? "" : "s"}</p>
        <div>{visibleContainers.map((item) => (
          <button aria-pressed={item.id === containerId} key={item.id} type="button" onClick={() => setContainerId(item.id)}>
            <strong>{item.names[ruleset]}</strong>
            <span>{item.capacity[ruleset]}</span>
            <small>{item.emptyWeightPounds === undefined ? "Weight not listed" : `${formatWeight(item.emptyWeightPounds)} lb.`} · {formatDndCoinPrice(item.costCp)}</small>
          </button>
        ))}</div>
      </section>

      <section className="dnd-pack-catalog" aria-labelledby="dnd-pack-catalog-title">
        <header><div><small>Edition-specific bundles</small><h3 id="dnd-pack-catalog-title">Equipment packs</h3></div><label>Selected pack<select value={packId} onChange={(event) => setPackId(event.target.value)}>{dndEquipmentPackCatalog.map((pack) => <option key={pack.id} value={pack.id}>{pack.names[ruleset]}</option>)}</select></label></header>
        <article className="dnd-pack-detail">
          <header><div><small>{ruleset === "srd-5.1-2014" ? "2014 contents" : "2024 contents"}</small><h4>{selectedPack.names[ruleset]}</h4></div><strong>{formatDndCoinPrice(selectedPack.costCp[ruleset])}</strong></header>
          <p>{packWeight === undefined ? "The 2014 rules do not publish a single packaged total weight; add the listed items to the loadout individually." : `Published total weight: ${formatWeight(packWeight)} lb.`}</p>
          <ul>{selectedPack.contents[ruleset].map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
        <div className="dnd-pack-grid">{dndEquipmentPackCatalog.map((pack) => (
          <button aria-pressed={pack.id === packId} key={pack.id} type="button" onClick={() => setPackId(pack.id)}>
            <strong>{pack.names[ruleset]}</strong>
            <span>{formatDndCoinPrice(pack.costCp[ruleset])}</span>
            <small>{pack.totalWeightPounds[ruleset] === undefined ? "Itemized weight" : `${formatWeight(pack.totalWeightPounds[ruleset]!)} lb.`} · {pack.contents[ruleset].length} listed entries</small>
          </button>
        ))}</div>
      </section>

      <footer className="dnd-containers-packs__source"><a href={source.url} target="_blank" rel="noreferrer">{source.reference}</a></footer>
    </section>
  );
};
