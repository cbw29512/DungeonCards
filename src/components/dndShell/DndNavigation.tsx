import { DM_FORGE_HOME, type DndAppPage } from "../../integration/dmForgeRoute";
import {
  dndNavigationLabels,
  dndNavigationPages,
  dndPageLabels
} from "./dndPageRegistry";

type Props = {
  activePage: DndAppPage;
  open: boolean;
  onChangePage(page: DndAppPage): void;
  onChangeSystem(): void;
  onToggle(): void;
};

export const DndNavigation = ({
  activePage,
  open,
  onChangePage,
  onChangeSystem,
  onToggle
}: Props) => (
  <nav className="top-nav" aria-label="Primary navigation">
    <div className="product-lockup">
      <a className="dm-forge-return" href={DM_FORGE_HOME}>DM Forge</a>
      <span>Rules Compendium &amp; Roll Cards</span>
      <small className="top-nav__current">{dndPageLabels[activePage]}</small>
    </div>
    <button
      aria-controls="dnd-primary-navigation"
      aria-expanded={open}
      aria-label={open ? "Close navigation" : "Open navigation"}
      className="navigation-toggle"
      onClick={onToggle}
      type="button"
    >
      <span aria-hidden="true" />
      <span aria-hidden="true" />
      <span aria-hidden="true" />
    </button>
    <div className={`top-nav__actions${open ? " is-open" : ""}`} id="dnd-primary-navigation">
      {dndNavigationPages.map((page) => (
        <button
          aria-pressed={activePage === page}
          key={page}
          onClick={() => onChangePage(page)}
          type="button"
        >
          {dndNavigationLabels[page]}
        </button>
      ))}
      <button type="button" onClick={onChangeSystem}>Other Systems</button>
    </div>
  </nav>
);
