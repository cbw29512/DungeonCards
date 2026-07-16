import { useEffect, useState, type CSSProperties } from "react";
import { getMonsterArtwork } from "../data/monsterArtwork";
import type { MonsterRuleset } from "../types/monsters";
import { formatMonsterChallengeRating } from "../utils/monsterChallenge";

type MonsterPortraitFaceProps = {
  name: string;
  type: string;
  size: string;
  ruleset: MonsterRuleset;
  rulesetLabel: string;
  challengeRating: string;
};

const palettes = [
  ["#130f20", "#7851a9", "#f5c96b"],
  ["#0c1719", "#247b78", "#a8e6cf"],
  ["#1b0d0d", "#9b3d34", "#ffc857"],
  ["#10151f", "#3f6ea8", "#b9d6f2"],
  ["#17120b", "#8b6b35", "#e8c07d"]
] as const;

const hashText = (value: string) => [...value].reduce(
  (hash, character) => ((hash * 31) + character.charCodeAt(0)) >>> 0,
  2166136261
);

const normalizeType = (value: string) => value.toLowerCase();

const MonsterSilhouette = ({ type, seed }: { type: string; seed: number }) => {
  const normalized = normalizeType(type);
  const hasWings = /(dragon|celestial|fiend|fey)/.test(normalized);
  const hasHorns = /(dragon|fiend|monstrosity|giant)/.test(normalized);
  const hasTentacles = /(aberration|ooze)/.test(normalized);
  const isConstruct = normalized.includes("construct");
  const isPlant = normalized.includes("plant");
  const isElemental = normalized.includes("elemental");
  const isUndead = normalized.includes("undead");
  const isBeast = normalized.includes("beast");
  const eyeOffset = 7 + (seed % 7);

  if (isElemental) {
    return <path d="M250 116 C325 205 365 285 328 392 C300 475 202 505 151 431 C104 364 146 299 190 247 C176 310 224 319 236 269 C245 228 222 178 250 116 Z" />;
  }

  if (isConstruct) {
    return <g><rect x="182" y="194" width="136" height="132" rx="18" /><rect x="148" y="320" width="204" height="184" rx="28" /><rect x="103" y="335" width="52" height="155" rx="20" /><rect x="345" y="335" width="52" height="155" rx="20" /></g>;
  }

  if (hasTentacles) {
    return <g><ellipse cx="250" cy="270" rx="104" ry="112" /><path d="M184 346 C98 410 122 503 71 548 M217 365 C165 430 197 516 151 572 M282 365 C337 437 303 521 352 574 M316 346 C402 413 376 505 429 548" fill="none" stroke="currentColor" strokeWidth="34" strokeLinecap="round" /></g>;
  }

  return (
    <g>
      {hasWings && <><path d="M176 282 C82 190 38 228 77 355 C101 431 145 441 193 397 Z" /><path d="M324 282 C418 190 462 228 423 355 C399 431 355 441 307 397 Z" /></>}
      {isPlant && <><path d="M211 225 C144 175 132 119 154 78 C211 101 239 145 230 216 Z" /><path d="M289 225 C356 175 368 119 346 78 C289 101 261 145 270 216 Z" /></>}
      <ellipse cx="250" cy="286" rx={isBeast ? 92 : 78} ry="88" />
      <path d="M164 341 C174 293 326 293 336 341 L373 510 L127 510 Z" />
      {hasHorns && <><path d="M203 225 C163 180 175 142 207 120 C200 164 226 184 226 225 Z" /><path d="M297 225 C337 180 325 142 293 120 C300 164 274 184 274 225 Z" /></>}
      {isBeast && <><path d="M191 227 L148 184 L164 258 Z" /><path d="M309 227 L352 184 L336 258 Z" /></>}
      {isUndead && <path d="M207 318 Q250 354 293 318 L280 365 L220 365 Z" fill="var(--monster-art-bg)" />}
      <circle cx={250 - eyeOffset} cy="280" r="8" fill="var(--monster-art-glow)" />
      <circle cx={250 + eyeOffset} cy="280" r="8" fill="var(--monster-art-glow)" />
    </g>
  );
};

export const MonsterPortraitFace = ({
  name,
  type,
  size,
  ruleset,
  rulesetLabel,
  challengeRating
}: MonsterPortraitFaceProps) => {
  const seed = hashText(`${name}:${type}`);
  const palette = palettes[seed % palettes.length];
  const style = {
    "--monster-art-bg": palette[0],
    "--monster-art-accent": palette[1],
    "--monster-art-glow": palette[2]
  } as CSSProperties;
  const artwork = ruleset === "homebrew"
    ? undefined
    : getMonsterArtwork(ruleset, name);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => setImageFailed(false), [artwork?.imageUrl]);

  const showLicensedArtwork = Boolean(artwork && !imageFailed);

  return (
    <article
      className={`monster-portrait-card${showLicensedArtwork ? " monster-portrait-card--licensed" : " monster-portrait-card--fallback"}`}
      data-artwork-id={artwork?.id}
      style={style}
    >
      {showLicensedArtwork ? (
        <img
          alt={`${name} illustration: ${artwork?.title}`}
          className="monster-portrait-card__licensed-art"
          decoding="async"
          loading="lazy"
          onError={() => setImageFailed(true)}
          src={artwork?.imageUrl}
        />
      ) : (
        <svg
          aria-label={`Original generated fallback portrait for ${name}`}
          className="monster-portrait-card__art"
          role="img"
          viewBox="0 0 500 620"
        >
          <rect width="500" height="620" fill="var(--monster-art-bg)" />
          <circle cx="250" cy="252" r="190" fill="var(--monster-art-accent)" opacity="0.34" />
          <circle cx="250" cy="252" r="150" fill="var(--monster-art-glow)" opacity="0.12" />
          <g color="var(--monster-art-accent)" fill="currentColor" opacity="0.96">
            <MonsterSilhouette seed={seed} type={type} />
          </g>
          <path d="M0 510 C110 470 169 556 270 506 C366 458 413 516 500 480 L500 620 L0 620 Z" fill="var(--monster-art-bg)" opacity="0.92" />
        </svg>
      )}
      <div className="monster-portrait-card__caption">
        <small>{rulesetLabel} • {size} {type}</small>
        <h3>{name}</h3>
        <div><b>CR {formatMonsterChallengeRating(challengeRating)}</b><span>Click for stats</span></div>
        <small className="monster-portrait-card__credit">
          {artwork
            ? `${artwork.creator} • ${artwork.licenseName}`
            : "Original generated fallback • licensing-safe"}
        </small>
      </div>
    </article>
  );
};
