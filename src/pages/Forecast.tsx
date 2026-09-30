import { useState } from "react";
import { AlertTriangle, Loader2, LineChart, TrendingDown } from "lucide-react";
import { AppHeader } from "@/components/lifepilot/AppHeader";
import { ForecastChart } from "@/components/lifepilot/ForecastChart";
import { MetricCard } from "@/components/lifepilot/MetricCard";
import { RecurringPaymentsTable } from "@/components/lifepilot/RecurringPaymentsTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEMO_ACCOUNT_ID,
  fetchForecast,
  formatDate,
  formatMoney,
  type ForecastResponse,
} from "@/lib/lifepilot";
import { cn } from "@/lib/utils";

const HORIZONS = [
  { value: "30", label: "30 days" },
  { value: "60", label: "60 days" },
  { value: "90", label: "90 days" },
  { value: "180", label: "6 months" },
  { value: "365", label: "1 year" },
];

const Forecast = () => {
  const [accountId, setAccountId] = useState(DEMO_ACCOUNT_ID);
  const [horizonDays, setHorizonDays] = useState("90");
  const [threshold, setThreshold] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ForecastResponse | null>(null);

  const thresholdValue = threshold.trim() === "" ? 0 : Number(threshold);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId.trim()) {
      setError("Enter an account ID to project a balance.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchForecast(accountId.trim(), {
        horizonDays: Number(horizonDays),
        minimumBalanceThreshold: Number.isNaN(thresholdValue) ? 0 : thresholdValue,
      });
      setResult(data);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Could not reach the LifePilot service. Is it running on the configured base URL?"
          : err instanceof Error
            ? err.message
            : "Something went wrong.",
      );
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const criticalRisk = result?.risks.find((risk) => risk.severity === "CRITICAL");
  const firstRisk = result?.risks[0];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Where your balance is heading
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            LifePilot places every detected recurring debit and credit on its own future due date, then
            walks the balance forward day by day. Estimates are educational planning guidance only.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mb-6 grid grid-cols-1 items-end gap-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto]"
        >
          <div className="space-y-1.5">
            <Label htmlFor="accountId">Account ID</Label>
            <Input
              id="accountId"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="Investec account ID"
              autoComplete="off"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="horizon">Horizon</Label>
            <Select value={horizonDays} onValueChange={setHorizonDays}>
              <SelectTrigger id="horizon" className="w-full sm:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HORIZONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="threshold">Alert below</Label>
            <Input
              id="threshold"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="0"
              inputMode="decimal"
              className="w-full sm:w-36"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Projecting
              </>
            ) : (
              <>
                <LineChart className="mr-2 size-4" />
                Project balance
              </>
            )}
          </Button>
        </form>

        {error && (
          <div className="mb-6 rounded-xl border border-danger/20 bg-danger-soft p-4 text-sm text-danger">
            {error}
          </div>
        )}

        {!result && !error && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <LineChart className="size-7" />
            </div>
            <p className="mt-4 text-base font-semibold text-foreground">No forecast yet</p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Enter an account ID and project the balance to see the day it runs short, the recurring
              payments driving it, and the risk windows ahead.
            </p>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            {/* Headline: the dated answer a balance history cannot give. */}
            <div
              className={cn(
                "rounded-2xl border p-6 shadow-[var(--shadow-card)]",
                criticalRisk
                  ? "border-danger/20 bg-danger-soft"
                  : firstRisk
                    ? "border-warning/20 bg-warning-soft"
                    : "border-border bg-card",
              )}
            >
              <div className="flex items-start gap-3">
                {criticalRisk ? (
                  <AlertTriangle className="mt-0.5 size-5 shrink-0 text-danger" />
                ) : firstRisk ? (
                  <TrendingDown className="mt-0.5 size-5 shrink-0 text-warning" />
                ) : null}
                <div>
                  <p
                    className={cn(
                      "text-lg font-semibold",
                      criticalRisk ? "text-danger" : firstRisk ? "text-warning" : "text-foreground",
                    )}
                  >
                    {criticalRisk
                      ? `Projected to run out on ${formatDate(criticalRisk.startDate)}`
                      : firstRisk
                        ? `Dips below your threshold on ${formatDate(firstRisk.startDate)}`
                        : "No cashflow risk in this window"}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">{result.summary}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Account {result.accountId} · generated {formatDate(result.generatedOn)} ·{" "}
                    {result.horizonDays}-day horizon
                  </p>
                </div>
              </div>
            </div>

            {result.fallbackUsed && (
              <div className="rounded-xl border border-warning/20 bg-warning-soft p-4 text-sm text-warning">
                Some Investec data could not be read, so this projection used local fallbacks. Treat the
                figures as indicative.
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <MetricCard
                label="Opening balance"
                value={formatMoney(result.openingBalance)}
                hint="Reported by Investec today"
              />
              <MetricCard
                label="Lowest projected"
                value={formatMoney(result.lowestProjectedBalance)}
                hint={formatDate(result.lowestProjectedBalanceDate)}
                tone={
                  result.lowestProjectedBalance < 0
                    ? "danger"
                    : result.lowestProjectedBalance < thresholdValue
                      ? "warning"
                      : "success"
                }
              />
              <MetricCard
                label="Projected close"
                value={formatMoney(result.projectedClosingBalance)}
                hint={`After ${result.horizonDays} days`}
              />
              <MetricCard
                label="Monthly recurring"
                value={formatMoney(result.detectedMonthlyRecurringExpenses)}
                hint={`Income ${formatMoney(result.detectedMonthlyIncome)}`}
                tone="muted"
              />
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-foreground">Projected daily balance</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Shaded bands mark the risk windows listed below. Average daily discretionary spend of{" "}
                  {formatMoney(result.averageDailyDiscretionarySpend)} is applied from tomorrow onwards.
                </p>
              </div>
              <ForecastChart
                timeline={result.timeline}
                risks={result.risks}
                threshold={thresholdValue}
                lowestDate={result.lowestProjectedBalanceDate}
                lowestBalance={result.lowestProjectedBalance}
              />
            </div>

            {result.risks.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
                <h3 className="text-base font-semibold text-foreground">Cashflow risk windows</h3>
                <ul className="mt-4 space-y-3">
                  {result.risks.map((risk) => (
                    <li
                      key={`${risk.startDate}-${risk.endDate}`}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-4",
                        risk.severity === "CRITICAL"
                          ? "border-danger/20 bg-danger-soft"
                          : "border-warning/20 bg-warning-soft",
                      )}
                    >
                      <AlertTriangle
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          risk.severity === "CRITICAL" ? "text-danger" : "text-warning",
                        )}
                      />
                      <div>
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            risk.severity === "CRITICAL" ? "text-danger" : "text-warning",
                          )}
                        >
                          {risk.severity === "CRITICAL" ? "Overdrawn" : "Below threshold"} ·{" "}
                          {formatDate(risk.startDate)} to {formatDate(risk.endDate)} ({risk.daysAffected}{" "}
                          {risk.daysAffected === 1 ? "day" : "days"})
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-foreground/80">{risk.message}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <RecurringPaymentsTable
                title="Recurring payments"
                description="Detected from six months of transaction history by cadence and amount stability."
                payments={result.recurringExpenses}
                emptyMessage="No recurring debits matched a cadence confidently enough to project."
              />
              <RecurringPaymentsTable
                title="Recurring income"
                description="Inflows that repeat on a recognised cadence, such as salary."
                payments={result.recurringIncome}
                emptyMessage="No recurring income was detected in the available history."
              />
            </div>

            {result.assumptions.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
                <h3 className="text-base font-semibold text-foreground">Assumptions</h3>
                <ul className="mt-3 space-y-2">
                  {result.assumptions.map((assumption) => (
                    <li key={assumption} className="flex gap-2 text-sm text-muted-foreground">
                      <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground" />
                      <span>{assumption}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Forecast;
