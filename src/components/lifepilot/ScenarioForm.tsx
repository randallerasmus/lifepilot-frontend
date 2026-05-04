import { useMemo, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Loader2, Sparkles } from "lucide-react";
import {
  SCENARIO_OPTIONS,
  type ScenarioRequest,
  type ScenarioType,
} from "@/lib/lifepilot";

interface ScenarioFormProps {
  onSubmit: (payload: ScenarioRequest) => void;
  loading?: boolean;
}

const numericFields = [
  "bondOrRent",
  "schoolFees",
  "insurance",
  "groceries",
  "fuel",
  "subscriptions",
  "otherBills",
  "goalSavingAmount",
  "monthlyCost",
  "onceOffCost",
  "durationMonths",
] as const;

type NumericField = (typeof numericFields)[number];

type FormState = {
  accountId: string;
  scenarioType: ScenarioType;
  scenarioName: string;
} & Record<NumericField, string>;

const initialState: FormState = {
  accountId: "",
  scenarioType: "SECOND_CAR",
  scenarioName: "Buy a second car",
  bondOrRent: "",
  schoolFees: "",
  insurance: "",
  groceries: "",
  fuel: "",
  subscriptions: "",
  otherBills: "",
  goalSavingAmount: "",
  monthlyCost: "",
  onceOffCost: "",
  durationMonths: "",
};

const commitments: { key: NumericField; label: string }[] = [
  { key: "bondOrRent", label: "Bond or rent" },
  { key: "schoolFees", label: "School fees" },
  { key: "insurance", label: "Insurance" },
  { key: "groceries", label: "Groceries" },
  { key: "fuel", label: "Fuel" },
  { key: "subscriptions", label: "Subscriptions" },
  { key: "otherBills", label: "Other bills" },
  { key: "goalSavingAmount", label: "Goal saving amount" },
];

export function ScenarioForm({ onSubmit, loading }: ScenarioFormProps) {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [scenarioNameDirty, setScenarioNameDirty] = useState(false);

  const setNumeric = (key: NumericField) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v === "" || /^\d*\.?\d*$/.test(v)) {
      setForm((f) => ({ ...f, [key]: v }));
    }
  };

  const handleScenarioChange = (value: ScenarioType) => {
    const opt = SCENARIO_OPTIONS.find((o) => o.value === value);
    setForm((f) => ({
      ...f,
      scenarioType: value,
      scenarioName: scenarioNameDirty ? f.scenarioName : opt?.defaultName ?? f.scenarioName,
    }));
  };

  const toNum = (v: string) => (v === "" ? 0 : Math.max(0, Number(v)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.accountId.trim()) next.accountId = "Account ID is required";
    if (!form.monthlyCost.trim()) next.monthlyCost = "Monthly cost is required";
    if (!form.durationMonths.trim()) next.durationMonths = "Duration is required";
    else if (Number(form.durationMonths) <= 0) next.durationMonths = "Must be greater than 0";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const payload: ScenarioRequest = {
      accountId: form.accountId.trim(),
      scenarioType: form.scenarioType,
      scenarioName: form.scenarioName.trim() || "Untitled scenario",
      bondOrRent: toNum(form.bondOrRent),
      schoolFees: toNum(form.schoolFees),
      insurance: toNum(form.insurance),
      groceries: toNum(form.groceries),
      fuel: toNum(form.fuel),
      subscriptions: toNum(form.subscriptions),
      otherBills: toNum(form.otherBills),
      goalSavingAmount: toNum(form.goalSavingAmount),
      monthlyCost: toNum(form.monthlyCost),
      onceOffCost: toNum(form.onceOffCost),
      durationMonths: Math.floor(toNum(form.durationMonths)),
    };
    onSubmit(payload);
  };

  const totalCommitments = useMemo(
    () => commitments.reduce((sum, c) => sum + toNum(form[c.key]), 0),
    [form],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Scenario setup</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us about a life event and your monthly commitments.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="accountId">
            Account ID <span className="text-danger">*</span>
          </Label>
          <Input
            id="accountId"
            value={form.accountId}
            onChange={(e) => setForm((f) => ({ ...f, accountId: e.target.value }))}
            placeholder="ACC-1029384"
            aria-invalid={!!errors.accountId}
          />
          {errors.accountId && <p className="text-xs text-danger">{errors.accountId}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="scenarioType">Life event</Label>
          <Select value={form.scenarioType} onValueChange={(v) => handleScenarioChange(v as ScenarioType)}>
            <SelectTrigger id="scenarioType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SCENARIO_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="scenarioName">Scenario name</Label>
          <Input
            id="scenarioName"
            value={form.scenarioName}
            onChange={(e) => {
              setScenarioNameDirty(true);
              setForm((f) => ({ ...f, scenarioName: e.target.value }));
            }}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="monthlyCost">
              Monthly cost <span className="text-danger">*</span>
            </Label>
            <Input
              id="monthlyCost"
              inputMode="decimal"
              value={form.monthlyCost}
              onChange={setNumeric("monthlyCost")}
              placeholder="0.00"
              aria-invalid={!!errors.monthlyCost}
            />
            {errors.monthlyCost && <p className="text-xs text-danger">{errors.monthlyCost}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="onceOffCost">Once-off cost</Label>
            <Input
              id="onceOffCost"
              inputMode="decimal"
              value={form.onceOffCost}
              onChange={setNumeric("onceOffCost")}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="durationMonths">
              Duration (months) <span className="text-danger">*</span>
            </Label>
            <Input
              id="durationMonths"
              inputMode="numeric"
              value={form.durationMonths}
              onChange={setNumeric("durationMonths")}
              placeholder="12"
              aria-invalid={!!errors.durationMonths}
            />
            {errors.durationMonths && <p className="text-xs text-danger">{errors.durationMonths}</p>}
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-semibold text-foreground">Existing monthly commitments</h3>
          <span className="text-xs text-muted-foreground tabular-nums">
            Total: {totalCommitments.toLocaleString()}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {commitments.map((c) => (
            <div key={c.key} className="space-y-1.5">
              <Label htmlFor={c.key} className="text-xs">{c.label}</Label>
              <Input
                id={c.key}
                inputMode="decimal"
                value={form[c.key]}
                onChange={setNumeric(c.key)}
                placeholder="0.00"
              />
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Simulating…
          </>
        ) : (
          <>
            <Sparkles className="mr-2 size-4" />
            Simulate impact
          </>
        )}
      </Button>
    </form>
  );
}
