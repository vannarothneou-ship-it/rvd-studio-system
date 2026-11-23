import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "motion/react";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { RowMenu } from "@/components/rv/RowMenu";

const ACTION_W = 88;
const COMMIT_AT = 168;

function haptic(ms = 8) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* iOS Safari has no vibrate – ignore */
  }
}

/**
 * iOS-style swipe row.
 * - swipe left  → reveals red Delete (swipe far = delete immediately)
 * - swipe right → reveals Edit
 * - long-press / right-click → opens RowMenu
 * - tap while open closes it; tap while closed calls onTap
 * The row is marked data-no-swipe so the page-level tab swipe never fires.
 */
export function SwipeRow({
  children,
  onDelete,
  onEdit,
  onTap,
  className,
}: {
  children: ReactNode;
  onDelete?: (() => void) | undefined;
  onEdit?: (() => void) | undefined;
  onTap?: (() => void) | undefined;
  className?: string | undefined;
}) {
  const x = useMotionValue(0);
  const [gone, setGone] = useState(false);
  const dragged = useRef(false);
  const crossed = useRef(false);
  const deletingRef = useRef(false);
  const timerRef = useRef<number | undefined>(undefined);
  const dragTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      window.clearTimeout(timerRef.current);
      window.clearTimeout(dragTimerRef.current);
    };
  }, []);

  const delOpacity = useTransform(x, [-ACTION_W, -20, 0], [1, 0.72, 0]);
  const delScale = useTransform(x, [-COMMIT_AT, -ACTION_W, 0], [1.18, 1, 0.78]);
  const editOpacity = useTransform(x, [0, 20, ACTION_W], [0, 0.72, 1]);
  const editScale = useTransform(
    x,
    [0, ACTION_W, ACTION_W + 40],
    [0.78, 1, 1.08],
  );

  const settle = (to: number) =>
    animate(x, to, { type: "spring", stiffness: 580, damping: 42, mass: 0.85 });

  const remove = () => {
    if (deletingRef.current) return;
    deletingRef.current = true;
    haptic(14);
    setGone(true);
    // let the collapse animation finish, then call the real delete
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => onDelete?.(), 200);
  };

  const onDrag = () => {
    dragged.current = true;
    const past = x.get() < -COMMIT_AT;
    if (past !== crossed.current) {
      crossed.current = past;
      haptic(6);
    }
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const cur = x.get();
    const fling = info.velocity.x;
    crossed.current = false;
    if (onDelete && (cur < -COMMIT_AT || fling < -850)) {
      animate(x, -480, { duration: 0.16, ease: [0.32, 0.72, 0, 1] });
      remove();
    } else if (onDelete && (cur < -ACTION_W / 2 || fling < -320)) {
      settle(-ACTION_W);
    } else if (onEdit && (cur > ACTION_W / 2 || fling > 320)) {
      settle(ACTION_W);
    } else {
      settle(0);
    }
    window.clearTimeout(dragTimerRef.current);
    dragTimerRef.current = window.setTimeout(() => {
      dragged.current = false;
    }, 0);
  };

  return (
    <motion.div
      data-no-swipe
      initial={false}
      animate={
        gone ? { height: 0, opacity: 0 } : { height: "auto", opacity: 1 }
      }
      transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
      className={cn("relative overflow-hidden rounded-xl", className)}
    >
      {/* Edit action (revealed by swiping right) */}
      {onEdit ? (
        <motion.button
          type="button"
          aria-label="Edit"
          style={{ opacity: editOpacity, width: ACTION_W }}
          onClick={() => {
            settle(0);
            onEdit();
          }}
          className="absolute inset-y-0 left-0 flex flex-col items-center justify-center gap-0.5 bg-primary text-primary-foreground"
        >
          <motion.span
            style={{ scale: editScale }}
            className="flex flex-col items-center gap-0.5"
          >
            <Pencil className="h-4 w-4" />
            <span className="text-[0.62rem] font-semibold tracking-tight">
              Edit
            </span>
          </motion.span>
        </motion.button>
      ) : null}

      {/* Delete action (revealed by swiping left) */}
      {onDelete ? (
        <motion.button
          type="button"
          aria-label="Delete"
          style={{ opacity: delOpacity }}
          onClick={remove}
          className="absolute inset-y-0 right-0 flex w-full items-center justify-end bg-destructive pr-5 text-destructive-foreground"
        >
          <motion.span
            style={{ scale: delScale }}
            className="flex w-12 flex-col items-center gap-0.5"
          >
            <Trash2 className="h-4 w-4" />
            <span className="text-[0.62rem] font-semibold tracking-tight">
              Delete
            </span>
          </motion.span>
        </motion.button>
      ) : null}

      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.52, right: onEdit ? 0.38 : 0 }}
        style={{ x, touchAction: "pan-y" }}
        whileTap={{ scale: 0.988 }}
        transition={{ type: "spring", stiffness: 600, damping: 38 }}
        onDrag={onDrag}
        onDragEnd={onDragEnd}
        onClickCapture={(e) => {
          if (dragged.current) {
            e.stopPropagation();
            e.preventDefault();
            return;
          }
          if (Math.abs(x.get()) > 4) {
            e.stopPropagation();
            e.preventDefault();
            settle(0);
          }
        }}
        onClick={onTap}
        className="relative rounded-xl bg-card"
      >
        <RowMenu onEdit={onEdit} onDelete={onDelete ? remove : undefined}>
          {children}
        </RowMenu>
      </motion.div>
    </motion.div>
  );
}
