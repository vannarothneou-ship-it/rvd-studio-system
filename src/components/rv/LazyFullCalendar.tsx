import {
  lazy,
  Suspense,
  useEffect,
  useState,
  type ComponentProps,
} from "react";
import type FullCalendarType from "@fullcalendar/react";

const FullCalendarLazy = lazy(async () => {
  const [
    { default: FullCalendar },
    { default: dayGridPlugin },
    { default: interactionPlugin },
  ] = await Promise.all([
    import("@fullcalendar/react"),
    import("@fullcalendar/daygrid"),
    import("@fullcalendar/interaction"),
  ]);

  function CalendarAdapter(
    props: Omit<ComponentProps<typeof FullCalendarType>, "plugins">,
  ) {
    return (
      <FullCalendar plugins={[dayGridPlugin, interactionPlugin]} {...props} />
    );
  }

  return { default: CalendarAdapter };
});

export function useIsDesktopMd(): boolean {
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(min-width: 768px)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

export function LazyFullCalendar(
  props: Omit<ComponentProps<typeof FullCalendarType>, "plugins">,
) {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[340px] place-items-center rounded-2xl border border-border/60 bg-muted/20 text-xs text-muted-foreground">
          Loading calendar…
        </div>
      }
    >
      <FullCalendarLazy {...props} />
    </Suspense>
  );
}
