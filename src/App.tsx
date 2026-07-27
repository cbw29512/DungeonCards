import { useState } from "react";
import { CocAppShell } from "./components/cocShell/CocAppShell";
import { DndAppShell } from "./components/dndShell/DndAppShell";
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

  const selectSystem = (system: GameSystemId) => {
    setGameSystem(system);
    if (system === "dnd-5e") replaceDndRoute("home");
    else replaceCocRoute("home");
  };

  const changeSystem = () => {
    clearSystemRoute();
    setGameSystem(undefined);
  };

  if (!gameSystem) return <GameSystemGateway onSelect={selectSystem} />;
  if (gameSystem === "coc-7e") return <CocAppShell onChangeSystem={changeSystem} />;
  return <DndAppShell onChangeSystem={changeSystem} />;
};
