import type { CocAppPage } from "../../integration/dmForgeRoute";
import { cocNavigationPages, cocPageLabels } from "./cocPageRegistry";

type Props = {
  activePage: CocAppPage;
  open: boolean;
  onChangePage(page: CocAppPage): void;
  onChangeSystem(): void;
  onToggle(): void;
};

export const CocNavigation = ({
  activePage,
  open,
  onChangePage,
  onChangeSystem,
  onToggle
}: Props) => (
  <nav className="coc-nav" aria-label="Cthulhu Keeper toolkit navigation">
    <button className="coc-nav__brand" type="button" onClick={() => onChangePage("home")}>
      <span aria-hidden="true">◉</span><strong>DM Forge</strong><small>Cthulhu Keeper tools</small>
    </button>
    <small className="coc-nav__current">{cocPageLabels[activePage]}</small>
    <button
      aria-controls="coc-primary-navigation"
      aria-expanded={open}
      aria-label={open ? "Close navigation" : "Open navigation"}
      className="navigation-toggle navigation-toggle--coc"
      onClick={onToggle}
      type="button"
    >
      <span aria-hidden="true" />
      <span aria-hidden="true" />
      <span aria-hidden="true" />
    </button>
    <div className={`coc-nav__links${open ? " is-open" : ""}`} id="coc-primary-navigation">
      {cocNavigationPages.map((page) => (
        <button
          aria-pressed={activePage === page}
          key={page}
          onClick={() => onChangePage(page)}
          type="button"
        >
          {cocPageLabels[page]}
        </button>
      ))}
      <button className="coc-nav__switch" type="button" onClick={onChangeSystem}>Switch system</button>
    </div>
  </nav>
);
