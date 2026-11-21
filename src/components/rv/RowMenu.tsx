import type { ReactNode } from "react";
import * as CM from "@radix-ui/react-context-menu";
import { Pencil, Trash2 } from "lucide-react";

/**
 * Press-and-hold (touch) or right-click (desktop) menu for list rows.
 * Radix portals it to <body>, so it is never clipped by cards or scroll areas.
 */
export function RowMenu({
  children,
  onEdit,
  onDelete,
}: {
  children: ReactNode;
  onEdit?: (() => void) | undefined;
  onDelete?: (() => void) | undefined;
}) {
  if (!onEdit && !onDelete) return <>{children}</>;
  const item =
    "flex min-h-[44px] cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 text-sm outline-none data-[highlighted]:bg-accent sm:min-h-[36px]";
  return (
    <CM.Root>
      <CM.Trigger asChild>
        <div className="[-webkit-touch-callout:none]">{children}</div>
      </CM.Trigger>
      <CM.Portal>
        <CM.Content className="z-[200] min-w-44 rounded-2xl border border-[var(--glass-border)] bg-popover p-1.5 text-popover-foreground shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
          {onEdit ? (
            <CM.Item className={item} onSelect={onEdit}>
              <Pencil className="h-4 w-4 text-primary" />
              Edit
            </CM.Item>
          ) : null}
          {onDelete ? (
            <CM.Item className={`${item} text-destructive`} onSelect={onDelete}>
              <Trash2 className="h-4 w-4" />
              Delete
            </CM.Item>
          ) : null}
        </CM.Content>
      </CM.Portal>
    </CM.Root>
  );
}
