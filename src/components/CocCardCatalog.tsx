import { useMemo } from "react";
import type { CocAppPage } from "../integration/dmForgeRoute";
import { buildCocCardCatalog } from "../utils/cocCardCatalogSources";
import { loadCatalogPrivateLibrary } from "../utils/cardCatalogPrivateLibrary";
import { CardCatalogWorkspace } from "./cardPlatform/CardCatalogWorkspace";

export const CocCardCatalog = ({
  onNavigate
}: {
  onNavigate(page: CocAppPage): void;
}) => {
  const loaded = useMemo(() => loadCatalogPrivateLibrary("coc-7e"), []);
  const catalog = useMemo(() => {
    const built = buildCocCardCatalog(loaded.archive);
    return loaded.issue
      ? { ...built, issues: [{ sourceId: "private" as const, message: loaded.issue }, ...built.issues] }
      : built;
  }, [loaded]);
  const actions = [
    { sourceId: "coc-procedures" as const, label: "Verified Procedures", onOpen: () => onNavigate("rules") },
    { sourceId: "coc-equipment" as const, label: "Equipment", onOpen: () => onNavigate("equipment") },
    { sourceId: "coc-rituals" as const, label: "Spells & Rituals", onOpen: () => onNavigate("spells") },
    { sourceId: "coc-creatures" as const, label: "Creatures & NPCs", onOpen: () => onNavigate("creatures") },
    { sourceId: "private" as const, label: "Private Library", onOpen: () => onNavigate("private-library") }
  ];
  return <CardCatalogWorkspace catalog={catalog} sourceActions={actions} />;
};
