import { useState, type ReactNode } from "react";
import type { SrdMonsterRecord } from "../types/srdCompendium";
import { RULESET_LABELS } from "../types/ruleCards";
import { stripMonsterExperienceText } from "../utils/monsterChallenge";
import { MonsterPortraitFace } from "./MonsterPortraitFace";

const ReferenceText = ({ text, empty = "—" }: { text: string; empty?: string }) => {
  const cleaned = stripMonsterExperienceText(text);
  if (!cleaned.trim()) return <p>{empty}</p>;
  return (
    <div className="srd-monster-folio__text">
      {cleaned.split("\n\n").map((paragraph, index) => (
        <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
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

const buildCards = (monster: SrdMonsterRecord): FolioCard[] => [
  {
    id: "portrait",
    label: "Portrait",
    cover: true,
    content: (
      <MonsterPortraitFace
        challengeRating={monster.challenge}
        name={monster.name}
        ruleset={monster.edition}
        rulesetLabel={RULESET_LABELS[monster.edition]}
        size={monster.size}
        type={monster.type}
      />
    )
  },
  {
    id: "stat-block",
    label: "Complete Stat Block",
    content: <>
      <h3>Complete Stat Block</h3>
      <ReferenceText text={monster.rawText} />
    </>
  },
  {
    id: "traits",
    label: "Traits",
    content: <>
      <h3>Traits</h3>
      <ReferenceText text={monster.traits} empty="No separate traits section." />
    </>
  },
  {
    id: "actions",
    label: "Actions",
    content: <>
      <h3>Actions</h3>
      <ReferenceText text={monster.actions} empty="No separate actions section." />
    </>
  },
  {
    id: "bonus-reactions",
    label: "Bonus Actions & Reactions",
    content: <>
      <h3>Bonus Actions</h3>
      <ReferenceText text={monster.bonusActions} />
      <h3>Reactions</h3>
      <ReferenceText text={monster.reactions} />
    </>
  },
  {
    id: "legendary-source",
    label: "Legendary Actions & Source",
    content: <>
      <h3>Legendary Actions</h3>
      <ReferenceText text={monster.legendaryActions} />
      <h3>Source</h3>
      <p>{RULESET_LABELS[monster.edition]} • {monster.sourceReference}</p>
      <p>Official SRD reference • CC BY 4.0</p>
    </>
  }
];

export const SrdMonsterEncounterFolio = ({ monster }: { monster: SrdMonsterRecord }) => {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const cards = buildCards(monster);
  const activeCard = cards[activeCardIndex];
  const moveToCard = (nextIndex: number) => setActiveCardIndex(
    Math.max(0, Math.min(cards.length - 1, nextIndex))
  );

  return (
    <section className="monster-folio" aria-label={`${monster.name} ordered SRD monster folio`}>
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
        <button disabled={activeCardIndex === 0} onClick={() => moveToCard(activeCardIndex - 1)} type="button">Previous</button>
        <output aria-live="polite">Card {activeCardIndex + 1} of {cards.length} · {activeCard.label}</output>
        <button disabled={activeCardIndex === cards.length - 1} onClick={() => moveToCard(activeCardIndex + 1)} type="button">Next</button>
      </nav>
    </section>
  );
};
