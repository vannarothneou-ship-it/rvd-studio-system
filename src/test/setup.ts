import "@testing-library/jest-dom/vitest";
import * as rothvanSeed from "@/lib/rothvan-seed";
import { registerSeedModule } from "@/lib/store";

registerSeedModule(rothvanSeed);

Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: () => {},
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
