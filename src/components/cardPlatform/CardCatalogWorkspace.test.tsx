import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { publicArchiveCard } from "../../utils/cardPlatformArchiveFixtures";
import { buildCardCatalog } from "../../utils/cardCatalogBuild";
import { CARD_CATALOG_PAGE_SIZE } from "../../utils/cardCatalogQuery";
import { CardCatalogWorkspace } from "./CardCatalogWorkspace";

describe("Card Catalog workspace", () => {
  it("renders source health, metadata, private distinction, and one bounded page", () => {
    const definitions = Array.from({ length: 40 }, (_, index) => ({
      ...publicArchiveCard,
      id: `catalog:render:${index}`,
      content: { ...publicArchiveCard.content, title: `Rendered Card ${index}` }
    }));
    const catalog = buildCardCatalog("dnd-2024", [
      { id: "rules", label: "Built-in Rules", definitions: definitions.slice(0, 39), issues: ["One generated rule was excluded."] },
      { id: "private", label: "Imported Private", definitions: definitions.slice(39), privateImported: true }
    ]);
    const html = renderToStaticMarkup(
      <CardCatalogWorkspace
        catalog={catalog}
        sourceActions={[
          { sourceId: "rules", label: "Built-in Rules" },
          { sourceId: "private", label: "Imported Private" }
        ]}
      />
    );
    expect(html).toContain("D&amp;D 2024");
    expect(html).toContain("source-health warning");
    expect(html).toContain("Private import");
    expect(html).toContain(`Showing ${CARD_CATALOG_PAGE_SIZE} of 40 matching cards`);
    expect((html.match(/class="card-platform-card"/g) ?? []).length).toBe(CARD_CATALOG_PAGE_SIZE);
    expect(html).toContain("Print current page");
    expect(html).toContain("Page 1 of 2");
  });
});
