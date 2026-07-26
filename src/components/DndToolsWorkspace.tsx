import { useMemo, useState } from "react";
import {
  dndToolCatalog,
  dndToolSourceByRuleset,
  type DndToolAbility,
  type DndToolCategory
} from "../data/dndTools";
import type { RulesetId } from "../types/ruleCards";
import { formatDndCoinPrice } from "../utils/dndContainersPacks";
import {
  extractDndToolDc,
  filterDndTools,
  resolveDndToolPurchase,
  rollDndToolCheck,
  type DndToolCheckResult
} from "../utils/dndTools";
import "../styles/dnd-tools-workspace.css";

type DndToolsWorkspaceProps = { ruleset: RulesetId };

const abilities: DndToolAbility[] = ["Strength", "Dexterity", "Intelligence", "Wisdom", "Charisma"];
const variantCount = dndToolCatalog.reduce((total, tool) => total + (tool.variants?.length ?? 0), 0);

const formatWeight = (weight: number | undefined): string => weight === undefined
  ? "Weight not listed"
  : `${weight.toLocaleString("en-US", { maximumFractionDigits: 1 })} lb.`;

export const DndToolsWorkspace = ({ ruleset }: DndToolsWorkspaceProps) => {
  const [toolId, setToolId] = useState("thieves");
  const [variantId, setVariantId] = useState<string>();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<DndToolCategory | "all">("all");
  const [ability2014, setAbility2014] = useState<DndToolAbility>("Dexterity");
  const [abilityModifier, setAbilityModifier] = useState(3);
  const [proficiencyBonus, setProficiencyBonus] = useState(2);
  const [toolProficient, setToolProficient] = useState(true);
  const [relevantSkillProficient, setRelevantSkillProficient] = useState(false);
  const [task, setTask] = useState("Pick a lock (DC 15)");
  const [dc, setDc] = useState(15);
  const [result, setResult] = useState<DndToolCheckResult>();

  const selectedTool = useMemo(
    () => dndToolCatalog.find((tool) => tool.id === toolId) ?? dndToolCatalog[0],
    [toolId]
  );
  const purchase = resolveDndToolPurchase(selectedTool, variantId);
  const visibleTools = useMemo(
    () => filterDndTools(dndToolCatalog, query, category),
    [query, category]
  );
  const source = dndToolSourceByRuleset[ruleset];
  const activeAbility = ruleset === "srd-5.2.1-2024" ? selectedTool.ability2024 : ability2014;

  const selectTool = (nextToolId: string) => {
    const nextTool = dndToolCatalog.find((tool) => tool.id === nextToolId) ?? dndToolCatalog[0];
    const firstProcedure = nextTool.utilize2024[0] ?? "Describe the tool task";
    setToolId(nextTool.id);
    setVariantId(nextTool.variants?.[0]?.id);
    setAbility2014(nextTool.ability2024);
    setTask(ruleset === "srd-5.2.1-2024" ? firstProcedure : "Describe the tool task");
    setDc(ruleset === "srd-5.2.1-2024" ? extractDndToolDc(firstProcedure) ?? 15 : 15);
    setResult(undefined);
  };

  const selectPublishedProcedure = (procedure: string) => {
    setTask(procedure);
    setDc(extractDndToolDc(procedure) ?? dc);
    setResult(undefined);
  };

  const makeCheck = () => {
    setResult(rollDndToolCheck({
      ruleset,
      abilityModifier,
      proficiencyBonus,
      toolProficient,
      relevantSkillProficient,
      dc
    }));
  };

  return (
    <section className="dnd-tools-workspace" aria-labelledby="dnd-tools-workspace-title">
      <header className="dnd-tools-workspace__heading">
        <div>
          <small>Tool proficiency and procedures</small>
          <h2 id="dnd-tools-workspace-title">Choose the tool, ability, and exact task.</h2>
          <p>2014 lets the DM choose the ability that fits the task. In 2024 each tool publishes an ability, Utilize procedures, and Craft options.</p>
        </div>
        <strong>{dndToolCatalog.length} families · {variantCount} variants</strong>
      </header>

      <section className="dnd-tool-runner" aria-label="Tool check runner">
        <div className="dnd-tool-runner__controls">
          <label>Tool<select value={selectedTool.id} onChange={(event) => selectTool(event.target.value)}>{dndToolCatalog.map((tool) => <option key={tool.id} value={tool.id}>{tool.name}</option>)}</select></label>
          {selectedTool.variants && (
            <label>Specific proficiency<select value={purchase.variant?.id} onChange={(event) => {
              setVariantId(event.target.value);
              setResult(undefined);
            }}>{selectedTool.variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.name}</option>)}</select></label>
          )}

          <div className="dnd-tool-stat-grid">
            {ruleset === "srd-5.1-2014" ? (
              <label>Ability selected by DM<select value={ability2014} onChange={(event) => {
                setAbility2014(event.target.value as DndToolAbility);
                setResult(undefined);
              }}>{abilities.map((ability) => <option key={ability} value={ability}>{ability}</option>)}</select></label>
            ) : (
              <label>Published ability<input readOnly value={selectedTool.ability2024} /></label>
            )}
            <label>{activeAbility} modifier<input min="-5" max="10" type="number" value={abilityModifier} onChange={(event) => {
              setAbilityModifier(Math.trunc(Number(event.target.value) || 0));
              setResult(undefined);
            }} /></label>
            <label>Proficiency Bonus<input min="0" max="10" type="number" value={proficiencyBonus} onChange={(event) => {
              setProficiencyBonus(Math.max(0, Math.trunc(Number(event.target.value) || 0)));
              setResult(undefined);
            }} /></label>
            <label>DC<input min="0" max="40" type="number" value={dc} onChange={(event) => {
              setDc(Math.max(0, Math.trunc(Number(event.target.value) || 0)));
              setResult(undefined);
            }} /></label>
          </div>

          <label>Current task<input value={task} onChange={(event) => {
            setTask(event.target.value);
            setResult(undefined);
          }} /></label>

          <div className="dnd-tool-checks">
            <label><input type="checkbox" checked={toolProficient} onChange={(event) => {
              setToolProficient(event.target.checked);
              setResult(undefined);
            }} />Proficient with this specific tool</label>
            {ruleset === "srd-5.2.1-2024" && <label><input type="checkbox" checked={relevantSkillProficient} onChange={(event) => {
              setRelevantSkillProficient(event.target.checked);
              setResult(undefined);
            }} />A relevant skill proficiency is used with this check</label>}
          </div>

          <button className="dnd-tool-roll" type="button" onClick={makeCheck}>Roll {purchase.name} check</button>
        </div>

        <article className="dnd-tool-result">
          <header>
            <div><small>Selected tool</small><h3>{purchase.name}</h3></div>
            <strong>{purchase.costCp === undefined ? "Price varies" : formatDndCoinPrice(purchase.costCp)}</strong>
          </header>
          <p>{formatWeight(purchase.weightPounds)} · {activeAbility} check</p>
          {ruleset === "srd-5.1-2014" ? (
            <section className="dnd-tool-edition-procedure">
              <strong>2014 procedure</strong>
              <p>{selectedTool.procedure2014}</p>
              {selectedTool.id === "thieves" && !toolProficient && <p className="is-warning">Some tasks, including opening a lock, may require proficiency to attempt or assist.</p>}
            </section>
          ) : (
            <section className="dnd-tool-edition-procedure">
              <strong>2024 procedure</strong>
              <p>Add Proficiency Bonus only when proficient with the tool. If a relevant skill proficiency is used with the same check, roll with Advantage.</p>
              <div className="dnd-tool-utilize-list">
                {selectedTool.utilize2024.map((procedure) => <button aria-pressed={task === procedure} key={procedure} type="button" onClick={() => selectPublishedProcedure(procedure)}>{procedure}</button>)}
              </div>
              <div className="dnd-tool-craft-list">
                <small>Craft options</small>
                {selectedTool.craft2024.length > 0 ? <ul>{selectedTool.craft2024.map((item) => <li key={item}>{item}</li>)}</ul> : <p>No specific Craft entry is published for this tool.</p>}
              </div>
            </section>
          )}

          {result ? (
            <section className={`dnd-tool-roll-result ${result.success ? "is-success" : "is-failure"}`} aria-live="polite">
              <small>{result.advantage ? `Advantage rolls ${result.rolls.join(" and ")}` : `d20 roll ${result.chosenRoll}`}</small>
              <strong>{result.total}</strong>
              <p>{result.chosenRoll} + {result.abilityModifier} ability + {result.proficiencyBonus} proficiency = {result.total} vs. DC {result.dc}</p>
              <span>{result.success ? "Success" : "Failure"}</span>
            </section>
          ) : <p className="dnd-tool-result__empty">Set the task and roll when the check matters.</p>}
        </article>
      </section>

      <section className="dnd-tool-catalog" aria-labelledby="dnd-tool-catalog-title">
        <header>
          <div><small>Complete nonvehicle tool catalog</small><h3 id="dnd-tool-catalog-title">Find a tool</h3></div>
          <div>
            <label>Search<input type="search" placeholder="lock, potion, map, instrument…" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
            <label>Category<select value={category} onChange={(event) => setCategory(event.target.value as DndToolCategory | "all")}><option value="all">All tools</option><option value="artisan">Artisan’s Tools</option><option value="other">Other Tools</option></select></label>
          </div>
        </header>
        <p>{visibleTools.length} matching tool famil{visibleTools.length === 1 ? "y" : "ies"}</p>
        <div>{visibleTools.map((tool) => (
          <button aria-pressed={tool.id === selectedTool.id} key={tool.id} type="button" onClick={() => selectTool(tool.id)}>
            <span>{tool.category === "artisan" ? "Artisan" : "Other"}</span>
            <strong>{tool.name}</strong>
            <small>{ruleset === "srd-5.2.1-2024" ? `${tool.ability2024} · ${tool.utilize2024.length} Utilize option${tool.utilize2024.length === 1 ? "" : "s"}` : "DM-selected ability"}</small>
            <em>{tool.variants ? `${tool.variants.length} separate variants` : `${tool.costCp === undefined ? "Price varies" : formatDndCoinPrice(tool.costCp)} · ${formatWeight(tool.weightPounds)}`}</em>
          </button>
        ))}</div>
      </section>

      <footer className="dnd-tools-workspace__source"><a href={source.url} target="_blank" rel="noreferrer">{source.reference}</a></footer>
    </section>
  );
};
