import { useState } from "react";
import { Download, PlusSquare, Share, Smartphone, X } from "lucide-react";
import { Btn } from "@/components/rv/ui";
import { useOnlineStatus, usePWAInstall } from "@/lib/usePWAInstall";
import { cn } from "@/lib/utils";

export function PWAInstallButton({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        aria-label="Install RothVan Ledger app"
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-secondary/80 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-accent",
          compact ? "h-9 px-2.5" : "px-3 py-2",
          className,
        )}
      >
        <Download className="h-3.5 w-3.5 shrink-0 text-primary" />
        <span className={compact ? "hidden" : "hidden xl:inline"}>Install</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          aria-label="Install on iPhone or iPad"
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-secondary/80 text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-accent",
            compact ? "h-9 px-2.5" : "px-3 py-2",
            className,
          )}
        >
          <Smartphone className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className={compact ? "text-[0.7rem]" : "hidden lg:inline"}>
            App
          </span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-label="Install on iPhone or iPad"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="glass-strong w-full max-w-sm rounded-3xl border border-border p-5 shadow-2xl"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/apple-touch-icon.png"
                    alt="RothVan Ledger"
                    className="h-11 w-11 rounded-2xl border border-primary/30 shadow-md"
                  />
                  <div>
                    <h3 className="font-display text-base font-bold">
                      Install RothVan Ledger
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Launch full-screen on iPhone &amp; iPad
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close install instructions"
                  className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <ol className="space-y-2.5 rounded-2xl border border-border/70 bg-muted/40 p-3.5 text-xs text-foreground">
                <li className="flex items-center gap-2.5">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                    <Share className="h-3.5 w-3.5" />
                  </span>
                  <span>
                    Tap the <strong>Share</strong> icon in Safari&apos;s
                    toolbar.
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                    <PlusSquare className="h-3.5 w-3.5" />
                  </span>
                  <span>
                    Scroll down and choose <strong>Add to Home Screen</strong>.
                  </span>
                </li>
              </ol>

              <p className="mt-3 text-[0.72rem] leading-relaxed text-muted-foreground">
                Running from the Home Screen removes Safari&apos;s URL bar and
                opens RothVan Ledger as an isolated standalone app window.
              </p>

              <div className="mt-4 flex justify-end">
                <Btn
                  type="button"
                  variant="gold"
                  onClick={() => setShowIOSGuide(false)}
                  className="w-full py-2 text-xs"
                >
                  Got it
                </Btn>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-3 z-50 flex items-center gap-2 rounded-full border border-primary/40 bg-background/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-lg backdrop-blur-md sm:bottom-4"
    >
      <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
      <span>Offline Mode — Cached workspace ready</span>
    </div>
  );
}
