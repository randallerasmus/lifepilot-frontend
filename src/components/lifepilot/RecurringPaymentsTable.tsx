import { formatCadence, formatDate, formatMoney, type RecurringPayment } from "@/lib/lifepilot";
import { cn } from "@/lib/utils";

interface RecurringPaymentsTableProps {
  title: string;
  description: string;
  payments: RecurringPayment[];
  emptyMessage: string;
  currency?: string;
}

function confidenceTone(confidence: number): string {
  if (confidence >= 0.8) return "bg-success-soft text-success";
  if (confidence >= 0.65) return "bg-accent-soft text-accent-foreground";
  return "bg-muted text-muted-foreground";
}

export function RecurringPaymentsTable({
  title,
  description,
  payments,
  emptyMessage,
  currency = "ZAR",
}: RecurringPaymentsTableProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>

      {payments.length === 0 ? (
        <p className="mt-4 rounded-xl bg-muted p-4 text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Merchant</th>
                <th className="pb-2 pr-4 text-right font-medium">Amount</th>
                <th className="pb-2 pr-4 font-medium">Cadence</th>
                <th className="pb-2 pr-4 font-medium">Next due</th>
                <th className="pb-2 text-right font-medium">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={`${payment.merchant}-${payment.nextDueDate}`} className="border-b border-border/60 last:border-0">
                  <td className="py-2.5 pr-4 font-medium text-foreground">{payment.merchant}</td>
                  <td className="py-2.5 pr-4 text-right tabular-nums text-foreground">
                    {formatMoney(payment.expectedAmount, currency)}
                  </td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{formatCadence(payment.cadence)}</td>
                  <td className="py-2.5 pr-4 tabular-nums text-muted-foreground">
                    {formatDate(payment.nextDueDate)}
                  </td>
                  <td className="py-2.5 text-right">
                    <span
                      className={cn(
                        "inline-block rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                        confidenceTone(payment.confidence),
                      )}
                      title={`Seen ${payment.occurrences} times, about every ${payment.averageDaysBetween} days`}
                    >
                      {Math.round(payment.confidence * 100)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
