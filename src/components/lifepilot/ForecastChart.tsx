import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatDate,
  formatDateShort,
  formatMoney,
  formatMoneyShort,
  type CashflowRisk,
  type ForecastDay,
} from "@/lib/lifepilot";

interface ForecastChartProps {
  timeline: ForecastDay[];
  risks: CashflowRisk[];
  threshold: number;
  lowestDate: string;
  lowestBalance: number;
  currency?: string;
  /**
   * A second curve drawn dashed behind the first, for "with and without"
   * comparisons. Both share one axis: they are the same measure.
   */
  comparison?: {
    timeline: ForecastDay[];
    label: string;
    seriesLabel: string;
  };
}

type ChartDay = ForecastDay & { comparisonBalance?: number };

interface TooltipPayloadEntry {
  payload: ChartDay;
}

function ForecastTooltip({
  active,
  payload,
  currency,
  comparison,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  currency: string;
  comparison?: ForecastChartProps["comparison"];
}) {
  if (!active || !payload?.length) return null;
  const day = payload[0].payload;

  return (
    <div className="max-w-[16rem] rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-[var(--shadow-elevated)]">
      <p className="text-xs font-medium text-muted-foreground">{formatDate(day.date)}</p>
      {comparison && <p className="mt-1 text-xs text-muted-foreground">{comparison.seriesLabel}</p>}
      <p className="mt-1 text-base font-semibold tabular-nums">
        {formatMoney(day.closingBalance, currency)}
      </p>
      {comparison && typeof day.comparisonBalance === "number" && (
        <p className="text-xs tabular-nums text-muted-foreground">
          {comparison.label}: {formatMoney(day.comparisonBalance, currency)}
        </p>
      )}
      {(day.inflows > 0 || day.outflows > 0) && (
        <p className="mt-1 text-xs tabular-nums text-muted-foreground">
          {day.inflows > 0 && <span>In {formatMoney(day.inflows, currency)}</span>}
          {day.inflows > 0 && day.outflows > 0 && <span> · </span>}
          {day.outflows > 0 && <span>Out {formatMoney(day.outflows, currency)}</span>}
        </p>
      )}
      {day.events.length > 0 && (
        <ul className="mt-2 space-y-0.5 border-t border-border pt-2 text-xs text-foreground/80">
          {day.events.map((event) => (
            <li key={event}>{event}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ForecastChart({
  timeline,
  risks,
  threshold,
  lowestDate,
  lowestBalance,
  currency = "ZAR",
  comparison,
}: ForecastChartProps) {
  const data = useMemo<ChartDay[]>(() => {
    if (!comparison) return timeline;
    const byDate = new Map(comparison.timeline.map((day) => [day.date, day.closingBalance]));
    return timeline.map((day) => ({ ...day, comparisonBalance: byDate.get(day.date) }));
  }, [timeline, comparison]);

  // Keep the low-point label inside the plot: near either edge it would be cut
  // off, so it sits beside the dot on the inward side instead of above it.
  const lowestLabelPosition = useMemo(() => {
    const index = timeline.findIndex((day) => day.date === lowestDate);
    if (index < 0 || timeline.length < 2) return "top" as const;
    const share = index / (timeline.length - 1);
    if (share > 0.85) return "left" as const;
    if (share < 0.15) return "right" as const;
    return "top" as const;
  }, [timeline, lowestDate]);

  const domain = useMemo(() => {
    const values = data.flatMap((day) =>
      typeof day.comparisonBalance === "number"
        ? [day.closingBalance, day.comparisonBalance]
        : [day.closingBalance],
    );
    const min = Math.min(...values, threshold, 0);
    const max = Math.max(...values, threshold, 0);
    const pad = Math.max((max - min) * 0.1, 100);
    return [min - pad, max + pad] as [number, number];
  }, [data, threshold]);

  if (timeline.length === 0) return null;

  return (
    <div className="w-full">
      {comparison && (
        // Identity is carried by the dash as well as the colour, and named here.
        <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <svg width="24" height="8" aria-hidden="true">
              <line x1="0" y1="4" x2="24" y2="4" stroke="hsl(var(--chart-balance))" strokeWidth="2" />
            </svg>
            {comparison.seriesLabel}
          </li>
          <li className="flex items-center gap-2">
            <svg width="24" height="8" aria-hidden="true">
              <line x1="0" y1="4" x2="24" y2="4" stroke="hsl(var(--chart-baseline))" strokeWidth="2" strokeDasharray="6 4" />
            </svg>
            {comparison.label}
          </li>
        </ul>
      )}
      <div className="h-[22rem] w-full sm:h-[26rem]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 16, right: 16, bottom: 8, left: 8 }}>
            <defs>
              <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-balance))" stopOpacity={0.28} />
                <stop offset="100%" stopColor="hsl(var(--chart-balance))" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid
              horizontal
              vertical={false}
              stroke="hsl(var(--chart-grid))"
              strokeDasharray="3 3"
            />

            {/* Risk windows are shaded, but never carry meaning by colour alone:
                every window is also listed with a label beneath the chart. */}
            {risks.map((risk) => (
              <ReferenceArea
                key={`${risk.startDate}-${risk.endDate}`}
                x1={risk.startDate}
                x2={risk.endDate}
                fill={
                  risk.severity === "CRITICAL"
                    ? "hsl(var(--danger))"
                    : "hsl(var(--warning))"
                }
                fillOpacity={0.12}
                stroke="none"
              />
            ))}

            <XAxis
              dataKey="date"
              tickFormatter={formatDateShort}
              // Thinned by the space available rather than by point count, so the
              // dates do not collide on a phone.
              interval="preserveStartEnd"
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--chart-grid))" }}
              tick={{ fill: "hsl(var(--chart-axis))", fontSize: 12 }}
              minTickGap={32}
            />
            <YAxis
              domain={domain}
              tickFormatter={formatMoneyShort}
              tickLine={false}
              axisLine={false}
              width={64}
              tick={{ fill: "hsl(var(--chart-axis))", fontSize: 12 }}
            />

            <Tooltip
              content={<ForecastTooltip currency={currency} comparison={comparison} />}
              cursor={{ stroke: "hsl(var(--chart-axis))", strokeWidth: 1, strokeDasharray: "3 3" }}
            />

            <ReferenceLine
              y={threshold}
              stroke="hsl(var(--danger))"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: threshold === 0 ? "Zero" : formatMoneyShort(threshold),
                position: "insideBottomLeft",
                fill: "hsl(var(--danger))",
                fontSize: 11,
              }}
            />

            {comparison && (
              <Area
                type="monotone"
                dataKey="comparisonBalance"
                stroke="hsl(var(--chart-baseline))"
                strokeWidth={2}
                strokeDasharray="6 4"
                fill="none"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "hsl(var(--chart-baseline))",
                  stroke: "hsl(var(--card))",
                  strokeWidth: 2,
                }}
                isAnimationActive={false}
              />
            )}

            <Area
              type="monotone"
              dataKey="closingBalance"
              stroke="hsl(var(--chart-balance))"
              strokeWidth={2}
              fill="url(#balanceFill)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "hsl(var(--chart-balance))",
                stroke: "hsl(var(--card))",
                strokeWidth: 2,
              }}
              isAnimationActive={false}
            />

            {/* The one point worth labelling directly: where the curve bottoms out. */}
            <ReferenceDot
              x={lowestDate}
              y={lowestBalance}
              r={5}
              fill={lowestBalance < threshold ? "hsl(var(--danger))" : "hsl(var(--chart-balance))"}
              stroke="hsl(var(--card))"
              strokeWidth={2}
              label={{
                value: `Lowest ${formatMoneyShort(lowestBalance)}`,
                position: lowestLabelPosition,
                fill: "hsl(var(--foreground))",
                fontSize: 11,
                fontWeight: 600,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
