export type GameSystemId = "dnd-5e" | "coc-7e";

type GameSystemGatewayProps = {
  onSelect: (system: GameSystemId) => void;
};

export const GameSystemGateway = ({ onSelect }: GameSystemGatewayProps) => (
  <main className="system-gateway">
    <div className="system-gateway__mist" aria-hidden="true" />
    <section className="system-gateway__panel" aria-labelledby="system-gateway-title">
      <p className="system-gateway__eyebrow">DM Forge · One home for both tables</p>
      <h1 id="system-gateway-title">What are you running tonight?</h1>
      <p>
        Choose the game system before opening a workspace. D&amp;D and Cthulhu keep their own
        rules, cards, roll history, creatures, and homebrew records so table information never
        leaks between campaigns.
      </p>

      <div className="system-gateway__choices">
        <button className="system-choice system-choice--dnd" type="button" onClick={() => onSelect("dnd-5e")}>
          <span className="system-choice__sigil" aria-hidden="true">⚔️</span>
          <span>
            <small>Fantasy campaign operating system</small>
            <strong>Dungeons &amp; Dragons</strong>
            <em>Verified 5e and 5.5e references, roll cards, monsters, encounters, live card builders, and local homebrew.</em>
          </span>
        </button>

        <button className="system-choice system-choice--coc" type="button" onClick={() => onSelect("coc-7e")}>
          <span className="system-choice__sigil" aria-hidden="true">◉</span>
          <span>
            <small>Investigation and horror operating system</small>
            <strong>Cthulhu Keeper Tools</strong>
            <em>Percentile procedures, investigations, Sanity, injuries, combat, firearms, creatures, occult records, and Keeper run sheets.</em>
          </span>
        </button>
      </div>

      <p className="system-gateway__notice">
        Cthulhu pages use original summaries, original demonstration content, and open BRP-compatible procedures. They do not reproduce paid rulebook text, official scenarios, artwork, logos, or proprietary statistics.
      </p>
    </section>
  </main>
);
