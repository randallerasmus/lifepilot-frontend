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
}

interface TooltipPayloadEntry {
  payload: ForecastDay;
}

function ForecastTooltip({
  active,
  payload,
  currency,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  currency: string;
}) {
  if (!active || !payload?.length) return null;
  const day = payload[0].payload;

  return (
    <div className="max-w-[16rem] rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-[var(--shadow-elevated)]">
      <p className="text-xs font-medium text-muted-foreground">{formatDate(day.date)}</p>
      <p className="mt-1 text-base font-semibold tabular-nums">
        {formatMoney(day.closingBalance, currency)}
      </p>
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
}: ForecastChartProps) {
  // A long horizon has more points than the axis can label, so thin the ticks
  // rather than letting them collide.
  const tickInterval = useMemo(
    () => Math.max(0, Math.ceil(timeline.length / 7) - 1),
    [timeline.length],
  );

  const domain = useMemo(() => {
    const values = timeline.map((day) => day.closingBalance);
    const min = Math.min(...values, threshold, 0);
    const max = Math.max(...values, threshold, 0);
    const pad = Math.max((max - min) * 0.1, 100);
    return [min - pad, max + pad] as [number, number];
  }, [timeline, threshold]);

  if (timeline.length === 0) return null;

  return (
    <div className="h-[22rem] w-full sm:h-[26rem]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={timeline} margin={{ top: 16, right: 16, bottom: 8, left: 8 }}>
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
            interval={tickInterval}
            tickLine={false}
            axisLine={{ stroke: "hsl(var(--chart-grid))" }}
            tick={{ fill: "hsl(var(--chart-axis))", fontSize: 12 }}
            minTickGap={16}
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
            content={<ForecastTooltip currency={currency} />}
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
              position: "top",
              fill: "hsl(var(--foreground))",
              fontSize: 11,
              fontWeight: 600,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
