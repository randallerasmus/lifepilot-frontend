export const API_BASE_URL =
  (import.meta.env.VITE_LIFEPILOT_API_BASE as string | undefined) ??
  "http://localhost:8080";

export type ScenarioType =
  | "SECOND_CAR"
  | "PRIVATE_SCHOOL"
  | "OVERSEAS_HOLIDAY"
  | "HOME_RENOVATION"
  | "UNPAID_LEAVE"
  | "SIDE_BUSINESS"
  | "CUSTOM";

export const SCENARIO_OPTIONS: {
  value: ScenarioType;
  label: string;
  defaultName: string;
}[] = [
  { value: "SECOND_CAR", label: "Buy a second car", defaultName: "Buy a second car" },
  { value: "PRIVATE_SCHOOL", label: "Send child to private school", defaultName: "Send child to private school" },
  { value: "OVERSEAS_HOLIDAY", label: "Overseas holiday", defaultName: "Overseas holiday" },
  { value: "HOME_RENOVATION", label: "Home renovation", defaultName: "Home renovation" },
  { value: "UNPAID_LEAVE", label: "Take unpaid leave", defaultName: "Take unpaid leave" },
  { value: "SIDE_BUSINESS", label: "Start a side business", defaultName: "Start a side business" },
  { value: "CUSTOM", label: "Custom event", defaultName: "Custom event" },
];

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
  riskLevel: string;
  survivalStatus: SurvivalStatus;
  monthlyBufferAfterScenario: number;
  monthlyShortfall: number;
  safeToSpendDropPercent: number;
  survivalMessage: string;
  recommendations: string[];
  disclaimer: string;
}

export async function simulateScenario(
  payload: ScenarioRequest,
): Promise<ScenarioResponse> {
  const res = await fetch(`${API_BASE_URL}/api/lifepilot/scenarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Request failed (${res.status})${text ? `: ${text}` : ""}`,
    );
  }
  return (await res.json()) as ScenarioResponse;
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
