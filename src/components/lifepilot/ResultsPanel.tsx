import { AlertCircle, Compass, Lightbulb, Loader2 } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { StatusBadge } from "./StatusBadge";
import { formatMoney, type ScenarioResponse } from "@/lib/lifepilot";

interface ResultsPanelProps {
  result: ScenarioResponse | null;
  loading: boolean;
  error: string | null;
}

export function ResultsPanel({ result, loading, error }: ResultsPanelProps) {
  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="mt-4 text-sm font-medium text-foreground">Running simulation…</p>
        <p className="mt-1 text-xs text-muted-foreground">Calculating impact on your monthly position</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-danger/30 bg-danger-soft p-8 text-center">
        <AlertCircle className="size-8 text-danger" />
        <p className="mt-4 text-base font-semibold text-danger">Simulation unavailable</p>
        <p className="mt-2 max-w-sm text-sm text-danger/80">{error}</p>
        <p className="mt-4 text-xs text-muted-foreground">
          Check that the LifePilot service is running and try again.
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
          <Compass className="size-7" />
        </div>
        <p className="mt-4 text-base font-semibold text-foreground">No simulation yet</p>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Fill in the scenario form and run a simulation to see how a life event would affect your monthly
          position.
        </p>
      </div>
    );
  }

  const currency = result.currency || "ZAR";
  const dropPct = result.safeToSpendDropPercent;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {result.scenarioType.replace(/_/g, " ")}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">{result.scenarioName}</h2>
            <p className="mt-1 text-xs text-muted-foreground">Account {result.accountId}</p>
          </div>
          <StatusBadge status={result.survivalStatus} size="lg" />
        </div>
        {result.survivalMessage && (
          <p className="mt-4 text-sm leading-relaxed text-foreground/90">{result.survivalMessage}</p>
        )}
        {result.riskLevel && (
          <p className="mt-3 text-xs text-muted-foreground">
            Risk level: <span className="font-medium text-foreground">{result.riskLevel}</span>
          </p>
        )}
      </div>

      {/* Safe to spend comparison */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MetricCard
          label="Current safe to spend"
          value={formatMoney(result.currentSafeToSpend, currency)}
          hint={`Available balance ${formatMoney(result.availableBalance, currency)}`}
        />
        <MetricCard
          label="Projected safe to spend"
          value={formatMoney(result.projectedSafeToSpend, currency)}
          hint={
            typeof dropPct === "number"
              ? `${dropPct >= 0 ? "−" : "+"}${Math.abs(dropPct).toFixed(1)}% vs current`
              : undefined
          }
          tone={
            result.survivalStatus === "UNAFFORDABLE"
              ? "danger"
              : result.survivalStatus === "TIGHT"
                ? "warning"
                : "success"
          }
        />
      </div>

      {/* Impact metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Monthly impact"
          value={formatMoney(result.monthlyImpact, currency)}
        />
        <MetricCard
          label="Once-off impact"
          value={formatMoney(result.onceOffImpact, currency)}
        />
        <MetricCard
          label="Monthly buffer"
          value={formatMoney(result.monthlyBufferAfterScenario, currency)}
          tone={result.monthlyBufferAfterScenario < 0 ? "danger" : "success"}
        />
        <MetricCard
          label="Monthly shortfall"
          value={formatMoney(result.monthlyShortfall, currency)}
          tone={result.monthlyShortfall > 0 ? "danger" : "muted"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MetricCard
          label="Duration"
          value={`${result.durationMonths} ${result.durationMonths === 1 ? "month" : "months"}`}
        />
        <MetricCard
          label="Safe-to-spend drop"
          value={typeof dropPct === "number" ? `${dropPct.toFixed(1)}%` : "—"}
          tone={dropPct >= 50 ? "danger" : dropPct >= 20 ? "warning" : "success"}
        />
      </div>

      {/* Recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2">
            <Lightbulb className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Recommendations</h3>
          </div>
          <ul className="mt-4 space-y-3">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-3 text-sm text-foreground/90">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.disclaimer && (
        <p className="rounded-lg bg-muted/60 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          {result.disclaimer}
        </p>
      )}
    </div>
  );
}
