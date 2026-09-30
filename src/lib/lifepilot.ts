export const API_BASE_URL =
  (import.meta.env.VITE_LIFEPILOT_API_BASE as string | undefined) ??
  "http://localhost:8080";

// The backend serves generated history for this id without Investec credentials,
// so the app shows something real before anyone has to find an account id.
export const DEMO_ACCOUNT_ID =
  (import.meta.env.VITE_LIFEPILOT_DEMO_ACCOUNT_ID as string | undefined) ??
  "demo-account";

export type ScenarioType =
  | "PRIVATE_SCHOOL"
  | "SECOND_CAR"
  | "NEW_HOME"
  | "HOME_RENOVATION"
  | "NEW_BABY"
  | "CAREER_CHANGE"
  | "OVERSEAS_HOLIDAY"
  | "SIDE_BUSINESS"
  | "UNPAID_LEAVE"
  | "CARE_FOR_PARENT"
  | "CUSTOM";

export const SCENARIO_OPTIONS: {
  value: ScenarioType;
  label: string;
  defaultName: string;
}[] = [
  { value: "SECOND_CAR", label: "Buy a second car", defaultName: "Buy a second car" },
  { value: "PRIVATE_SCHOOL", label: "Send child to private school", defaultName: "Send child to private school" },
  { value: "NEW_HOME", label: "Buy a new home", defaultName: "Buy a new home" },
  { value: "HOME_RENOVATION", label: "Home renovation", defaultName: "Home renovation" },
  { value: "NEW_BABY", label: "New baby", defaultName: "New baby" },
  { value: "CAREER_CHANGE", label: "Change careers", defaultName: "Change careers" },
  { value: "OVERSEAS_HOLIDAY", label: "Overseas holiday", defaultName: "Overseas holiday" },
  { value: "SIDE_BUSINESS", label: "Start a side business", defaultName: "Start a side business" },
  { value: "UNPAID_LEAVE", label: "Take unpaid leave", defaultName: "Take unpaid leave" },
  { value: "CARE_FOR_PARENT", label: "Care for a parent", defaultName: "Care for a parent" },
  { value: "CUSTOM", label: "Custom event", defaultName: "Custom event" },
];

export type RiskLevel = "HEALTHY" | "TIGHT" | "CRITICAL";

export interface ScenarioRequest {
  accountId: string;
  bondOrRent: number;
  schoolFees: number;
  insurance: number;
  groceries: number;
  fuel: number;
  subscriptions: number;
  otherBills: number;
  goalSavingAmount: number;
  scenarioType: ScenarioType;
  scenarioName: string;
  monthlyCost: number;
  onceOffCost: number;
  durationMonths: number;
}

export type SurvivalStatus = "AFFORDABLE" | "TIGHT" | "UNAFFORDABLE" | string;

export interface ScenarioResponse {
  accountId: string;
  scenarioType: ScenarioType;
  scenarioName: string;
  availableBalance: number;
  currentSafeToSpend: number;
  projectedSafeToSpend: number;
  monthlyImpact: number;
  onceOffImpact: number;
  durationMonths: number;
  currency: string;
  riskLevel: RiskLevel | string;
  survivalStatus: SurvivalStatus;
  monthlyBufferAfterScenario: number;
  monthlyShortfall: number;
  /** Null when there is no positive safe-to-spend to measure the drop against. */
  safeToSpendDropPercent: number | null;
  summary: string;
  survivalMessage: string;
  recommendations: string[];
  disclaimer: string;
}

export type RecurringCadence =
  | "WEEKLY"
  | "FORTNIGHTLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "ANNUAL";

export interface RecurringPayment {
  merchant: string;
  expectedAmount: number;
  cadence: RecurringCadence;
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
  nextDueDate: string;
  averageDaysBetween: number;
  amountDrift: number;
  confidence: number;
}

export interface ForecastDay {
  date: string;
  openingBalance: number;
  inflows: number;
  outflows: number;
  closingBalance: number;
  events: string[];
}

export interface CashflowRisk {
  startDate: string;
  endDate: string;
  daysAffected: number;
  lowestBalance: number;
  lowestBalanceDate: string;
  severity: RiskLevel | string;
  message: string;
}

export interface ForecastResponse {
  accountId: string;
  generatedOn: string;
  horizonDays: number;
  openingBalance: number;
  projectedClosingBalance: number;
  lowestProjectedBalance: number;
  lowestProjectedBalanceDate: string;
  riskLevel: RiskLevel | string;
  detectedMonthlyIncome: number;
  detectedMonthlyRecurringExpenses: number;
  averageDailyDiscretionarySpend: number;
  recurringExpenses: RecurringPayment[];
  recurringIncome: RecurringPayment[];
  risks: CashflowRisk[];
  timeline: ForecastDay[];
  assumptions: string[];
  summary: string;
  fallbackUsed: boolean;
}

export interface ForecastParams {
  horizonDays?: number;
  minimumBalanceThreshold?: number;
  includeDiscretionarySpend?: boolean;
}

async function readError(res: Response): Promise<never> {
  const text = await res.text().catch(() => "");
  throw new Error(`Request failed (${res.status})${text ? `: ${text}` : ""}`);
}

export async function simulateScenario(
  payload: ScenarioRequest,
): Promise<ScenarioResponse> {
  const res = await fetch(`${API_BASE_URL}/api/lifepilot/scenarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return readError(res);
  return (await res.json()) as ScenarioResponse;
}

export async function fetchForecast(
  accountId: string,
  params: ForecastParams = {},
): Promise<ForecastResponse> {
  const query = new URLSearchParams();
  if (params.horizonDays !== undefined) {
    query.set("horizonDays", String(params.horizonDays));
  }
  if (params.minimumBalanceThreshold !== undefined) {
    query.set("minimumBalanceThreshold", String(params.minimumBalanceThreshold));
  }
  if (params.includeDiscretionarySpend !== undefined) {
    query.set("includeDiscretionarySpend", String(params.includeDiscretionarySpend));
  }

  const suffix = query.toString() ? `?${query}` : "";
  const res = await fetch(
    `${API_BASE_URL}/api/lifepilot/accounts/${encodeURIComponent(accountId)}/forecast${suffix}`,
  );
  if (!res.ok) return readError(res);
  return (await res.json()) as ForecastResponse;
}

export function formatMoney(value: number, currency = "ZAR"): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  try {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

/** Compact money for chart axes, where full currency formatting will not fit. */
export function formatMoneyShort(value: number): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}R${(abs / 1_000_000).toFixed(1)}m`;
  if (abs >= 1_000) return `${sign}R${Math.round(abs / 1_000)}k`;
  return `${sign}R${Math.round(abs)}`;
}

export function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export function formatDateShort(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "short" }).format(parsed);
}

const cadenceLabels: Record<RecurringCadence, string> = {
  WEEKLY: "Weekly",
  FORTNIGHTLY: "Fortnightly",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  ANNUAL: "Annual",
};

export function formatCadence(cadence: RecurringCadence): string {
  return cadenceLabels[cadence] ?? cadence;
}
