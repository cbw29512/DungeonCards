import { useState, type ReactNode } from "react";
import type { MonsterCardData, MonsterItem } from "../types/monsters";
import { listMonsterText, monsterRulesetLabel } from "../utils/monsterCards";
import { MonsterCardFace } from "./MonsterCardFace";

const ItemList = ({ items }: { items: MonsterItem[] }) => items.length > 0 ? (
  <ul className="monster-folio__items">
    {items.map((item, index) => (
      <li key={`${item.name}-${index}`}>
        <strong>{item.name}.</strong>{" "}
        {[item.hit, item.reach, item.damage].filter(Boolean).join(" • ")}
        {item.text && <> — {item.text}</>}
      </li>
    ))}
  </ul>
) : <p>—</p>;

const SpellList = ({ monster }: { monster: MonsterCardData }) => {
  if (!monster.spellcasting) return <p>No spellcasting.</p>;
  return (
    <div className="monster-folio__spells">
      <p><strong>{monster.spellcasting.header}</strong></p>
      {Object.entries(monster.spellcasting.levels).map(([level, spells]) => (
        <p key={level}><b>{level}:</b> {spells.join(", ")}</p>
      ))}
    </div>
  );
};

type FolioCard = {
  id: string;
  label: string;
  cover?: boolean;
  content: ReactNode;
};

const buildFolioCards = (monster: MonsterCardData): FolioCard[] => [
  { id: "overview", label: "Overview", cover: true, content: <MonsterCardFace monster={monster} /> },
  { id: "defense", label: "Defense & Awareness", content: <>
    <h3>Defense & Awareness</h3>
    <p><b>Saves:</b> {listMonsterText(monster.saves)}</p>
    <p><b>Skills:</b> {listMonsterText(monster.skills)}</p>
    <p><b>Senses:</b> {monster.senses}</p>
    <p><b>Languages:</b> {monster.languages || "—"}</p>
    <p><b>Resistances:</b> {listMonsterText(monster.resistances)}</p>
    <p><b>Immunities:</b> {listMonsterText(monster.immunities)}</p>
    <p><b>Condition Immunities:</b> {listMonsterText(monster.conditionImmunities)}</p>
  </> },
  { id: "traits-actions", label: "Traits & Actions", content: <>
    <h3>Traits</h3><ItemList items={monster.traits} />
    <h3>Actions</h3><ItemList items={monster.actions} />
  </> },
  { id: "bonus-reactions", label: "Bonus Actions & Reactions", content: <>
    <h3>Bonus Actions</h3><ItemList items={monster.bonusActions} />
    <h3>Reactions</h3><ItemList items={monster.reactions} />
  </> },
  { id: "legendary-lair", label: "Legendary & Lair Actions", content: <>
    <h3>Legendary Actions</h3><ItemList items={monster.legendaryActions} />
    <h3>Lair Actions</h3><ItemList items={monster.lairActions} />
  </> },
  { id: "magic-source", label: "Spellcasting & Source", content: <>
    <h3>Spellcasting</h3><SpellList monster={monster} />
    <h3>Source</h3><p>{monsterRulesetLabel(monster)} • {monster.source}</p>
  </> }
];

export const MonsterFolio = ({ monster }: { monster: MonsterCardData }) => {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const cards = buildFolioCards(monster);
  const activeCard = cards[activeCardIndex];

  const moveToCard = (nextIndex: number) => {
    try {
      setActiveCardIndex(Math.max(0, Math.min(cards.length - 1, nextIndex)));
    } catch (error) {
      console.error("Changing monster folio card failed", { monsterId: monster.id, nextIndex, error });
    }
  };

  return (
    <section className="monster-folio" aria-label={`${monster.name} ordered monster folio`}>
      <div className="monster-folio__viewer">
        {cards.map((card, index) => (
          <div
            aria-hidden={index !== activeCardIndex}
            aria-label={`Card ${index + 1} of ${cards.length}: ${card.label}`}
            className={`monster-folio__panel${card.cover ? " monster-folio__cover" : ""}`}
            hidden={index !== activeCardIndex}
            key={card.id}
          >
            {!card.cover && <small className="monster-folio__card-kicker">Card {index + 1} of {cards.length}</small>}
            {card.content}
          </div>
        ))}
      </div>
      <nav className="monster-folio__navigation" aria-label={`${monster.name} folio cards`}>
        <button disabled={activeCardIndex === 0} onClick={() => moveToCard(activeCardIndex - 1)} type="button">
          Previous
        </button>
        <output aria-live="polite">Card {activeCardIndex + 1} of {cards.length} · {activeCard.label}</output>
        <button disabled={activeCardIndex === cards.length - 1} onClick={() => moveToCard(activeCardIndex + 1)} type="button">
          Next
        </button>
      </nav>
    </section>
  );
};