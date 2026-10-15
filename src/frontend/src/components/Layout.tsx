import { UnitSystemToggle } from "@/components/UnitSystemToggle";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Calculator,
  History,
  Layers,
  type LucideIcon,
  Repeat,
} from "lucide-react";
import type { ReactNode } from "react";

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Converter", icon: Repeat },
  { to: "/calculators", label: "Calculators", icon: Calculator },
  { to: "/materials", label: "Materials", icon: Layers },
  { to: "/history", label: "History", icon: History },
];

export function Layout({ children }: { children: ReactNode }) {
  const year = new Date().getFullYear();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header
        data-ocid="site.header"
        className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-md"
      >
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between gap-3 px-4">
          <Link
            to="/"
            data-ocid="site.logo_link"
            className="flex items-center gap-2 font-display text-lg font-bold uppercase tracking-[0.18em] text-foreground transition-smooth hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span
              aria-hidden="true"
              className="inline-block size-2.5 rounded-sm bg-primary"
            />
            Torque
          </Link>
          <UnitSystemToggle />
        </div>
      </header>

      <main id="top" className="flex-1 pb-24">
        <div className="mx-auto w-full max-w-3xl px-4 py-6">{children}</div>
      </main>

      <footer
        data-ocid="site.footer"
        className="border-t border-border bg-muted/40 pb-24"
      >
        <div className="mx-auto w-full max-w-3xl px-4 py-6">
          <p className="font-mono text-xs text-muted-foreground">
            © {year}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== "undefined" ? window.location.hostname : "",
              )}`}
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline-offset-4 transition-smooth hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      <nav
        aria-label="Primary"
        data-ocid="site.bottom_nav"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur-md"
      >
        <ul className="mx-auto flex w-full max-w-3xl items-stretch">
          {NAV_ITEMS.map((item) => {
            const active =
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <li key={item.to} className="flex-1">
                <Link
                  to={item.to}
                  data-ocid={`site.nav.${item.label.toLowerCase()}`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-[56px] flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon aria-hidden="true" className="size-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
