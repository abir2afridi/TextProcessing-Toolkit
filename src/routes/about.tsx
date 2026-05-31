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
  Search,
  Lock,
  Code,
  Smartphone,
  Database,
  Users,
  Sparkles,
  FileText,
  Timer,
  Server,
} from "lucide-react";
import { tools, categories } from "@/lib/tools-registry";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Text Processing Toolkit" },
      {
        name: "description",
        content:
          "Text Processing Toolkit is a free, client-side platform with 116 high-performance text utilities for converting, cleaning, formatting, analyzing, encoding, and generating text — all in your browser, zero server uploads.",
      },
      { property: "og:title", content: "About — Text Processing Toolkit" },
      {
        property: "og:description",
        content:
          "116 text processing utilities across 14 categories. 100% client-side. No uploads. No tracking. Built for developers, writers, and data professionals.",
      },
      { property: "og:type", content: "website" },
      {
        property: "og:image",
        content:
          "https://raw.githubusercontent.com/anomalyco/TextProcessing-Toolkit/main/public/BannerTPT.png",
      },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:image",
        content:
          "https://raw.githubusercontent.com/anomalyco/TextProcessing-Toolkit/main/public/BannerTPT.png",
      },
    ],
  }),
  component: AboutPage,
});

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-sm border border-border bg-surface p-5 text-center transition-colors hover:border-primary/30">
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

function UseCaseCard({
  icon: Icon,
  title,
  items,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-sm border border-border bg-surface p-5 transition-colors hover:border-primary/30">
      <div className="grid h-8 w-8 place-items-center rounded-sm border border-border bg-background">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <h3 className="mt-3 font-mono text-sm font-semibold tracking-tight">{title}</h3>
      <ul className="mt-2 space-y-1">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
            <span className="mt-0.5 text-primary">-</span>
            {item}
          </li>
        ))}
      </ul>
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
  "Images & Videos": Smartphone,
  Development: Code,
  Network: Server,
  Math: Terminal,
  Measurement: Timer,
  Data: Database,
  "Dev Tools": Wrench,
  Advanced: Sparkles,
};

function AboutPage() {
  const categoryCounts = categories.map(
    (cat) => `${cat} (${tools.filter((t) => t.category === cat).length})`,
  );

  return (
    <div className="min-h-full">
      {/* ============ Hero ============ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-350 px-6 py-16 sm:py-20">
          <Badge
            variant="outline"
            className="rounded-sm border-primary/40 bg-primary/10 font-mono text-[10px] uppercase tracking-widest text-primary"
          >
            <Terminal className="mr-1.5 h-3 w-3" />
            about the project
          </Badge>
          <h1 className="mt-4 font-mono text-4xl font-bold tracking-tight sm:text-5xl">
            Built for text.
            <br />
            <span className="text-primary">Powered by the browser.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Text Processing Toolkit is a free, open-source collection of{" "}
            <span className="font-mono text-foreground">{tools.length}</span> high-performance text
            utilities that run entirely in your browser. Nothing leaves your machine — every
            operation happens locally, instantly, and privately.
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

      {/* ============ Stats ============ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-350 px-6 py-12">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard value={String(tools.length)} label="Utilities" />
            <StatCard value={String(categories.length)} label="Categories" />
            <StatCard value="100%" label="Client-side" />
            <StatCard value="0" label="Server uploads" />
          </div>
        </div>
      </section>

      {/* ============ What it is ============ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-350 px-6 py-12">
          <h2 className="font-mono text-sm font-semibold tracking-tight">
            <span className="text-primary">#</span> What is Text Processing Toolkit?
          </h2>
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                Text Processing Toolkit (tpt) is a unified workspace for working with text. It
                brings together <span className="font-mono text-foreground">{tools.length}</span>{" "}
                utilities across{" "}
                <span className="font-mono text-foreground">{categories.length}</span> categories —
                from everyday conversions to specialized transformations — in a single, consistent
                interface designed for speed and clarity.
              </p>
              <p>
                Whether you are cleaning CSV data, generating a hash, formatting JSON, converting
                between character encodings, extracting URLs from a document, or generating a QR
                code — there is a tool for the job. Every tool follows the same interaction pattern,
                so once you know one, you know them all.
              </p>
              <p>
                Built entirely with modern web technologies, tpt runs 100% client-side. There is no
                backend server, no database, no API calls. Your data never leaves your browser. This
                means instant results, complete privacy, and offline capability after the first
                load.
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
                    <li
                      key={cat}
                      className="flex items-center gap-2 font-mono text-xs text-muted-foreground"
                    >
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

      {/* ============ Why ============ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-350 px-6 py-12">
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

      {/* ============ Use Cases ============ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-350 px-6 py-12">
          <h2 className="font-mono text-sm font-semibold tracking-tight">
            <span className="text-primary">#</span> Who this is for
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <UseCaseCard
              icon={Code}
              title="Developers"
              items={[
                "Format and validate JSON, XML, SQL, YAML, TOML",
                "Encode/decode Base64, URL, HTML entities",
                "Generate hashes, JWTs, UUIDs, tokens",
                "Test regex patterns in the playground",
              ]}
            />
            <UseCaseCard
              icon={Users}
              title="Data Professionals"
              items={[
                "Clean and normalize CSV data",
                "Convert between data formats",
                "Extract patterns, emails, URLs from datasets",
                "Analyze word and character frequency",
              ]}
            />
            <UseCaseCard
              icon={FileText}
              title="Writers & Editors"
              items={[
                "Convert text case and fix formatting",
                "Remove duplicate lines and extra whitespace",
                "Count words, characters, reading time",
                "Generate lorem ipsum placeholders",
              ]}
            />
            <UseCaseCard
              icon={Shield}
              title="Security Professionals"
              items={[
                "Generate and verify password hashes",
                "Analyze password strength and entropy",
                "Encrypt/decrypt text with AES",
                "Generate secure tokens and keys",
              ]}
            />
          </div>
        </div>
      </section>

      {/* ============ Features ============ */}
      <section id="features" className="border-b border-border">
        <div className="mx-auto max-w-350 px-6 py-12">
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
              description="All tools share a uniform input/output panel design with drag-and-drop file support and a consistent options layout."
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
              icon={Sparkles}
              title={`${tools.length} tools & growing`}
              description="From Base64 to bcrypt, JSON to TOML, regex testing to QR code generation — there is a tool for virtually every text task."
            />
          </div>
        </div>
      </section>

      {/* ============ How it works ============ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-350 px-6 py-12">
          <h2 className="font-mono text-sm font-semibold tracking-tight">
            <span className="text-primary">#</span> How it works
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Choose a tool",
                desc: "Browse by category or search directly across all tools. Each tool is designed for a specific text operation.",
              },
              {
                step: "02",
                title: "Paste your text",
                desc: "Type or paste content into the input panel. You can also upload a file or drag-and-drop. Results update instantly as you type.",
              },
              {
                step: "03",
                title: "Copy the result",
                desc: "The transformed output appears in the result panel. Copy, download as a text file, or use it directly in your workflow.",
              },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className="rounded-sm border border-border bg-surface p-5 transition-colors hover:border-primary/30"
              >
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

      {/* ============ Capabilities showcase ============ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-350 px-6 py-12">
          <h2 className="font-mono text-sm font-semibold tracking-tight">
            <span className="text-primary">#</span> What you can do
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Terminal,
                title: "Format & beautify",
                desc: "Prettify JSON, XML, SQL, YAML, TOML, and HTML with a single click. Minify or expand as needed.",
              },
              {
                icon: Search,
                title: "Extract & find",
                desc: "Pull out URLs, emails, phone numbers, hashtags, or custom patterns from any text block instantly.",
              },
              {
                icon: Lock,
                title: "Encode & encrypt",
                desc: "Base64, URL, HTML entities, hex, binary, JWT decode, bcrypt, AES encryption, and more crypto tools.",
              },
              {
                icon: ArrowRight,
                title: "Convert between formats",
                desc: "JSON to CSV, XML to JSON, YAML to TOML, Markdown to HTML, and many other format converters.",
              },
              {
                icon: BookOpen,
                title: "Analyze & measure",
                desc: "Word frequency, character distribution, keyword density, reading time, text statistics, and diff comparison.",
              },
              {
                icon: Database,
                title: "Clean & normalize",
                desc: "Remove duplicates, trim whitespace, fix line endings, normalize Unicode, strip HTML tags, clean invisible characters.",
              },
              {
                icon: Smartphone,
                title: "Generate & create",
                desc: "QR codes, WiFi QR, passwords, tokens, UUIDs, ULIDs, lorem ipsum, ASCII banners, SVG placeholders.",
              },
              {
                icon: Cpu,
                title: "Network & dev tools",
                desc: "IPv4 subnet calculator, MAC lookup, port generator, crontab builder, chmod calculator, git cheatsheet.",
              },
              {
                icon: Shield,
                title: "Check & validate",
                desc: "Password strength, IBAN validation, phone formatting, email normalization, MIME type lookup, HTTP status codes.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex gap-3 rounded-sm border border-border bg-surface p-4 transition-colors hover:border-primary/30"
              >
                <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-sm border border-border bg-background">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-mono text-xs font-semibold tracking-tight">{title}</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Tech stack ============ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-350 px-6 py-12">
          <h2 className="font-mono text-sm font-semibold tracking-tight">
            <span className="text-primary">#</span> Technology
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Built with modern web technologies to deliver a fast, reliable, and maintainable
            application. The entire project runs on the client — no backend, no database, no
            servers.
          </p>
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-primary">
                Frontend
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <TechBadge>React 19</TechBadge>
                <TechBadge>TypeScript</TechBadge>
                <TechBadge>Vite 7</TechBadge>
                <TechBadge>TanStack Router</TechBadge>
                <TechBadge>TanStack Query</TechBadge>
                <TechBadge>Tailwind CSS v4</TechBadge>
                <TechBadge>shadcn/ui (New York)</TechBadge>
                <TechBadge>Radix UI</TechBadge>
                <TechBadge>Lucide Icons</TechBadge>
                <TechBadge>Recharts</TechBadge>
              </div>
            </div>
            <div>
              <h3 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-primary">
                Infrastructure
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <TechBadge>i18next</TechBadge>
                <TechBadge>react-hook-form</TechBadge>
                <TechBadge>zod</TechBadge>
                <TechBadge>bcryptjs</TechBadge>
                <TechBadge>crypto-js</TechBadge>
                <TechBadge>node-forge</TechBadge>
                <TechBadge>TipTap Editor</TechBadge>
                <TechBadge>Cloudflare</TechBadge>
                <TechBadge>Bun</TechBadge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ Privacy & Security ============ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-350 px-6 py-12">
          <h2 className="font-mono text-sm font-semibold tracking-tight">
            <span className="text-primary">#</span> Privacy & security
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-3 rounded-sm border border-border bg-surface p-5 transition-colors hover:border-primary/30">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <h3 className="font-mono text-xs font-semibold tracking-tight">
                  Zero data uploads
                </h3>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Your text never leaves your browser. There are no servers to send data to, no APIs
                to call, and no logs to store. Every computation runs locally.
              </p>
            </div>
            <div className="space-y-3 rounded-sm border border-border bg-surface p-5 transition-colors hover:border-primary/30">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <h3 className="font-mono text-xs font-semibold tracking-tight">No tracking</h3>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Zero analytics cookies, no telemetry, no fingerprinting. The application does not
                collect any personal information whatsoever.
              </p>
            </div>
            <div className="space-y-3 rounded-sm border border-border bg-surface p-5 transition-colors hover:border-primary/30">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <h3 className="font-mono text-xs font-semibold tracking-tight">Open source</h3>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                The entire codebase is transparent and auditable on GitHub. Anyone can inspect,
                fork, or contribute to the project under the MIT license.
              </p>
            </div>
            <div className="space-y-3 rounded-sm border border-border bg-surface p-5 transition-colors hover:border-primary/30">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <h3 className="font-mono text-xs font-semibold tracking-tight">
                  No sign-up needed
                </h3>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Start using the tools immediately with zero friction. No account creation, no email,
                no passwords, no subscription.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-350 px-6 py-12">
          <h2 className="font-mono text-sm font-semibold tracking-tight">
            <span className="text-primary">#</span> Frequently asked questions
          </h2>
          <div className="mt-4 max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              {[
                {
                  q: "Is Text Processing Toolkit really free?",
                  a: "Yes, tpt is completely free and open-source under the MIT license. There are no paid tiers, no premium features, and no usage limits. All {tools.length} tools are available to everyone.",
                },
                {
                  q: "How does privacy work? Are my files uploaded to a server?",
                  a: "No files are ever uploaded. The entire application runs in your browser using JavaScript. Your data stays on your device and is never transmitted over the network. You can verify this by using the browser's developer tools network tab — you will see zero outbound requests when using the tools.",
                },
                {
                  q: "Can I use tpt without an internet connection?",
                  a: "Yes. After the first page load, all assets are cached by your browser. The tools work fully offline — no network connection required.",
                },
                {
                  q: "Which browsers are supported?",
                  a: "tpt works on all modern browsers: Chrome, Firefox, Safari, and Edge. Internet Explorer is not supported. The application uses modern JavaScript APIs that are available in evergreen browsers.",
                },
                {
                  q: "Can I add my own custom tools?",
                  a: "The project is open-source on GitHub. You can fork the repository, add new tools, and submit a pull request. The modular architecture makes it straightforward to add new utilities following the existing patterns.",
                },
                {
                  q: "Is there a command-line version?",
                  a: "Currently, tpt is a web application. A CLI version is on the roadmap for users who prefer working in the terminal for scripting and automation workflows.",
                },
                {
                  q: "How are tools organized?",
                  a: "Tools are grouped into {categories.length} categories: Core Tools, Text Utilities, Extractors, Crypto & Security, Converters, Web, Images & Videos, Development, Network, Math, Measurement, Data, Dev Tools, and Advanced. You can also use the search bar to find tools instantly.",
                },
              ].map(({ q, a }) => (
                <AccordionItem key={q} value={q} className="border-border">
                  <AccordionTrigger className="font-mono text-xs font-semibold tracking-tight hover:text-primary hover:no-underline">
                    {q}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs leading-relaxed text-muted-foreground">
                    {a
                      .replace(/\{tools\.length\}/g, String(tools.length))
                      .replace(/\{categories\.length\}/g, String(categories.length))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ============ Contribute ============ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-350 px-6 py-12">
          <h2 className="font-mono text-sm font-semibold tracking-tight">
            <span className="text-primary">#</span> Found a bug or missing a tool?
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            If you need a tool that is currently not present here, and you think can be useful, you
            are welcome to submit a feature request in the issues section in the GitHub repository.
            And if you found a bug, or something does not work as expected, please file a bug report
            in the issues section in the GitHub repository.
          </p>
          <div className="mt-4">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-8 rounded-sm border-border font-mono text-xs"
            >
              <a
                href="https://github.com/anomalyco/TextProcessing-Toolkit/issues"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Submit on GitHub
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ============ Roadmap ============ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-350 px-6 py-12">
          <h2 className="font-mono text-sm font-semibold tracking-tight">
            <span className="text-primary">#</span> Roadmap
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Wrench,
                title: "More tools",
                desc: "Continually expanding the tool library based on community requests and emerging text-processing needs.",
              },
              {
                icon: Zap,
                title: "Batch processing",
                desc: "Process multiple inputs at once — run a tool against a list of strings and get all results in one go.",
              },
              {
                icon: Database,
                title: "Workspace presets",
                desc: "Save and restore your favorite tool configurations so you can return to a workflow instantly.",
              },
              {
                icon: Code,
                title: "Plugin system",
                desc: "An extensible API that allows the community to build and share custom text-processing tools.",
              },
              {
                icon: Globe,
                title: "More languages",
                desc: "Expanding the i18n translation system to support more languages for a global audience.",
              },
              {
                icon: Terminal,
                title: "CLI version",
                desc: "A command-line interface for users who prefer working in the terminal for scripting and automation.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-sm border border-border bg-surface p-5 transition-colors hover:border-primary/30"
              >
                <div className="grid h-7 w-7 place-items-center rounded-sm border border-border bg-background">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <h3 className="mt-2 font-mono text-xs font-semibold tracking-tight">{title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section>
        <div className="mx-auto max-w-350 px-6 py-16 text-center sm:py-20">
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
