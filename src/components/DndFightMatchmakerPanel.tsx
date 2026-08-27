import { useMemo, useState } from "react";
import { encounterMonsterCatalog } from "../data/encounterMonsterCatalog";
import type { DndCharacterRecord } from "../types/dndCharacter";
import type { FightCombatantProfile } from "../types/fightMatchmaker";
import { RULESET_LABELS } from "../types/ruleCards";
import { assessFightMatch, rankFightOpponents } from "../utils/fightMatchmaker";
import { buildCharacterFightProfile, buildSrdMonsterFightProfile } from "../utils/fightProfileAdapters";

type Props = { character: DndCharacterRecord };
type Mode = "recommended" | "custom";

const percent = (chance: number): string => `${Math.round(chance * 100)}%`;
const monsterKey = (ruleset: string, id: string): string => `${ruleset}:${id}`;

export const DndFightMatchmakerPanel = ({ character }: Props) => {
  const [mode, setMode] = useState<Mode>("recommended");
  const [selectedMonsterKey, setSelectedMonsterKey] = useState("");
  const characterResult = useMemo(() => buildCharacterFightProfile(character), [character]);

  const availableProfiles = useMemo(() => encounterMonsterCatalog.flatMap((entry) => {
    if (entry.kind !== "reference") return [];
    const result = buildSrdMonsterFightProfile(entry.monster);
    return result.ok ? [{ entry, profile: result.profile }] : [];
  }), []);

  const recommendations = useMemo(() => {
    if (!characterResult.ok) return [];
    const ranked = rankFightOpponents(
      characterResult.profile,
      availableProfiles.map(({ profile }) => profile),
      5
    );
    return ranked.map((recommendation) => ({
      ...recommendation,
      entry: availableProfiles.find(({ profile }) => (
        profile.id === recommendation.opponent.id
        && profile.ruleset === recommendation.opponent.ruleset
      ))?.entry
    })).filter((item) => item.entry);
  }, [availableProfiles, characterResult]);

  const selectedEntry = encounterMonsterCatalog.find((entry) => (
    monsterKey(entry.ruleset, entry.id) === selectedMonsterKey
  ));
  let selectedProfile: FightCombatantProfile | undefined;
  let selectedIssue = "";
  if (selectedEntry?.kind === "reference") {
    const result = buildSrdMonsterFightProfile(selectedEntry.monster);
    if (result.ok) selectedProfile = result.profile;
    else selectedIssue = result.issues[0] ?? "Balance automation is unavailable for this monster.";
  } else if (selectedEntry) {
    selectedIssue = "This formatted monster can still be used for a custom fight, but automated duel odds are not wired yet.";
  }

  const selectedAssessment = characterResult.ok && selectedProfile
    ? assessFightMatch(characterResult.profile, selectedProfile)
    : undefined;

  return (
    <section className="fight-matchmaker" aria-labelledby="fight-matchmaker-title">
      <header className="fight-matchmaker__header">
        <div>
          <p className="fight-matchmaker__eyebrow">Fight Cards · RAW stats stay untouched</p>
          <h3 id="fight-matchmaker-title">Choose a worthy opponent—or choose chaos.</h3>
          <p>Recommended matches rank the closest supported SRD duels. Custom Match never blocks an intentional mismatch.</p>
          <p className="fight-matchmaker__scope">Baseline odds use AC, HP, supported attacks, ordinary critical hits, and Fighter Extra Attack. Unsupported special abilities are never silently estimated.</p>
        </div>
        <div className="fight-matchmaker__modes" aria-label="Fight matching mode">
          <button aria-pressed={mode === "recommended"} onClick={() => setMode("recommended")} type="button">Recommended Match</button>
          <button aria-pressed={mode === "custom"} onClick={() => setMode("custom")} type="button">Custom Match</button>
        </div>
      </header>

      {!characterResult.ok ? (
        <p className="fight-matchmaker__notice" role="alert">{characterResult.issues.join(" ")}</p>
      ) : mode === "recommended" ? (
        <div className="fight-matchmaker__recommendations">
          {recommendations.map(({ assessment, entry }) => entry && (
            <article className={`fight-matchmaker__result fight-matchmaker__result--${assessment.severity}`} key={monsterKey(entry.ruleset, entry.id)}>
              <div><strong>{character.name} vs. {entry.name}</strong><span>{RULESET_LABELS[character.ruleset]} · CR {entry.cr}</span></div>
              <div className="fight-matchmaker__odds"><b>{percent(assessment.characterWinChance)}</b><span>{assessment.label}</span><b>{percent(assessment.monsterWinChance)}</b></div>
              <button onClick={() => { setSelectedMonsterKey(monsterKey(entry.ruleset, entry.id)); setMode("custom"); }} type="button">Use this matchup</button>
            </article>
          ))}
          {!recommendations.length && <p className="fight-matchmaker__notice">No same-edition high-confidence SRD duel profiles are available for this character yet.</p>}
        </div>
      ) : (
        <div className="fight-matchmaker__custom">
          <label htmlFor="fight-monster-select">Opponent</label>
          <select id="fight-monster-select" onChange={(event) => setSelectedMonsterKey(event.target.value)} value={selectedMonsterKey}>
            <option value="">Choose any monster…</option>
            {encounterMonsterCatalog.map((entry) => (
              <option key={monsterKey(entry.ruleset, entry.id)} value={monsterKey(entry.ruleset, entry.id)}>{entry.name} · {entry.ruleset === "homebrew" ? "Homebrew" : RULESET_LABELS[entry.ruleset]} · CR {entry.cr}</option>
            ))}
          </select>

          {selectedAssessment && selectedEntry ? (
            <article className={`fight-matchmaker__showdown fight-matchmaker__result--${selectedAssessment.severity}`}>
              <h4>{character.name} <span>VS</span> {selectedEntry.name}</h4>
              <div className="fight-matchmaker__odds"><b>{percent(selectedAssessment.characterWinChance)}</b><span>{selectedAssessment.label}</span><b>{percent(selectedAssessment.monsterWinChance)}</b></div>
              <p>{selectedAssessment.reasons.join(" ")}</p>
              {!selectedAssessment.rulesetCompatible && <strong className="fight-matchmaker__warning">Cross-edition custom fight — allowed, not recommended.</strong>}
            </article>
          ) : selectedEntry ? (
            <p className="fight-matchmaker__notice">{selectedIssue || "This matchup can be selected, but automated odds are not available yet."}</p>
          ) : null}
        </div>
      )}
    </section>
  );
};
