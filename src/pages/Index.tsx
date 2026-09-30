import { useState } from "react";
import { AppHeader } from "@/components/lifepilot/AppHeader";
import { ScenarioForm } from "@/components/lifepilot/ScenarioForm";
import { ResultsPanel } from "@/components/lifepilot/ResultsPanel";
import { simulateScenario, type ScenarioRequest, type ScenarioResponse } from "@/lib/lifepilot";

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScenarioResponse | null>(null);

  const handleSubmit = async (payload: ScenarioRequest) => {
    setLoading(true);
    setError(null);
    try {
      const data = await simulateScenario(payload);
      setResult(data);
    } catch (err) {
      const msg =
        err instanceof TypeError
          ? "Could not reach the LifePilot service. Is it running on the configured base URL?"
          : err instanceof Error
            ? err.message
            : "Something went wrong.";
      setError(msg);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Simulate a life event
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            See the day a major decision would leave your balance short, before you commit. Estimates are
            educational planning guidance only.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-8">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] lg:sticky lg:top-6 lg:self-start">
            <ScenarioForm onSubmit={handleSubmit} loading={loading} />
          </section>
          <section>
            <ResultsPanel result={result} loading={loading} error={error} />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Index;
