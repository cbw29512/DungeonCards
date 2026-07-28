import { useState } from "react";
import { useHomebrewCards } from "../../hooks/useHomebrewCards";
import { useHomebrewMonsters } from "../../hooks/useHomebrewMonsters";
import {
  parseDndPage,
  replaceDndRoute,
  type DndAppPage
} from "../../integration/dmForgeRoute";
import { focusShellMainContent } from "../../utils/focusShellMainContent";
import { DndNavigation } from "./DndNavigation";
import { DndPageContent } from "./DndPageContent";
import { dndPageLabels } from "./dndPageRegistry";

const initialSearch = (): string => (
  typeof window === "undefined" ? "" : window.location.search
);

type Props = { onChangeSystem(): void };

export const DndAppShell = ({ onChangeSystem }: Props) => {
  const [activePage, setActivePage] = useState<DndAppPage>(() => parseDndPage(initialSearch()));
  const [navigationOpen, setNavigationOpen] = useState(false);
  const homebrew = useHomebrewCards();
  const monsters = useHomebrewMonsters();

  const navigate = (page: DndAppPage) => {
    setActivePage(page);
    setNavigationOpen(false);
    replaceDndRoute(page);
    focusShellMainContent("dnd-main-content");
  };

  const changeSystem = () => {
    setNavigationOpen(false);
    onChangeSystem();
  };

  return (
    <div className="application-shell application-shell--dnd">
      <a className="skip-link" href="#dnd-main-content">Skip to main content</a>
      <DndNavigation
        activePage={activePage}
        onChangePage={navigate}
        onChangeSystem={changeSystem}
        onToggle={() => setNavigationOpen((current) => !current)}
        open={navigationOpen}
      />
      <main id="dnd-main-content" tabIndex={-1}>
        {activePage !== "home" && <h1 className="sr-only">DM Forge {dndPageLabels[activePage]}</h1>}
        <DndPageContent
          activePage={activePage}
          homebrewCards={homebrew.cards}
          homebrewMonsters={monsters.monsters}
          homebrewStorageError={homebrew.storageError}
          migrationNotice={homebrew.migrationNotice}
          monsterStorageError={monsters.storageError}
          onCreateCard={homebrew.createCard}
          onCreateMonster={monsters.createMonster}
          onDeleteCard={homebrew.deleteCard}
          onDeleteMonster={monsters.deleteMonster}
        />
      </main>
    </div>
  );
};
