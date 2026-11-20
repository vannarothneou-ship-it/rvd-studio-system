import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { ArrowDownLeft, ArrowUpRight, Sparkles, Wallet } from "lucide-react";
import { categoryIcon } from "@/components/rv/FinanceVisuals";
import {
  shortFlowLabel,
  type MoneyFlowBucket,
  type MoneyFlowRange,
  type MoneyFlowTimelinePoint,
} from "@/lib/money-flow";
import type { Account } from "@/lib/store";
import { cn } from "@/lib/utils";

export interface D3PieDatum {
  id: string;
  label: string;
  value: number;
  color: string;
  account?: Account | null | undefined;
  category?: string | null | undefined;
}

interface TooltipState {
  x: number;
  y: number;
  title: string;
  primary: string;
  secondary?: string | undefined;
  tertiary?: string | undefined;
  color: string;
  category?: string | null | undefined;
}

const CHART_W = 640;
const CHART_H = 340;

export function D3MoneyFlowChart({
  chartType,
  range,
  pieData,
  buckets,
  timelinePoints,
  hasIncome,
  totalSpend,
  formatMoney,
  formatCompact,
  onSelectCategory,
  onHoverId,
}: {
  chartType: "pie" | "bar" | "line";
  range: MoneyFlowRange;
  pieData: D3PieDatum[];
  buckets: MoneyFlowBucket[];
  timelinePoints: MoneyFlowTimelinePoint[];
  hasIncome: boolean;
  totalSpend: number;
  formatMoney: (n: number) => string;
  formatCompact: (n: number) => string;
  onSelectCategory?: ((account: Account, category: string) => void) | undefined;
  onHoverId?: ((id: string | null) => void) | undefined;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const prevArcsRef = useRef<Map<string, d3.PieArcDatum<D3PieDatum>>>(
    new Map(),
  );

  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [activeSliceId, setActiveSliceId] = useState<string | null>(null);

  const normalizedPieData = useMemo<D3PieDatum[]>(() => {
    if (pieData.length > 0) return pieData;
    return buckets.map((b) => ({
      id: b.id,
      label: b.label,
      value: b.amount,
      color: b.color,
    }));
  }, [pieData, buckets]);

  const activeSlice = useMemo(
    () => normalizedPieData.find((d) => d.id === activeSliceId) ?? null,
    [normalizedPieData, activeSliceId],
  );

  useEffect(() => {
    setTooltip(null);
    setActiveSliceId(null);
  }, [chartType, range]);

  const updateTooltipPosition = (
    clientX: number,
    clientY: number,
    next: Omit<TooltipState, "x" | "y">,
  ) => {
    const box = containerRef.current?.getBoundingClientRect();
    if (!box) return;
    const relX = Math.max(76, Math.min(box.width - 76, clientX - box.left));
    const relY = Math.max(44, Math.min(box.height - 20, clientY - box.top));
    setTooltip({ ...next, x: relX, y: relY });
  };

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();

    const defs = svg.append("defs");

    if (chartType === "pie") {
      const cx = CHART_W / 2;
      const cy = CHART_H / 2;
      const outerR = Math.min(CHART_W, CHART_H) * 0.41;
      const innerR = outerR * 0.6;

      const root = svg.append("g").attr("transform", `translate(${cx}, ${cy})`);

      // Subtle ambient guide rings
      root
        .append("circle")
        .attr("r", outerR + 10)
        .attr("fill", "none")
        .attr("stroke", "var(--border)")
        .attr("stroke-opacity", 0.35)
        .attr("stroke-dasharray", "3 5");

      root
        .append("circle")
        .attr("r", innerR - 6)
        .attr("fill", "var(--muted)")
        .attr("fill-opacity", 0.25);

      const pieGen = d3
        .pie<D3PieDatum>()
        .value((d) => Math.max(0.001, d.value))
        .sort(null)
        .padAngle(0.032);

      const arcGen = d3
        .arc<d3.PieArcDatum<D3PieDatum>>()
        .innerRadius(innerR)
        .outerRadius(outerR)
        .cornerRadius(9);

      const hoverArcGen = d3
        .arc<d3.PieArcDatum<D3PieDatum>>()
        .innerRadius(innerR - 2)
        .outerRadius(outerR + 9)
        .cornerRadius(10);

      const pieTotal =
        normalizedPieData.reduce((s, d) => s + d.value, 0) || totalSpend || 1;
      const arcsData = pieGen(normalizedPieData);

      const sliceGroups = root
        .selectAll<SVGGElement, d3.PieArcDatum<D3PieDatum>>("g.pie-slice")
        .data(arcsData, (d) => d.data.id)
        .join("g")
        .attr("class", "pie-slice cursor-pointer");

      const paths = sliceGroups
        .append("path")
        .attr("fill", (d) => d.data.color)
        .attr("stroke", "var(--card)")
        .attr("stroke-width", 2);

      paths
        .transition()
        .duration(440)
        .ease(d3.easeCubicOut)
        .attrTween("d", function (d) {
          const prev = prevArcsRef.current.get(d.data.id) ?? {
            ...d,
            startAngle: d.startAngle,
            endAngle: d.startAngle,
          };
          const interp = d3.interpolate(prev, d);
          prevArcsRef.current.set(d.data.id, d);
          return (t) => arcGen(interp(t)) ?? "";
        });

      // Percentage tags on outer perimeter for significant slices (>= 7%)
      const labelArc = d3
        .arc<d3.PieArcDatum<D3PieDatum>>()
        .innerRadius(outerR + 22)
        .outerRadius(outerR + 22);

      sliceGroups
        .filter((d) => d.data.value / pieTotal >= 0.07)
        .append("text")
        .attr("transform", (d) => `translate(${labelArc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill", "var(--foreground)")
        .attr("font-size", 11.5)
        .attr("font-weight", 700)
        .attr("class", "font-num pointer-events-none select-none")
        .style("opacity", 0)
        .text((d) => `${Math.round((d.data.value / pieTotal) * 100)}%`)
        .transition()
        .delay(180)
        .duration(240)
        .style("opacity", 0.9);

      sliceGroups
        .on("mouseenter", function (event: MouseEvent, d) {
          d3.select(this)
            .select("path")
            .transition()
            .duration(160)
            .ease(d3.easeCubicOut)
            .attr("d", hoverArcGen(d) ?? "");
          setActiveSliceId(d.data.id);
          onHoverId?.(d.data.id);
          const pct = Math.round((d.data.value / pieTotal) * 100);
          updateTooltipPosition(event.clientX, event.clientY, {
            title: shortFlowLabel(d.data.label),
            primary: formatMoney(d.data.value),
            secondary: `${pct}% of spending`,
            color: d.data.color,
            category: d.data.category,
          });
        })
        .on("mousemove", function (event: MouseEvent, d) {
          const pct = Math.round((d.data.value / pieTotal) * 100);
          updateTooltipPosition(event.clientX, event.clientY, {
            title: shortFlowLabel(d.data.label),
            primary: formatMoney(d.data.value),
            secondary: `${pct}% of spending`,
            color: d.data.color,
            category: d.data.category,
          });
        })
        .on("mouseleave", function (_event: MouseEvent, d) {
          d3.select(this)
            .select("path")
            .transition()
            .duration(180)
            .ease(d3.easeCubicOut)
            .attr("d", arcGen(d) ?? "");
          setActiveSliceId(null);
          onHoverId?.(null);
          setTooltip(null);
        })
        .on("click", (_event: MouseEvent, d) => {
          if (d.data.account && d.data.category && onSelectCategory) {
            onSelectCategory(d.data.account, d.data.category);
          }
        });

      return;
    }

    // Shared Cartesian frame for Bar & Line D3 visuals
    const margin = { top: 20, right: 18, bottom: 34, left: 48 };
    const innerW = CHART_W - margin.left - margin.right;
    const innerH = CHART_H - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const maxVal = Math.max(
      10,
      d3.max(timelinePoints, (d) =>
        Math.max(hasIncome ? d.income : 0, d.spend),
      ) ?? 10,
    );
    const yScale = d3
      .scaleLinear()
      .domain([0, maxVal * 1.15])
      .nice()
      .range([innerH, 0]);

    // Horizontal dashed gridlines + minimal Y labels
    const yTicks = yScale.ticks(4);
    g.selectAll("line.grid-y")
      .data(yTicks)
      .join("line")
      .attr("class", "grid-y")
      .attr("x1", 0)
      .attr("x2", innerW)
      .attr("y1", (t) => yScale(t))
      .attr("y2", (t) => yScale(t))
      .attr("stroke", "var(--border)")
      .attr("stroke-dasharray", "3 5")
      .attr("stroke-opacity", 0.55);

    g.selectAll("text.y-tick")
      .data(yTicks)
      .join("text")
      .attr("class", "y-tick font-num")
      .attr("x", -8)
      .attr("y", (t) => yScale(t))
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("fill", "var(--muted-foreground)")
      .attr("font-size", 10.5)
      .text((t) => (t === 0 ? "$0" : formatCompact(t)));

    // Gradient definitions
    const spendGrad = defs
      .append("linearGradient")
      .attr("id", "d3-mf-spend-grad")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    spendGrad
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "var(--primary)")
      .attr("stop-opacity", chartType === "line" ? 0.36 : 0.95);
    spendGrad
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "var(--primary)")
      .attr("stop-opacity", chartType === "line" ? 0.02 : 0.45);

    const incGrad = defs
      .append("linearGradient")
      .attr("id", "d3-mf-inc-grad")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    incGrad
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "var(--positive)")
      .attr("stop-opacity", chartType === "line" ? 0.3 : 0.95);
    incGrad
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "var(--positive)")
      .attr("stop-opacity", chartType === "line" ? 0.02 : 0.45);

    const tickStep =
      timelinePoints.length > 16
        ? Math.ceil(timelinePoints.length / 7)
        : timelinePoints.length > 9
          ? 2
          : 1;

    if (chartType === "bar") {
      const xScale = d3
        .scaleBand<string>()
        .domain(timelinePoints.map((d) => d.key))
        .range([0, innerW])
        .padding(0.28);

      // X axis ticks (concise spacing, no overlap)
      g.selectAll("text.x-tick")
        .data(timelinePoints.filter((_, i) => i % tickStep === 0))
        .join("text")
        .attr("class", "x-tick font-num")
        .attr("x", (d) => (xScale(d.key) ?? 0) + xScale.bandwidth() / 2)
        .attr("y", innerH + 20)
        .attr("text-anchor", "middle")
        .attr("fill", "var(--muted-foreground)")
        .attr("font-size", 10.5)
        .text((d) => d.label);

      const bandW = xScale.bandwidth();
      const singleW = hasIncome
        ? Math.max(4, Math.min(20, bandW * 0.44))
        : Math.max(6, Math.min(28, bandW * 0.68));

      // Income bars (when income present)
      if (hasIncome) {
        g.selectAll("rect.bar-in")
          .data(timelinePoints, (d) => (d as MoneyFlowTimelinePoint).key)
          .join("rect")
          .attr("class", "bar-in")
          .attr("x", (d) => (xScale(d.key) ?? 0) + bandW / 2 - singleW - 1.5)
          .attr("width", singleW)
          .attr("rx", Math.min(5, singleW / 2))
          .attr("y", innerH)
          .attr("height", 0)
          .attr("fill", "url(#d3-mf-inc-grad)")
          .transition()
          .duration(420)
          .ease(d3.easeCubicOut)
          .attr("y", (d) => yScale(d.income))
          .attr("height", (d) => Math.max(0, innerH - yScale(d.income)));
      }

      // Spend bars
      g.selectAll("rect.bar-out")
        .data(timelinePoints, (d) => (d as MoneyFlowTimelinePoint).key)
        .join("rect")
        .attr("class", "bar-out")
        .attr("x", (d) =>
          hasIncome
            ? (xScale(d.key) ?? 0) + bandW / 2 + 1.5
            : (xScale(d.key) ?? 0) + (bandW - singleW) / 2,
        )
        .attr("width", singleW)
        .attr("rx", Math.min(6, singleW / 2))
        .attr("y", innerH)
        .attr("height", 0)
        .attr("fill", "url(#d3-mf-spend-grad)")
        .transition()
        .duration(440)
        .ease(d3.easeCubicOut)
        .attr("y", (d) => yScale(d.spend))
        .attr("height", (d) => Math.max(0, innerH - yScale(d.spend)));

      // Interactive hover hit targets
      const hoverBand = g
        .append("rect")
        .attr("y", 0)
        .attr("height", innerH)
        .attr("width", Math.max(10, bandW))
        .attr("rx", 8)
        .attr("fill", "var(--foreground)")
        .attr("fill-opacity", 0)
        .style("pointer-events", "none");

      g.selectAll("rect.hit-col")
        .data(timelinePoints)
        .join("rect")
        .attr("class", "hit-col cursor-pointer")
        .attr("x", (d) => xScale(d.key) ?? 0)
        .attr("y", 0)
        .attr("width", bandW)
        .attr("height", innerH)
        .attr("fill", "transparent")
        .on("mouseenter mousemove click", (event: MouseEvent, d) => {
          hoverBand.attr("x", xScale(d.key) ?? 0).attr("fill-opacity", 0.06);
          updateTooltipPosition(event.clientX, event.clientY, {
            title: d.fullDate,
            primary: `Out ${formatMoney(d.spend)}`,
            secondary: hasIncome ? `In ${formatMoney(d.income)}` : undefined,
            tertiary: hasIncome ? `Net ${formatMoney(d.net)}` : undefined,
            color: "var(--primary)",
          });
        })
        .on("mouseleave", () => {
          hoverBand.attr("fill-opacity", 0);
          setTooltip(null);
        });

      return;
    }

    // D3 Smooth Line & Area visual
    const xPoint = d3
      .scalePoint<string>()
      .domain(timelinePoints.map((d) => d.key))
      .range([8, innerW - 8])
      .padding(0.2);

    g.selectAll("text.x-tick")
      .data(timelinePoints.filter((_, i) => i % tickStep === 0))
      .join("text")
      .attr("class", "x-tick font-num")
      .attr("x", (d) => xPoint(d.key) ?? 0)
      .attr("y", innerH + 20)
      .attr("text-anchor", "middle")
      .attr("fill", "var(--muted-foreground)")
      .attr("font-size", 10.5)
      .text((d) => d.label);

    const spendArea = d3
      .area<MoneyFlowTimelinePoint>()
      .x((d) => xPoint(d.key) ?? 0)
      .y0(innerH)
      .y1((d) => yScale(d.spend))
      .curve(d3.curveMonotoneX);

    const spendLine = d3
      .line<MoneyFlowTimelinePoint>()
      .x((d) => xPoint(d.key) ?? 0)
      .y((d) => yScale(d.spend))
      .curve(d3.curveMonotoneX);

    if (hasIncome) {
      const incArea = d3
        .area<MoneyFlowTimelinePoint>()
        .x((d) => xPoint(d.key) ?? 0)
        .y0(innerH)
        .y1((d) => yScale(d.income))
        .curve(d3.curveMonotoneX);

      const incLine = d3
        .line<MoneyFlowTimelinePoint>()
        .x((d) => xPoint(d.key) ?? 0)
        .y((d) => yScale(d.income))
        .curve(d3.curveMonotoneX);

      g.append("path")
        .datum(timelinePoints)
        .attr("d", incArea)
        .attr("fill", "url(#d3-mf-inc-grad)")
        .style("opacity", 0)
        .transition()
        .duration(400)
        .style("opacity", 1);

      const incPath = g
        .append("path")
        .datum(timelinePoints)
        .attr("d", incLine)
        .attr("fill", "none")
        .attr("stroke", "var(--positive)")
        .attr("stroke-width", 2.2)
        .attr("stroke-linecap", "round");

      const incLen = incPath.node()?.getTotalLength() ?? 0;
      if (incLen > 0) {
        incPath
          .attr("stroke-dasharray", `${incLen} ${incLen}`)
          .attr("stroke-dashoffset", incLen)
          .transition()
          .duration(520)
          .ease(d3.easeCubicOut)
          .attr("stroke-dashoffset", 0);
      }
    }

    g.append("path")
      .datum(timelinePoints)
      .attr("d", spendArea)
      .attr("fill", "url(#d3-mf-spend-grad)")
      .style("opacity", 0)
      .transition()
      .duration(420)
      .style("opacity", 1);

    const spendPath = g
      .append("path")
      .datum(timelinePoints)
      .attr("d", spendLine)
      .attr("fill", "none")
      .attr("stroke", "var(--primary)")
      .attr("stroke-width", 2.6)
      .attr("stroke-linecap", "round");

    const totalLen = spendPath.node()?.getTotalLength() ?? 0;
    if (totalLen > 0) {
      spendPath
        .attr("stroke-dasharray", `${totalLen} ${totalLen}`)
        .attr("stroke-dashoffset", totalLen)
        .transition()
        .duration(540)
        .ease(d3.easeCubicOut)
        .attr("stroke-dashoffset", 0);
    }

    // Subtle vertex dots for compact ranges
    if (timelinePoints.length <= 16) {
      g.selectAll("circle.pt-out")
        .data(timelinePoints)
        .join("circle")
        .attr("class", "pt-out pointer-events-none")
        .attr("cx", (d) => xPoint(d.key) ?? 0)
        .attr("cy", (d) => yScale(d.spend))
        .attr("r", 3.2)
        .attr("fill", "var(--background)")
        .attr("stroke", "var(--primary)")
        .attr("stroke-width", 2);
    }

    // Crosshair & Active focus dot
    const crosshair = g
      .append("line")
      .attr("y1", 0)
      .attr("y2", innerH)
      .attr("stroke", "var(--primary)")
      .attr("stroke-opacity", 0)
      .attr("stroke-dasharray", "3 3")
      .style("pointer-events", "none");

    const focusDot = g
      .append("circle")
      .attr("r", 5.5)
      .attr("fill", "var(--primary)")
      .attr("stroke", "var(--background)")
      .attr("stroke-width", 2.5)
      .style("opacity", 0)
      .style("pointer-events", "none");

    const stepW = Math.max(14, innerW / Math.max(1, timelinePoints.length - 1));
    g.selectAll("rect.line-hit")
      .data(timelinePoints)
      .join("rect")
      .attr("class", "line-hit cursor-pointer")
      .attr("x", (d) => (xPoint(d.key) ?? 0) - stepW / 2)
      .attr("y", 0)
      .attr("width", stepW)
      .attr("height", innerH)
      .attr("fill", "transparent")
      .on("mouseenter mousemove click", (event: MouseEvent, d) => {
        const px = xPoint(d.key) ?? 0;
        const py = yScale(d.spend);
        crosshair.attr("x1", px).attr("x2", px).attr("stroke-opacity", 0.55);
        focusDot.attr("cx", px).attr("cy", py).style("opacity", 1);
        updateTooltipPosition(event.clientX, event.clientY, {
          title: d.fullDate,
          primary: `Out ${formatMoney(d.spend)}`,
          secondary: hasIncome ? `In ${formatMoney(d.income)}` : undefined,
          tertiary: hasIncome ? `Net ${formatMoney(d.net)}` : undefined,
          color: "var(--primary)",
        });
      })
      .on("mouseleave", () => {
        crosshair.attr("stroke-opacity", 0);
        focusDot.style("opacity", 0);
        setTooltip(null);
      });
  }, [
    chartType,
    range,
    normalizedPieData,
    timelinePoints,
    hasIncome,
    totalSpend,
    formatMoney,
    formatCompact,
    onHoverId,
    onSelectCategory,
  ]);

  const ActiveCenterIcon = activeSlice?.category
    ? categoryIcon(activeSlice.category)
    : Wallet;
  const TooltipCatIcon = tooltip?.category
    ? categoryIcon(tooltip.category)
    : Sparkles;

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-xl border border-[var(--glass-border)] bg-muted/35 p-2 backdrop-blur-md sm:p-3"
      >
        {/* Center Overlay inside D3 Donut for clean icon + figure readout */}
        {chartType === "pie" && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-card text-primary border border-border">
              <ActiveCenterIcon
                className="h-4 w-4"
                style={activeSlice ? { color: activeSlice.color } : undefined}
              />
            </span>
            <p className="font-num mt-1 text-base font-bold tracking-tight text-foreground sm:text-lg">
              {activeSlice
                ? formatCompact(activeSlice.value)
                : formatCompact(totalSpend)}
            </p>
            <p className="max-w-[110px] truncate text-[0.68rem] font-medium text-muted-foreground">
              {activeSlice ? shortFlowLabel(activeSlice.label) : "Total out"}
            </p>
          </div>
        )}

        <svg
          ref={svgRef}
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          className="h-[250px] w-full select-none sm:h-[330px]"
          role="img"
          aria-label={`D3 ${chartType} finance chart`}
        />

        {/* Floating Intuitive Tooltip */}
        {tooltip && (
          <div
            style={{ left: tooltip.x, top: tooltip.y }}
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[112%] rounded-xl border border-[var(--glass-border)] bg-popover px-3 py-2 text-xs shadow-xl backdrop-blur-2xl backdrop-saturate-150 transition-[left,top] duration-75"
          >
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <TooltipCatIcon
                className="h-3.5 w-3.5 shrink-0"
                style={{ color: tooltip.color }}
              />
              <span className="whitespace-nowrap">{tooltip.title}</span>
            </div>
            <p className="font-num mt-0.5 flex items-center gap-1 font-bold text-primary">
              <ArrowUpRight className="h-3 w-3 shrink-0" />
              {tooltip.primary}
            </p>
            {tooltip.secondary && (
              <p className="font-num flex items-center gap-1 text-[0.7rem] text-positive">
                {tooltip.secondary.startsWith("In ") && (
                  <ArrowDownLeft className="h-3 w-3 shrink-0" />
                )}
                {tooltip.secondary}
              </p>
            )}
            {tooltip.tertiary && (
              <p className="font-num text-[0.68rem] text-muted-foreground">
                {tooltip.tertiary}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Interactive Icon Strip (replaces dense text lists under Pie / Bar / Line) */}
      {chartType === "pie" && normalizedPieData.length > 0 && (
        <div className="no-scrollbar flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-0.5 sm:flex-wrap">
          {normalizedPieData.map((entry) => {
            const Icon = entry.category
              ? categoryIcon(entry.category)
              : Sparkles;
            const total =
              normalizedPieData.reduce((s, d) => s + d.value, 0) || 1;
            const pct = Math.round((entry.value / total) * 100);
            const active = activeSliceId === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                title={`${shortFlowLabel(entry.label)} · ${formatMoney(entry.value)} (${pct}%)`}
                onMouseEnter={() => {
                  setActiveSliceId(entry.id);
                  onHoverId?.(entry.id);
                }}
                onMouseLeave={() => {
                  setActiveSliceId(null);
                  onHoverId?.(null);
                }}
                onClick={() =>
                  entry.account &&
                  entry.category &&
                  onSelectCategory?.(entry.account, entry.category)
                }
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors active:scale-95",
                  active
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border bg-muted/40 text-foreground hover:border-primary/45",
                )}
              >
                <Icon
                  className="h-3.5 w-3.5 shrink-0"
                  style={{ color: entry.color }}
                />
                <span className="font-medium">
                  {shortFlowLabel(entry.label)}
                </span>
                <span className="font-num text-[0.7rem] text-muted-foreground">
                  {pct}%
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
