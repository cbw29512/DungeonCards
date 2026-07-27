export const focusShellMainContent = (id: string): void => {
  if (typeof window === "undefined") return;
  window.requestAnimationFrame(() => {
    document.getElementById(id)?.focus({ preventScroll: true });
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });
};
