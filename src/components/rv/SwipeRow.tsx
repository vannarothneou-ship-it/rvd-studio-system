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

  const delOpacity = useTransform(x, [-ACTION_W, -24, 0], [1, 0.6, 0]);
  const delScale = useTransform(x, [-COMMIT_AT, -ACTION_W, 0], [1.25, 1, 0.7]);
  const editOpacity = useTransform(x, [0, 24, ACTION_W], [0, 0.6, 1]);

  const settle = (to: number) =>
    animate(x, to, { type: "spring", stiffness: 520, damping: 42 });

  const remove = () => {
    if (deletingRef.current) return;
    deletingRef.current = true;
    haptic(14);
    setGone(true);
    // let the collapse animation finish, then call the real delete
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => onDelete?.(), 220);
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
    if (onDelete && (cur < -COMMIT_AT || fling < -900)) {
      animate(x, -480, { duration: 0.18 });
      remove();
    } else if (onDelete && cur < -ACTION_W / 2) {
      settle(-ACTION_W);
    } else if (onEdit && cur > ACTION_W / 2) {
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
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
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
          className="absolute inset-y-0 left-0 grid place-items-center bg-primary text-primary-foreground"
        >
          <Pencil className="h-5 w-5" />
        </motion.button>
      ) : null}

      {/* Delete action (revealed by swiping left) */}
      {onDelete ? (
        <motion.button
          type="button"
          aria-label="Delete"
          style={{ opacity: delOpacity }}
          onClick={remove}
          className="absolute inset-y-0 right-0 flex w-full items-center justify-end bg-destructive pr-7 text-destructive-foreground"
        >
          <motion.span style={{ scale: delScale }}>
            <Trash2 className="h-5 w-5" />
          </motion.span>
        </motion.button>
      ) : null}

      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.55, right: onEdit ? 0.4 : 0 }}
        style={{ x, touchAction: "pan-y" }}
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
