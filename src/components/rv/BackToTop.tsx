import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUp } from "lucide-react";
import { useEffect, useState, type RefObject } from "react";
import { getMainScrollTop, scrollToTop } from "@/lib/scroll";
import { cn } from "@/lib/utils";

export function BackToTop({
  threshold = 600,
  scrollContainerRef,
  className,
}: {
  threshold?: number;
  scrollContainerRef?: RefObject<HTMLElement | null>;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const container = scrollContainerRef?.current ?? null;
    const target: Window | HTMLElement = container ?? window;
    let rafId = 0;
    let pending = false;

    const syncVisibility = () => {
      const top = getMainScrollTop(container);
      setVisible((prev) => {
        const next = top >= threshold;
        return prev === next ? prev : next;
      });
    };

    const onScroll = () => {
      if (pending) return;
      pending = true;
      if (typeof window.requestAnimationFrame === "function") {
        rafId = window.requestAnimationFrame(() => {
          pending = false;
          syncVisibility();
        });
      } else {
        pending = false;
        syncVisibility();
      }
    };

    syncVisibility();
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      target.removeEventListener("scroll", onScroll);
      if (rafId && typeof window.cancelAnimationFrame === "function") {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [scrollContainerRef, threshold]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="back-to-top"
          type="button"
          aria-label="Back to top"
          title="Back to top"
          onClick={() => scrollToTop(scrollContainerRef?.current ?? null)}
          initial={
            reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.92 }
          }
          animate={
            reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }
          }
          exit={
            reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.92 }
          }
          transition={
            reducedMotion
              ? { duration: 0 }
              : { duration: 0.2, ease: [0.32, 0.72, 0, 1] }
          }
          className={cn(
            "no-print ios-tap fixed right-3.5 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-30 grid h-11 w-11 place-items-center rounded-xl border border-[var(--glass-border)] bg-[var(--glass-strong)] text-foreground shadow-[0_10px_28px_-8px_oklch(0_0_0/48%),inset_0_1px_0_oklch(1_0_0/12%)] backdrop-blur-xl backdrop-saturate-150 hover:border-primary/50 hover:text-primary sm:right-6 sm:bottom-6",
            className,
          )}
        >
          <ArrowUp
            className="h-4.5 w-4.5"
            strokeWidth={2.2}
            aria-hidden="true"
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
