export type CardPrintSurface = "card-catalog" | "playable-deck";

const CLASSES: Record<CardPrintSurface, string> = {
  "card-catalog": "printing-card-catalog",
  "playable-deck": "printing-playable-deck"
};

export const printCardSurface = (surface: CardPrintSurface): void => {
  if (typeof window === "undefined") return;
  const classes = Object.values(CLASSES);
  document.body.classList.remove(...classes);
  document.body.classList.add(CLASSES[surface]);
  const cleanup = () => document.body.classList.remove(...classes);
  window.addEventListener("afterprint", cleanup, { once: true });
  window.print();
  window.setTimeout(cleanup, 2000);
};
