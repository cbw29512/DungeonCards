import { useEffect, useState } from "react";
import { useMonsterHomebrewDraft } from "../hooks/useMonsterHomebrewDraft";
import type { MonsterCardData, MonsterItem } from "../types/monsters";
import { MonsterFolio } from "./MonsterFolio";

const identityFields: Array<{
  key: keyof Pick<MonsterCardData, "name" | "cr" | "type" | "size">;
  label: string;
  example: string;
  maxLength: number;
}> = [
  { key: "name", label: "Monster name", example: "Frost Troll", maxLength: 100 },
  { key: "cr", label: "Challenge rating", example: "8", maxLength: 30 },
  { key: "type", label: "Creature type", example: "Giant", maxLength: 80 },
  { key: "size", label: "Size", example: "Large", maxLength: 40 }
];

const combatFields: Array<{
  key: keyof Pick<MonsterCardData, "ac" | "hp" | "speed" | "senses" | "languages">;
  label: string;
  example: string;
  maxLength: number;
}> = [
  { key: "ac", label: "Armor class", example: "15 or 18 (natural armor)", maxLength: 120 },
  { key: "hp", label: "Hit points", example: "136 (16d10+48)", maxLength: 120 },
  { key: "speed", label: "Speed", example: "30 ft., fly 60 ft.", maxLength: 200 },
  { key: "senses", label: "Senses", example: "Darkvision 60 ft., Passive Perception 13", maxLength: 500 },
  { key: "languages", label: "Languages", example: "Common, Giant", maxLength: 500 }
];

const actionFields: Array<{
  key: keyof MonsterItem;
  label: string;
  example: string;
  maxLength: number;
}> = [
  { key: "name", label: "Attack name", example: "Claw", maxLength: 120 },
  { key: "hit", label: "Attack bonus", example: "+8", maxLength: 1000 },
  { key: "reach", label: "Reach or range", example: "5 ft.", maxLength: 1000 },
  { key: "damage", label: "Damage", example: "12 (2d6+5) Slashing", maxLength: 1000 },
  { key: "text", label: "Rules text", example: "Melee weapon attack.", maxLength: 1000 }
];

export const MonsterHomebrewBuilder = () => {
  const draft = useMonsterHomebrewDraft();
  const [isPrinting, setIsPrinting] = useState(false);
  const primaryAction = draft.monster.actions[1] ?? draft.monster.actions[0] ?? {};
  const warnings = [
    !draft.monster.name.trim() && "Add a monster name.",
    !draft.monster.cr.trim() && "Add a challenge rating.",
    !draft.monster.type.trim() && "Add a creature type.",
    !draft.monster.size.trim() && "Add a creature size.",
    !draft.monster.ac.trim() && "Add armor class.",
    !draft.monster.hp.trim() && "Add hit points.",
    !draft.monster.speed.trim() && "Add movement speed.",
    !draft.monster.actions.some((action) => action.name.trim()) && "Add at least one named action."
  ].filter(Boolean) as string[];

  useEffect(() => {
    const finishPrint = () => setIsPrinting(false);
    window.addEventListener("afterprint", finishPrint);
    return () => window.removeEventListener("afterprint", finishPrint);
  }, []);

  const printDraft = () => {
    setIsPrinting(true);

    // Wait for the print-only class to reach the DOM before opening preview.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => window.print());
    });
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
                <input
                  maxLength={field.maxLength}
                  value={draft.monster[field.key]}
                  onChange={(event) => draft.updateField(field.key, event.target.value)}
                />
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
                <input
                  maxLength={field.maxLength}
                  value={draft.monster[field.key]}
                  onChange={(event) => draft.updateField(field.key, event.target.value)}
                />
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
                  <input
                    min="1"
                    max="30"
                    step="1"
                    type="number"
                    value={score}
                    onChange={(event) => draft.updateAbility(
                      ability as keyof MonsterCardData["abilities"],
                      Number(event.target.value)
                    )}
                  />
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
                <input
                  maxLength={field.maxLength}
                  value={String(primaryAction[field.key] ?? "")}
                  onChange={(event) => draft.updatePrimaryAction(field.key, event.target.value)}
                />
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
          {warnings.length > 0 && (
            <div className="monster-builder__warnings">
              <b>Completeness warnings</b>
              <ul>{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
            </div>
          )}
          <MonsterFolio monster={draft.monster} />
        </div>
      </div>
    </section>
  );
};
