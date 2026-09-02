import { Compass } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const links = [
  { to: "/", label: "Simulator" },
  { to: "/forecast", label: "Forecast" },
];

export function AppHeader() {
  return (
    <header className="border-b border-border bg-[image:var(--gradient-brand)] text-primary-foreground">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
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

        <nav className="flex items-center gap-1 rounded-full border border-primary-foreground/15 bg-primary-foreground/5 p-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className="rounded-full px-3.5 py-1.5 text-xs font-medium text-primary-foreground/70 transition-colors hover:text-primary-foreground"
              activeClassName="bg-primary-foreground/15 text-primary-foreground"
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
