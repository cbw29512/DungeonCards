import type { DiceCard as DiceCardType } from "../types/cards";
import { DiceCard } from "./DiceCard";

export const HomebrewCardPreview = ({ card }: { card: DiceCardType }) => (
  <aside className="homebrew-live-preview" aria-labelledby="homebrew-live-preview-title">
    <div className="homebrew-live-preview__heading">
      <p>Live card preview</p>
      <h3 id="homebrew-live-preview-title">Updates as you type</h3>
      <span>This is the same universal-size card face used after saving.</span>
    </div>
    <div className="homebrew-live-preview__card" aria-live="polite">
      <DiceCard card={card} isFlipped={false} onFlip={() => undefined} previewOnly />
    </div>
  </aside>
);
