import { useState } from "react";
import {
  parseCocPage,
  replaceCocRoute,
  type CocAppPage
} from "../../integration/dmForgeRoute";
import { focusShellMainContent } from "../../utils/focusShellMainContent";
import { CocNavigation } from "./CocNavigation";
import { CocPageContent } from "./CocPageContent";

const initialSearch = (): string => (
  typeof window === "undefined" ? "" : window.location.search
);

type Props = { onChangeSystem(): void };

export const CocAppShell = ({ onChangeSystem }: Props) => {
  const [activePage, setActivePage] = useState<CocAppPage>(() => parseCocPage(initialSearch()));
  const [navigationOpen, setNavigationOpen] = useState(false);

  const navigate = (page: CocAppPage) => {
    setActivePage(page);
    setNavigationOpen(false);
    replaceCocRoute(page);
    focusShellMainContent("coc-main-content");
  };

  const changeSystem = () => {
    setNavigationOpen(false);
    onChangeSystem();
  };

  return (
    <div className="coc-app">
      <a className="skip-link skip-link--coc" href="#coc-main-content">Skip to main content</a>
      <div className="coc-app__grain" aria-hidden="true" />
      <CocNavigation
        activePage={activePage}
        onChangePage={navigate}
        onChangeSystem={changeSystem}
        onToggle={() => setNavigationOpen((current) => !current)}
        open={navigationOpen}
      />
      <main id="coc-main-content" tabIndex={-1}>
        <CocPageContent activePage={activePage} />
        <footer className="coc-footer">
          <strong>Unofficial, noncommercial fan toolkit.</strong>
          <span>Call of Cthulhu is a trademark of Chaosium Inc. Original summaries and demonstration content only; paid rulebook text, official scenarios, logos, artwork, and proprietary statistics are not reproduced.</span>
        </footer>
      </main>
    </div>
  );
};
