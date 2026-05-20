import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Terminal,
  Shield,
  Cpu,
  Zap,
  Globe,
  Layout,
  Wrench,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { tools, categories } from "@/lib/tools-registry";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Text Processing Toolkit" },
      {
        name: "description",
        content:
          "Text Processing Toolkit is a free, client-side platform with 95+ text utilities for converting, cleaning, formatting, analyzing and generating text — all in your browser, zero server uploads.",
      },
      { property: "og:title", content: "About — Text Processing Toolkit" },
      {
        property: "og:description",
        content:
          "95+ text processing utilities. 100% client-side. No uploads. No tracking. Built for developers, writers, and data professionals.",
      },
    ],
  }),
  component: AboutPage,
});

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-sm border border-border bg-surface p-5 text-center">
      <div className="font-mono text-3xl font-bold tracking-tight text-primary">{value}</div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-sm border border-border bg-surface p-5 transition-all hover:border-primary/40 hover:bg-surface-2">
      <div className="grid h-9 w-9 place-items-center rounded-sm border border-border bg-background">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <h3 className="mt-3 font-mono text-sm font-semibold tracking-tight">{title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function TechBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-sm border border-border bg-surface px-2.5 py-1 font-mono text-[10px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
      {children}
    </span>
  );
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Core Tools": Terminal,
  "Text Utilities": BookOpen,
  Extractors: Wrench,
  "Crypto & Security": Shield,
  Converters: ArrowRight,
  Web: Globe,
  Development: Layout,
  Network: Cpu,
  "Dev Tools": Wrench,
  Advanced: Zap,
};

function AboutPage() {
  const categoryCounts = categories.map(
    (cat) => `${cat} (${tools.filter((t) => t.category === cat).length})`,
  );

  return (
    <div className="min-h-full">
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-6 py-16 sm:py-20">
          <Badge
            variant="outline"
            className="rounded-sm border-primary/40 bg-primary/10 font-mono text-[10px] uppercase tracking-widest text-primary"
          >
            <Terminal className="mr-1.5 h-3 w-3" />
            about the project
          </Badge>
          <h1 className="mt-4 font-mono text-4xl font-bold tracking-tight sm:text-5xl">
            Built for text.<br />
            <span className="text-primary">Powered by the browser.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Text Processing Toolkit is a free, open-source collection of{" "}
            <span className="font-mono text-foreground">{tools.length}</span> high-performance text
            utilities that run entirely in your browser. Nothing is uploaded — every operation happens
            locally on your machine.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="sm" className="h-8 rounded-sm font-mono text-xs">
              <Link to="/">
                <Terminal className="mr-1.5 h-3.5 w-3.5" />
                Browse all tools
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-8 rounded-sm border-border font-mono text-xs"
            >
              <a href="#features">
                <ArrowRight className="mr-1.5 h-3.5 w-3.5" />
                Explore features
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-6 py-12">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard value={String(tools.length)} label="Utilities" />
            <StatCard value={String(categories.length)} label="Categories" />
            <StatCard value="100%" label="Client-side" />
            <StatCard value="0" label="Server uploads" />
          </div>
        </div>
      </section>

      {/* What it is */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-6 py-12">
          <h2 className="font-mono text-sm font-semibold tracking-tight">
            <span className="text-primary">#</span> What is Text Processing Toolkit?
          </h2>
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                Text Processing Toolkit (tpt) is a unified workspace for working with text. It brings
                together <span className="font-mono text-foreground">{tools.length}</span> utilities —
                from everyday conversions to specialized transformations — in a single, consistent
                interface designed for speed and clarity.
              </p>
              <p>
                Whether you are cleaning CSV data, generating a hash, formatting JSON, converting
                between character encodings, or extracting URLs from a document — there is a tool for
                the job. Every tool follows the same interaction pattern, so once you know one, you
                know them all.
              </p>
            </div>
            <div className="rounded-sm border border-border bg-surface p-5">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">
                Categories
              </h3>
              <ul className="mt-3 space-y-1.5">
                {categories.map((cat) => {
                  const count = tools.filter((t) => t.category === cat).length;
                  const Icon = categoryIcons[cat] || Terminal;
                  return (
                    <li key={cat} className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                      <Icon className="h-3 w-3 shrink-0 text-primary/70" />
                      <span>{cat}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground/60">
                        [{count}]
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-6 py-12">
          <h2 className="font-mono text-sm font-semibold tracking-tight">
            <span className="text-primary">#</span> Why this exists
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Text processing is an everyday need for developers, data analysts, writers, and system
            administrators. Yet most solutions fall into one of two extremes: heavyweight desktop
            applications with steep learning curves, or scattered online tools that upload your data
            to unknown servers. This project bridges that gap — offering professional-grade text
            utilities that are instantly accessible, fully private, and completely free.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-6 py-12">
          <h2 className="font-mono text-sm font-semibold tracking-tight">
            <span className="text-primary">#</span> Key features
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Shield}
              title="100% private"
              description="Every operation runs locally in your browser. No data is ever sent to a server, stored, or tracked — your content never leaves your device."
            />
            <FeatureCard
              icon={Zap}
              title="Instant execution"
              description="No page reloads, no API calls. Results appear as you type, powered by client-side JavaScript with zero network latency."
            />
            <FeatureCard
              icon={Layout}
              title="Consistent interface"
              description="All tools share a uniform input/output panel design. Once you learn one tool, you intuitively know how to use every other."
            />
            <FeatureCard
              icon={Globe}
              title="Unicode-safe"
              description="Full support for Unicode, emoji, and multi-byte character sets. Handles CJK, Arabic, Cyrillic, and any script without corruption."
            />
            <FeatureCard
              icon={Cpu}
              title="Works offline"
              description="After the initial load, the application works without an internet connection. Perfect for air-gapped environments or travel."
            />
            <FeatureCard
              icon={Wrench}
              title="{tools.length} tools & growing"
              description="From Base64 to bcrypt, JSON to TOML, regex testing to QR code generation — there is a tool for virtually every text task."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-6 py-12">
          <h2 className="font-mono text-sm font-semibold tracking-tight">
            <span className="text-primary">#</span> How it works
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Choose a tool",
                desc: "Browse by category or search directly. Each tool is designed for a specific text operation.",
              },
              {
                step: "02",
                title: "Paste your text",
                desc: "Type or paste content into the input panel. The tool processes it instantly as you type.",
              },
              {
                step: "03",
                title: "Copy the result",
                desc: "The transformed output appears in the result panel. Copy, download, or use it directly.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="rounded-sm border border-border bg-surface p-5">
                <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
                  step {step}
                </div>
                <h3 className="mt-2 font-mono text-sm font-semibold tracking-tight">{title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-6 py-12">
          <h2 className="font-mono text-sm font-semibold tracking-tight">
            <span className="text-primary">#</span> Technology
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Built with modern web technologies to deliver a fast, reliable, and maintainable
            application. The entire project runs on the client — no backend, no database, no
            servers.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <TechBadge>React 19</TechBadge>
            <TechBadge>TypeScript</TechBadge>
            <TechBadge>Vite</TechBadge>
            <TechBadge>TanStack Router</TechBadge>
            <TechBadge>Tailwind CSS v4</TechBadge>
            <TechBadge>shadcn/ui</TechBadge>
            <TechBadge>Lucide Icons</TechBadge>
            <TechBadge>Radix UI</TechBadge>
            <TechBadge>Cloudflare</TechBadge>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-6 py-12">
          <h2 className="font-mono text-sm font-semibold tracking-tight">
            <span className="text-primary">#</span> Privacy & security
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-3 rounded-sm border border-border bg-surface p-5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <h3 className="font-mono text-xs font-semibold tracking-tight">Zero data uploads</h3>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Your text never leaves your browser. There are no servers to send data to, no APIs
                to call, and no logs to store.
              </p>
            </div>
            <div className="space-y-3 rounded-sm border border-border bg-surface p-5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <h3 className="font-mono text-xs font-semibold tracking-tight">No tracking</h3>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Zero analytics cookies, no telemetry, no fingerprinting. The application does not
                collect any personal information.
              </p>
            </div>
            <div className="space-y-3 rounded-sm border border-border bg-surface p-5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <h3 className="font-mono text-xs font-semibold tracking-tight">Open source</h3>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                The entire codebase is transparent and auditable. Anyone can inspect, fork, or
                contribute to the project.
              </p>
            </div>
            <div className="space-y-3 rounded-sm border border-border bg-surface p-5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <h3 className="font-mono text-xs font-semibold tracking-tight">No sign-up needed</h3>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Start using the tools immediately. No account creation, no email, no passwords.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-6 py-12">
          <h2 className="font-mono text-sm font-semibold tracking-tight">
            <span className="text-primary">#</span> Roadmap
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "More tools",
                desc: "Continually expanding the tool library based on community requests and common text-processing needs.",
              },
              {
                title: "Batch processing",
                desc: "Process multiple inputs at once — run a tool against a list of strings and get all results simultaneously.",
              },
              {
                title: "Workspace presets",
                desc: "Save and restore your favorite tool configurations so you can return to a workflow instantly.",
              },
              {
                title: "CLI version",
                desc: "A command-line interface for users who prefer working in the terminal for scripting and automation.",
              },
              {
                title: "Plugin system",
                desc: "An extensible API that allows the community to build and share custom text-processing tools.",
              },
              {
                title: "Batch pipelines",
                desc: "Chain multiple tools together in sequence to build complex text-processing workflows.",
              },
            ].map(({ title, desc }) => (
              <div key={title} className="rounded-sm border border-border bg-surface p-5">
                <h3 className="font-mono text-xs font-semibold tracking-tight">{title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-[1400px] px-6 py-16 text-center sm:py-20">
          <h2 className="font-mono text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to get started?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Browse all {tools.length} tools, find what you need, and start processing text instantly
            — no setup, no sign-up, no uploads.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="sm" className="h-9 rounded-sm font-mono text-xs">
              <Link to="/">
                <Terminal className="mr-1.5 h-3.5 w-3.5" />
                Browse all tools
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-9 rounded-sm border-border font-mono text-xs"
            >
              <a
                href="https://github.com/anomalyco/TextProcessing-Toolkit"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
