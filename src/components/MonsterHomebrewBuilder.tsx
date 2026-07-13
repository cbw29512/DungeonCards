import { useEffect, useState } from "react";
import { useMonsterHomebrewDraft } from "../hooks/useMonsterHomebrewDraft";
import type { MonsterCardData, MonsterItem } from "../types/monsters";
import { MonsterFolio } from "./MonsterFolio";

const identityFields: Array<{
  key: keyof Pick<MonsterCardData, "name" | "cr" | "type" | "size">;
  label: string;
  example: string;
}> = [
  { key: "name", label: "Monster name", example: "Frost Troll" },
  { key: "cr", label: "Challenge rating", example: "8" },
  { key: "type", label: "Creature type", example: "Giant" },
  { key: "size", label: "Size", example: "Large" }
];

const combatFields: Array<{
  key: keyof Pick<MonsterCardData, "ac" | "hp" | "speed" | "senses" | "languages">;
  label: string;
  example: string;
}> = [
  { key: "ac", label: "Armor class", example: "15 or 18 (natural armor)" },
  { key: "hp", label: "Hit points", example: "136 (16d10+48)" },
  { key: "speed", label: "Speed", example: "30 ft., fly 60 ft." },
  { key: "senses", label: "Senses", example: "Darkvision 60 ft., Passive Perception 13" },
  { key: "languages", label: "Languages", example: "Common, Giant" }
];

const actionFields: Array<{ key: keyof MonsterItem; label: string; example: string }> = [
  { key: "name", label: "Attack name", example: "Claw" },
  { key: "hit", label: "Attack bonus", example: "+8" },
  { key: "reach", label: "Reach or range", example: "5 ft." },
  { key: "damage", label: "Damage", example: "12 (2d6+5) Slashing" },
  { key: "text", label: "Rules text", example: "Melee weapon attack." }
];

export const MonsterHomebrewBuilder = () => {
  const draft = useMonsterHomebrewDraft();
  const [isPrinting, setIsPrinting] = useState(false);
  const primaryAction = draft.monster.actions[1] ?? draft.monster.actions[0] ?? {};
  const warnings = [
    !draft.monster.name && "Add a monster name.",
    !draft.monster.cr && "Add a challenge rating.",
    !draft.monster.ac && "Add armor class.",
    !draft.monster.hp && "Add hit points.",
    draft.monster.actions.length === 0 && "Add at least one action."
  ].filter(Boolean) as string[];

  useEffect(() => {
    const finishPrint = () => setIsPrinting(false);
    window.addEventListener("afterprint", finishPrint);
    return () => window.removeEventListener("afterprint", finishPrint);
  }, []);

  const printDraft = () => {
    setIsPrinting(true);
    window.requestAnimationFrame(() => window.print());
  };

  return (
    <section className={`monster-builder${isPrinting ? " monster-builder--printing" : ""}`}>
      <div className="section-heading">
        <p>monster homebrew</p>
        <h2>Build from a complete example instead of guessing the card format.</h2>
        <span>Your draft saves automatically in this browser and uses the same printable folio renderer.</span>
      </div>

      <div className="monster-builder__layout">
        <form className="monster-builder__form" onSubmit={(event) => event.preventDefault()}>
          <fieldset>
            <legend>1. Identity</legend>
            <p>These fields create the cover and library filters.</p>
            {identityFields.map((field) => (
              <label key={field.key}>
                <span>{field.label}</span>
                <input value={draft.monster[field.key]} onChange={(event) => draft.updateField(field.key, event.target.value)} />
                <small>Example: {field.example}</small>
              </label>
            ))}
          </fieldset>

          <fieldset>
            <legend>2. Combat summary</legend>
            <p>Enter the values a DM checks constantly during combat.</p>
            {combatFields.map((field) => (
              <label key={field.key}>
                <span>{field.label}</span>
                <input value={draft.monster[field.key]} onChange={(event) => draft.updateField(field.key, event.target.value)} />
                <small>Example: {field.example}</small>
              </label>
            ))}
          </fieldset>

          <fieldset>
            <legend>3. Ability scores</legend>
            <div className="monster-builder__abilities">
              {Object.entries(draft.monster.abilities).map(([ability, score]) => (
                <label key={ability}>
                  <span>{ability.toUpperCase()}</span>
                  <input min="1" max="30" type="number" value={score} onChange={(event) => draft.updateAbility(ability as keyof MonsterCardData["abilities"], Number(event.target.value))} />
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>4. Primary attack</legend>
            <p>Structured attack fields keep the printed card consistent.</p>
            {actionFields.map((field) => (
              <label key={field.key}>
                <span>{field.label}</span>
                <input value={String(primaryAction[field.key] ?? "")} onChange={(event) => draft.updatePrimaryAction(field.key, event.target.value)} />
                <small>Example: {field.example}</small>
              </label>
            ))}
          </fieldset>

          {draft.storageError && <p className="workspace-error" role="alert">{draft.storageError}</p>}
          <div className="monster-builder__actions">
            <button onClick={draft.reset} type="button">Reload Frost Troll example</button>
            <button onClick={printDraft} type="button">Print draft folio</button>
          </div>
        </form>

        <div className="monster-builder__preview">
          {warnings.length > 0 && <div className="monster-builder__warnings"><b>Completeness warnings</b><ul>{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></div>}
          <MonsterFolio monster={draft.monster} />
        </div>
      </div>
    </section>
  );
};