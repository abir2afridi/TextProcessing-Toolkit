import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Search, ArrowRight, Star, Clock, Terminal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { tools, categories, getTool } from "@/lib/tools-registry";
import { useFavorites, useRecent } from "@/lib/storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Text Processing Toolkit" },
      { name: "description", content: `${tools.length} high-performance text utilities across Core, Text, Extractors, Dev and Advanced categories — all in your browser.` },
      { property: "og:image", content: "https://raw.githubusercontent.com/anomalyco/TextProcessing-Toolkit/main/public/BannerTPT.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://raw.githubusercontent.com/anomalyco/TextProcessing-Toolkit/main/public/BannerTPT.png" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [q, setQ] = useState("");
  const { favorites, isFavorite, toggle } = useFavorites();
  const { recent } = useRecent();

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return tools;
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(term) ||
        t.tagline.toLowerCase().includes(term) ||
        t.keywords.some((k) => k.includes(term)),
    );
  }, [q]);

  const recentTools = recent.map(getTool).filter(Boolean);
  const favTools = favorites.map(getTool).filter(Boolean);

  return (
    <div className="min-h-full">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background" />
        <div className="relative mx-auto max-w-350 px-6 py-16 sm:py-20">
          <Badge variant="outline" className="rounded-sm border-primary/40 bg-primary/10 font-mono text-[10px] uppercase tracking-widest text-primary">
            <Terminal className="mr-1.5 h-3 w-3" />
            v1.0 · client-side
          </Badge>
          <h1 className="mt-4 font-mono text-4xl font-bold tracking-tight max-sm:text-3xl sm:text-5xl md:text-6xl">
            text processing<br />
            <span className="text-primary">toolkit</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-lg">
            {tools.length} high-performance utilities for tracking, cleaning, formatting and extracting text.
            Unicode-safe. No uploads. No tracking.
          </p>
          <div className="relative mt-8 max-w-2xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Search ${tools.length} tools — try 'json', 'regex', 'emoji'…`}
              className="h-14 rounded-sm border-border bg-surface/80 pl-11 font-mono text-sm shadow-lg backdrop-blur focus-visible:ring-primary"
            />
            <div className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 sm:flex">
              <kbd className="rounded-sm border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{filtered.length}</kbd>
              <span className="font-mono text-[10px] text-muted-foreground">results</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-350 space-y-12 px-6 py-12">
        {recentTools.length > 0 && !q && (
          <Section icon={Clock} title="recent">
            <Grid items={recentTools} isFavorite={isFavorite} onToggleFav={toggle} />
          </Section>
        )}

        {favTools.length > 0 && !q && (
          <Section icon={Star} title="favorites">
            <Grid items={favTools} isFavorite={isFavorite} onToggleFav={toggle} />
          </Section>
        )}

        {q ? (
          <Section title={`${filtered.length} matching tool${filtered.length === 1 ? "" : "s"}`}>
            <Grid items={filtered} isFavorite={isFavorite} onToggleFav={toggle} />
            {filtered.length === 0 && (
              <div className="rounded-sm border border-dashed border-border bg-surface p-12 text-center">
                <div className="font-mono text-sm text-muted-foreground">
                  no tools match <span className="text-primary">"{q}"</span>
                </div>
              </div>
            )}
          </Section>
        ) : (
          categories.map((cat) => {
            const items = tools.filter((t) => t.category === cat);
            if (items.length === 0) return null;
            return (
              <Section key={cat} title={cat.toLowerCase()} count={items.length}>
                <Grid items={items} isFavorite={isFavorite} onToggleFav={toggle} />
              </Section>
            );
          })
        )}
      </div>
    </div>
  );
}

function Section({
  title, count, icon: Icon, children,
}: { title: string; count?: number; icon?: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-4 flex items-baseline gap-3">
        <h2 className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {Icon && <Icon className="h-3.5 w-3.5 text-primary" />}
          <span className="text-primary">#</span>{title}
        </h2>
        {count !== undefined && (
          <span className="font-mono text-[10px] text-muted-foreground/60">[{count}]</span>
        )}
        <div className="ml-2 h-px flex-1 bg-border" />
      </div>
      {children}
    </section>
  );
}

function Grid({
  items, isFavorite, onToggleFav,
}: {
  items: ReturnType<typeof getTool>[];
  isFavorite: (slug: string) => boolean;
  onToggleFav: (slug: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((t) => {
        if (!t) return null;
        const Icon = t.icon;
        const fav = isFavorite(t.slug);
        return (
          <Link
            key={t.slug}
            to="/tools/$slug"
            params={{ slug: t.slug }}
            className={cn(
              "group relative flex flex-col rounded-sm border border-border bg-surface p-3 transition-all sm:p-4",
              "hover:border-primary/50 hover:bg-surface-2 hover:ring-accent-glow",
            )}
          >
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFav(t.slug); }}
              className="absolute right-2 top-2 rounded-sm p-1 opacity-0 transition-opacity group-hover:opacity-100 data-[fav=true]:opacity-100"
              data-fav={fav}
              aria-label="Toggle favorite"
            >
              <Star className={cn("h-3.5 w-3.5", fav ? "fill-primary text-primary" : "text-muted-foreground")} />
            </button>
            <div className="grid h-9 w-9 place-items-center rounded-sm border border-border bg-background transition-colors group-hover:border-primary/30 group-hover:text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <h3 className="font-mono text-sm font-semibold tracking-tight">{t.name}</h3>
            </div>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{t.tagline}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/70">
                /{t.slug}
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
