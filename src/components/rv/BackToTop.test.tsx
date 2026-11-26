import { createRef } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BackToTop } from "./BackToTop";
import { scrollToTop } from "@/lib/scroll";

describe("BackToTop and scroll helpers", () => {
  const originalScrollY = window.scrollY;
  const originalMatchMedia = window.matchMedia;
  const originalRaf = window.requestAnimationFrame;

  beforeEach(() => {
    window.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    }) as typeof window.requestAnimationFrame;
    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: originalScrollY,
    });
    window.matchMedia = originalMatchMedia;
    window.requestAnimationFrame = originalRaf;
    vi.restoreAllMocks();
  });

  it("stays hidden under 600 px and appears once scrolled past threshold with 44 px target", () => {
    render(<BackToTop />);
    expect(screen.queryByRole("button", { name: "Back to top" })).toBeNull();

    act(() => {
      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 599,
      });
      fireEvent.scroll(window);
    });
    expect(screen.queryByRole("button", { name: "Back to top" })).toBeNull();

    act(() => {
      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 600,
      });
      fireEvent.scroll(window);
    });

    const btn = screen.getByRole("button", { name: "Back to top" });
    expect(btn).toBeInTheDocument();
    expect(btn.className).toContain("h-11");
    expect(btn.className).toContain("w-11");
    expect(btn.className).toContain("safe-area-inset-bottom");
  });

  it("uses smooth scroll normally and jumps with auto when prefers-reduced-motion is enabled", () => {
    const scrollSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});

    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });

    act(() => {
      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 750,
      });
      fireEvent.scroll(window);
    });

    render(<BackToTop />);
    fireEvent.click(screen.getByRole("button", { name: "Back to top" }));
    expect(scrollSpy).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });

    scrollSpy.mockClear();
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });

    scrollToTop();
    expect(scrollSpy).toHaveBeenCalledWith({ top: 0, behavior: "auto" });
  });

  it("monitors and scrolls an explicit inner scroll container when provided", () => {
    const ref = createRef<HTMLDivElement>();
    const scrollSpy = vi.fn();
    render(
      <div>
        <div ref={ref} data-testid="inner-scroller" />
        <BackToTop scrollContainerRef={ref} threshold={300} />
      </div>,
    );

    const el = screen.getByTestId("inner-scroller") as HTMLDivElement;
    el.scrollTo = scrollSpy;

    expect(screen.queryByRole("button", { name: "Back to top" })).toBeNull();

    act(() => {
      Object.defineProperty(el, "scrollTop", {
        writable: true,
        configurable: true,
        value: 320,
      });
      fireEvent.scroll(el);
    });

    const btn = screen.getByRole("button", { name: "Back to top" });
    fireEvent.click(btn);
    expect(scrollSpy).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });
});
