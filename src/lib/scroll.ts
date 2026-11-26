export function prefersReducedMotion(): boolean {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function getMainScrollTop(container?: HTMLElement | null): number {
  if (container) return container.scrollTop;
  if (typeof window === "undefined") return 0;
  return Math.max(
    window.scrollY || 0,
    document.scrollingElement?.scrollTop || 0,
    document.documentElement?.scrollTop || 0,
  );
}

export function scrollToTop(container?: HTMLElement | null): void {
  if (typeof window === "undefined") return;
  const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";
  if (container && typeof container.scrollTo === "function") {
    container.scrollTo({ top: 0, behavior });
    return;
  }
  if (typeof window.scrollTo === "function") {
    window.scrollTo({ top: 0, behavior });
  }
}
