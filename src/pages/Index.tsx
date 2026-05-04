import { useState } from "react";
import { ScenarioForm } from "@/components/lifepilot/ScenarioForm";
import { ResultsPanel } from "@/components/lifepilot/ResultsPanel";
import { simulateScenario, type ScenarioRequest, type ScenarioResponse } from "@/lib/lifepilot";
import { Compass } from "lucide-react";

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
      <header className="border-b border-border bg-[image:var(--gradient-brand)] text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[image:var(--gradient-mint)] text-accent-foreground shadow-[var(--shadow-brand)]">
              <Compass className="size-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight">LifePilot</h1>
              <p className="text-xs leading-tight text-primary-foreground/70">
                Educational planning guidance
              </p>
            </div>
          </div>
          <span className="hidden rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-xs font-medium text-primary-foreground sm:inline">
            Life-event simulator
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Simulate a life event
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            See how a major decision would affect your monthly position before you commit. Estimates are
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
