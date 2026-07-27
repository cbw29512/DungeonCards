import type { CardCatalogFilters, CardCatalogSourceId } from "../../types/cardCatalog";
import type { CardFamily, CardReviewStatus } from "../../types/cardPlatform";

type Props = {
  filters: CardCatalogFilters;
  sources: CardCatalogSourceId[];
  families: CardFamily[];
  reviews: CardReviewStatus[];
  sourceLabels: Partial<Record<CardCatalogSourceId, string>>;
  onChange(filters: CardCatalogFilters): void;
};

export const CardCatalogControls = ({
  filters,
  sources,
  families,
  reviews,
  sourceLabels,
  onChange
}: Props) => {
  const patch = <K extends keyof CardCatalogFilters>(key: K, value: CardCatalogFilters[K]) => (
    onChange({ ...filters, [key]: value })
  );
  return (
    <div className="card-catalog__controls">
      <label>
        <span>Search cards</span>
        <input
          onChange={(event) => patch("query", event.target.value)}
          placeholder="Title, rule, tag, action, source…"
          type="search"
          value={filters.query}
        />
      </label>
      <label>
        <span>Source</span>
        <select onChange={(event) => patch("sourceId", event.target.value as CardCatalogFilters["sourceId"])} value={filters.sourceId}>
          <option value="all">All sources</option>
          {sources.map((source) => <option key={source} value={source}>{sourceLabels[source] ?? source.replaceAll("-", " ")}</option>)}
        </select>
      </label>
      <label>
        <span>Family</span>
        <select onChange={(event) => patch("family", event.target.value as CardCatalogFilters["family"])} value={filters.family}>
          <option value="all">All families</option>
          {families.map((family) => <option key={family} value={family}>{family.replaceAll("-", " ")}</option>)}
        </select>
      </label>
      <label>
        <span>Visibility</span>
        <select onChange={(event) => patch("visibility", event.target.value as CardCatalogFilters["visibility"])} value={filters.visibility}>
          <option value="all">All visibility</option>
          <option value="public">Public</option>
          <option value="player-safe">Player safe</option>
          <option value="game-master-only">GM/Keeper only</option>
          <option value="private">Private</option>
        </select>
      </label>
      <label>
        <span>Review</span>
        <select onChange={(event) => patch("review", event.target.value as CardCatalogFilters["review"])} value={filters.review}>
          <option value="all">All review states</option>
          {reviews.map((review) => <option key={review} value={review}>{review.replaceAll("-", " ")}</option>)}
        </select>
      </label>
      <label>
        <span>Sort</span>
        <select onChange={(event) => patch("sort", event.target.value as CardCatalogFilters["sort"])} value={filters.sort}>
          <option value="title">Title</option>
          <option value="family">Family</option>
          <option value="source">Source</option>
          <option value="review">Review state</option>
        </select>
      </label>
    </div>
  );
};
