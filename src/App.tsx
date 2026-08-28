import { useState } from "react";
import { CocAppShell } from "./components/cocShell/CocAppShell";
import { DndAppShell } from "./components/dndShell/DndAppShell";
import { FightCardsFrontDoor } from "./components/FightCardsFrontDoor";
import { GameSystemGateway, type GameSystemId } from "./components/GameSystemGateway";
import {
  clearSystemRoute,
  parseSystem,
  replaceCocRoute,
  replaceDndRoute
} from "./integration/dmForgeRoute";

const initialSearch = (): string => (
  typeof window === "undefined" ? "" : window.location.search
);

export const App = () => {
  const [gameSystem, setGameSystem] = useState<GameSystemId | undefined>(() => parseSystem(initialSearch()));
  const [showSystemGateway, setShowSystemGateway] = useState(false);

  const selectSystem = (system: GameSystemId) => {
    setGameSystem(system);
    setShowSystemGateway(false);
    if (system === "dnd-5e") replaceDndRoute("home");
    else replaceCocRoute("home");
  };

  const changeSystem = () => {
    clearSystemRoute();
    setGameSystem(undefined);
    setShowSystemGateway(false);
  };

  if (!gameSystem && !showSystemGateway) {
    return (
      <FightCardsFrontDoor
        onOpenDndTools={() => selectSystem("dnd-5e")}
        onOpenOtherSystems={() => setShowSystemGateway(true)}
      />
    );
  }

  if (!gameSystem) {
    return (
      <main className="fight-front-door__other-games">
        <button type="button" onClick={() => setShowSystemGateway(false)}>← Back to Fight Cards</button>
        <GameSystemGateway onSelect={selectSystem} />
      </main>
    );
  }

  if (gameSystem === "coc-7e") return <CocAppShell onChangeSystem={changeSystem} />;
  return <DndAppShell onChangeSystem={changeSystem} />;
};
