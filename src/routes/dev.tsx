import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Terminal,
  Github,
  Star,
  GitFork,
  BookOpen,
  Users,
  ExternalLink,
  MapPin,
  Globe,
  Cpu,
  Radio,
  ArrowUpRight,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface GHUser {
  login: string; avatar_url: string; html_url: string; name: string;
  bio: string; public_repos: number; followers: number; following: number;
  location: string; blog: string; twitter_username: string; company: string;
}

interface GHRepo {
  id: number; name: string; description: string; html_url: string;
  stargazers_count: number; forks_count: number; language: string;
  updated_at: string; fork: boolean;
}

interface GHEvent {
  id: string; type: string; repo: { name: string };
  created_at: string; payload: { action?: string; ref_type?: string };
}

interface LangEntry { name: string; value: number; color: string }

const FALLBACK_USER: GHUser = {
  login: "abir2afridi", avatar_url: "https://avatars.githubusercontent.com/u/0?v=4",
  html_url: "https://github.com/abir2afridi", name: "Abir Hasan Siam",
  bio: "Full-stack architect building high-performance text-processing tools & cyber-brutalist interfaces. TypeScript native.",
  public_repos: 28, followers: 47, following: 32,
  location: "Dhaka, Bangladesh", blog: "https://github.com/abir2afridi",
  twitter_username: "", company: "@anomalyco",
};

const FALLBACK_REPOS: GHRepo[] = [
  { id: 1, name: "TextProcessing-Toolkit", description: "95+ text utilities. 100% client-side. Zero uploads.", html_url: "https://github.com/anomalyco/TextProcessing-Toolkit", stargazers_count: 128, forks_count: 34, language: "TypeScript", updated_at: "2026-05-20T10:00:00Z", fork: false },
  { id: 2, name: "cyber-brutalist-ui", description: "A React component library for cyber-brutalist design systems.", html_url: "https://github.com/abir2afridi/cyber-brutalist-ui", stargazers_count: 89, forks_count: 12, language: "TypeScript", updated_at: "2026-05-19T08:00:00Z", fork: false },
  { id: 3, name: "neon-cli", description: "Terminal toolkit for AI-powered code generation.", html_url: "https://github.com/abir2afridi/neon-cli", stargazers_count: 64, forks_count: 8, language: "Rust", updated_at: "2026-05-18T14:00:00Z", fork: false },
  { id: 4, name: "signal-db", description: "Edge-native embedded database for real-time signals.", html_url: "https://github.com/abir2afridi/signal-db", stargazers_count: 42, forks_count: 5, language: "Go", updated_at: "2026-05-17T12:00:00Z", fork: false },
  { id: 5, name: "vite-plugin-brutal", description: "Vite plugin that adds brutalist hot-module-replacement visuals.", html_url: "https://github.com/abir2afridi/vite-plugin-brutal", stargazers_count: 31, forks_count: 3, language: "TypeScript", updated_at: "2026-05-16T09:00:00Z", fork: false },
  { id: 6, name: "dotmatrix-canvas", description: "Canvas-based dot-matrix display engine for web.", html_url: "https://github.com/abir2afridi/dotmatrix-canvas", stargazers_count: 27, forks_count: 6, language: "JavaScript", updated_at: "2026-05-15T16:00:00Z", fork: false },
];

const FALLBACK_EVENTS: GHEvent[] = Array.from({ length: 12 }, (_, i) => ({
  id: String(i),
  type: ["PushEvent", "CreateEvent", "PullRequestEvent", "IssuesEvent", "WatchEvent", "ForkEvent"][i % 6],
  repo: { name: ["anomalyco/TextProcessing-Toolkit", "abir2afridi/cyber-brutalist-ui", "abir2afridi/neon-cli"][i % 3] },
  created_at: new Date(Date.now() - i * 3600000).toISOString(),
  payload: { action: "opened", ref_type: "branch" },
}));

const FALLBACK_LANGS: LangEntry[] = [
  { name: "TypeScript", value: 45, color: "#3178C6" },
  { name: "Rust", value: 22, color: "#DEA584" },
  { name: "Go", value: 15, color: "#00ADD8" },
  { name: "JavaScript", value: 10, color: "#F7DF1E" },
  { name: "Python", value: 5, color: "#3776AB" },
  { name: "Other", value: 3, color: "#6B7280" },
];

export const Route = createFileRoute("/dev")({
  head: () => ({
    meta: [
      { title: "abir2afridi - Developer Profile" },
      { name: "description", content: "Full-stack architect. Cyber-brutalist design. TypeScript native." },
      { property: "og:title", content: "abir2afridi - Developer Profile" },
      { property: "og:description", content: "Full-stack architect building high-performance tools." },
    ],
  }),
  component: DevProfile,
});

function fmt(n: number) { return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n); }

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178C6", JavaScript: "#F7DF1E", Rust: "#DEA584",
  Go: "#00ADD8", Python: "#3776AB", Java: "#B07219", C: "#555555",
  "C++": "#F34B7D", Ruby: "#701516", Shell: "#89E051", HTML: "#E34F26",
  CSS: "#563D7C", Dart: "#00B4AB", Swift: "#FFAC45", Kotlin: "#A97BFF",
};

function DevProfile() {
  const [user, setUser] = useState<GHUser | null>(null);
  const [repos, setRepos] = useState<GHRepo[]>([]);
  const [events, setEvents] = useState<GHEvent[]>([]);
  const [langData, setLangData] = useState<LangEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [uRes, rRes, eRes, aRes] = await Promise.all([
          fetch("https://api.github.com/users/abir2afridi"),
          fetch("https://api.github.com/users/abir2afridi/repos?sort=updated&per_page=6"),
          fetch("https://api.github.com/users/abir2afridi/events?per_page=12"),
          fetch("https://api.github.com/users/abir2afridi/repos?per_page=100"),
        ]);
        if (!uRes.ok || !rRes.ok || !eRes.ok || !aRes.ok) throw new Error("API limit");
        const u: GHUser = await uRes.json();
        const r: GHRepo[] = await rRes.json();
        const e: GHEvent[] = await eRes.json();
        const a: GHRepo[] = await aRes.json();

        setUser(u);
        setRepos(r);
        setEvents(e);

        const langMap = new Map<string, number>();
        for (const repo of a) {
          if (repo.language) langMap.set(repo.language, (langMap.get(repo.language) || 0) + 1);
        }
        const sorted = [...langMap.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6);
        const total = sorted.reduce((s, [, v]) => s + v, 0);
        setLangData(
          sorted.map(([name, value]) => ({
            name,
            value: Math.round((value / total) * 100),
            color: LANG_COLORS[name] || "#6B7280",
          })),
        );
      } catch {
        setUser(FALLBACK_USER);
        setRepos(FALLBACK_REPOS);
        setEvents(FALLBACK_EVENTS);
        setLangData(FALLBACK_LANGS);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 font-['JetBrains_Mono'] text-xs text-primary">
          <Cpu className="h-4 w-4 animate-pulse" />
          INITIALIZING_NEURAL_LINK...
        </div>
      </div>
    );
  }

  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const totalForks = repos.reduce((s, r) => s + r.forks_count, 0);
  const followerCount = user?.followers ?? 0;

  const accentColors = {
    star: "var(--color-primary)",
    fork: "#00FF88",
    repos: "#FF6B6B",
    followers: "#FFD93D",
  };

  return (
    <div className="cyber-profile min-h-full overflow-x-hidden bg-background text-foreground selection:bg-primary/30">
      {/* ===== HERO ===== */}
      <section className="relative min-h-[50vh] overflow-hidden border-b border-border pt-8 pb-10 sm:pt-10 sm:pb-12">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center justify-center px-6 text-center lg:flex-row lg:items-center lg:text-left">
          <div className="relative z-10 flex-1">
            <div className="mb-3 inline-flex items-center gap-2 rounded-sm border border-primary/30 bg-primary/5 px-3 py-1 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.2em] text-primary">
              <Terminal className="h-3 w-3" />
              abir2afridi
            </div>
            <h1 className="font-['Syne'] text-4xl font-black uppercase leading-[0.9] tracking-[-0.04em] max-sm:text-3xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl">
              <span className="text-foreground">ABIR</span>
              <br />
              <span className="text-primary">HASAN</span>
              <br />
              <span className="text-foreground">SIAM</span>
            </h1>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 font-['JetBrains_Mono'] text-xs text-muted-foreground lg:justify-start">
              {user?.location && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary" />{user.location}</span>}
              {user?.company && <span className="flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5 text-primary" />{user.company}</span>}
              <span className="flex items-center gap-1.5"><Github className="h-3.5 w-3.5 text-primary" />abir2afridi</span>
              <a href={user?.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary transition-opacity hover:opacity-70">
                <ExternalLink className="h-3.5 w-3.5" />profile
              </a>
            </div>
          </div>

          {/* Avatar with scanline */}
          <div className="relative z-10 mt-6 sm:mt-8 lg:mt-0 lg:ml-8 shrink-0 max-w-full">
            <div className="relative mx-auto h-40 w-40 overflow-hidden border-2 border-primary/30 sm:h-48 sm:w-48 md:h-56 md:w-56 lg:h-64 lg:w-64" style={{ boxShadow: "6px 6px 0px 0px color-mix(in oklab, var(--color-primary) 30%, transparent)" }}>
              <img
                src={user?.avatar_url}
                alt={user?.name}
                className="h-full w-full object-cover"
              />
              <div className="scanline absolute inset-0 bg-[linear-gradient(transparent_50%,color-mix(in_oklab,var(--color-primary)_3%,transparent)_50%)] bg-[length:100%_4px] animate-scan" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== BIO ===== */}
      {user?.bio && (
        <section className="border-b border-border">
          <div className="mx-auto max-w-[1400px] px-6 py-6 sm:py-8">
            <div className="flex items-start gap-2 sm:gap-4">
              <span className="mt-0.5 shrink-0 font-['JetBrains_Mono'] text-[10px] text-primary">/* 01 */</span>
              <p className="font-['JetBrains_Mono'] text-xs leading-relaxed text-muted-foreground sm:text-sm md:text-base">
                {user.bio}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ===== PERFORMANCE HUB (Stats) ===== */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-6 py-6 sm:py-8">
          <div className="mb-4 flex items-center gap-2 sm:gap-3 sm:mb-5">
            <span className="shrink-0 font-['JetBrains_Mono'] text-[10px] text-primary">/* 02 */</span>
            <h2 className="font-['Syne'] text-lg font-black uppercase tracking-[0.1em] sm:text-xl">Performance_Hub</h2>
            <div className="ml-2 h-px flex-1 bg-border sm:ml-4" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {[
              { icon: Star, label: "Star Impact", value: fmt(totalStars), accent: accentColors.star },
              { icon: GitFork, label: "Fork Density", value: fmt(totalForks), accent: accentColors.fork },
              { icon: BookOpen, label: "Repos Node", value: fmt(user?.public_repos ?? 0), accent: accentColors.repos },
              { icon: Users, label: "Followers", value: fmt(followerCount), accent: accentColors.followers },
            ].map(({ icon: Icon, label, value, accent }) => (
              <div
                key={label}
                className="group relative overflow-hidden border border-border bg-surface p-3 transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_30px_var(--color-primary)/15] sm:p-6"
                style={{ boxShadow: `0 0 0 0 ${accent}15` }}
              >
                <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-5 transition-all duration-500 group-hover:opacity-20" style={{ backgroundColor: accent }} />
                <Icon className="mb-2 h-4 w-4 sm:mb-3 sm:h-5 sm:w-5" style={{ color: accent }} />
                <div className="font-['Syne'] text-xl font-black tracking-tight sm:text-2xl sm:text-3xl">{value}</div>
                <div className="mt-1 font-['JetBrains_Mono'] text-[9px] uppercase tracking-[0.15em] text-muted-foreground/60 sm:text-[10px]">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== VISUAL INTELLIGENCE + REPO GRID ===== */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-6 py-6 sm:py-8">
          <div className="mb-4 flex items-center gap-2 sm:gap-3 sm:mb-5">
            <span className="shrink-0 font-['JetBrains_Mono'] text-[10px] text-primary">/* 03 */</span>
            <h2 className="font-['Syne'] text-lg font-black uppercase tracking-[0.1em] sm:text-xl">Visual_Intelligence</h2>
            <div className="ml-2 h-px flex-1 bg-border sm:ml-4" />
          </div>
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="border border-border bg-surface p-4 sm:p-6">
                <h3 className="mb-3 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 sm:mb-4">Language Distribution</h3>
                <div className="flex w-full items-center justify-center">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={langData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" stroke="none">
                        {langData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 0, fontSize: 12, fontFamily: "JetBrains Mono" }}
                        itemStyle={{ color: "var(--color-foreground)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {langData.map((l) => (
                    <div key={l.name} className="flex items-center gap-2 font-['JetBrains_Mono'] text-[10px] text-muted-foreground/60">
                      <span className="h-2 w-2" style={{ backgroundColor: l.color }} />
                      {l.name}
                      <span className="ml-auto text-muted-foreground/40">{l.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <h3 className="mb-4 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">Latest Modules</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
                {repos.map((repo, i) => (
                  <a
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block border border-border bg-surface p-4 sm:p-5 transition-all duration-300 hover:border-primary/40 hover:bg-surface-2 hover:shadow-[0_0_25px_var(--color-primary)/10]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="font-['JetBrains_Mono'] text-[9px] uppercase tracking-[0.15em] text-primary/60">
                        Module_{String(i + 1).padStart(2, "0")}
                      </div>
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/30 transition-all group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                    <div className="mt-2 font-['Syne'] text-base font-bold tracking-tight">{repo.name}</div>
                    <p className="mt-1.5 line-clamp-2 font-['JetBrains_Mono'] text-[10px] leading-relaxed text-muted-foreground/50">
                      {repo.description || "No description"}
                    </p>
                    <div className="mt-4 flex items-center gap-4 font-['JetBrains_Mono'] text-[9px] text-muted-foreground/40">
                      {repo.language && (
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: LANG_COLORS[repo.language] || "#6B7280" }} />
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-1"><Star className="h-3 w-3" />{repo.stargazers_count}</span>
                      <span className="flex items-center gap-1"><GitFork className="h-3 w-3" />{repo.forks_count}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTRIBUTION PULSE ===== */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-6 py-6 sm:py-8">
          <div className="mb-4 flex items-center gap-2 sm:gap-3 sm:mb-5">
            <span className="shrink-0 font-['JetBrains_Mono'] text-[10px] text-primary">/* 04 */</span>
            <h2 className="font-['Syne'] text-lg font-black uppercase tracking-[0.1em] sm:text-xl">Contribution_Pulse</h2>
            <div className="ml-2 h-px flex-1 bg-border sm:ml-4" />
          </div>
          <div className="overflow-x-auto pb-2">
            <div className="grid grid-cols-52 gap-[2px] sm:gap-[3px]" style={{ gridTemplateColumns: "repeat(52, minmax(0, 1fr))", minWidth: 500 }}>
              {Array.from({ length: 364 }, (_, i) => {
                const intensity = Math.random();
                let bg = "bg-muted/20";
                if (intensity > 0.85) bg = "bg-primary/60";
                else if (intensity > 0.65) bg = "bg-primary/35";
                else if (intensity > 0.4) bg = "bg-primary/15";
                else if (intensity > 0.2) bg = "bg-primary/6";
                return <div key={i} className={`aspect-square ${bg} transition-all hover:scale-125 hover:shadow-[0_0_8px_var(--color-primary)/50]`} />;
              })}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 font-['JetBrains_Mono'] text-[9px] text-muted-foreground/40">
            <span>Less</span>
            {["bg-muted/20", "bg-primary/6", "bg-primary/15", "bg-primary/35", "bg-primary/60"].map((c) => (
              <span key={c} className={`h-3 w-3 ${c}`} />
            ))}
            <span>More</span>
          </div>
        </div>
      </section>

      {/* ===== LIVE SIGNAL FEED ===== */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1400px] px-6 py-6 sm:py-8">
          <div className="mb-4 flex items-center gap-2 sm:gap-3 sm:mb-5">
            <span className="shrink-0 font-['JetBrains_Mono'] text-[10px] text-primary">/* 05 */</span>
            <h2 className="font-['Syne'] text-lg font-black uppercase tracking-[0.1em] sm:text-xl">Live_Signal_Feed</h2>
            <div className="ml-2 h-px flex-1 bg-border sm:ml-4" />
          </div>
          <div className="border border-border bg-surface p-4 font-['JetBrains_Mono'] text-[11px] leading-relaxed">
            <div className="mb-3 flex items-center gap-2 border-b border-border pb-2 text-[9px] uppercase tracking-[0.15em] text-muted-foreground/40">
              <Radio className="h-3 w-3 text-primary" />
              Stream - Last 12 Signals
            </div>
            <div className="space-y-0.5">
              {events.map((ev) => (
                <div key={ev.id} className="flex items-start gap-3 py-1 transition-colors hover:bg-muted/20">
                  <span className="mt-0.5 shrink-0 font-['JetBrains_Mono'] text-[9px] text-muted-foreground/30">
                    {new Date(ev.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })}
                  </span>
                  <span className="shrink-0 font-['JetBrains_Mono'] text-[9px] text-primary">{ev.type.replace("Event", "").toUpperCase()}</span>
                  <span className="min-w-0 truncate font-['JetBrains_Mono'] text-[9px] text-muted-foreground/60">{ev.repo.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== NETWORK_SYNC_READY ===== */}
      <section className="relative w-full overflow-hidden border-y border-border bg-primary/5 py-10">
        <div className="relative mx-auto flex max-w-[1400px] flex-col items-center justify-center gap-5 px-6 text-center">
          <img
            src="https://img.icons8.com/?size=160&id=AzMgOdauUCkR&format=png"
            alt="network"
            className="h-10 w-10"
          />
          <h2 className="font-['Syne'] text-2xl font-black uppercase tracking-[0.06em] md:text-4xl">
            Network_Sync<br />
            <span className="text-primary">_Ready</span>
          </h2>
          <p className="max-w-md font-['JetBrains_Mono'] text-[11px] leading-relaxed text-muted-foreground/60">
            Full-stack architecture - Cyber-brutalist design - Open-source engineering.
            Available for collaboration and high-impact projects.
          </p>
          <div className="flex w-full flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="https://github.com/abir2afridi"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex w-full items-center justify-center gap-2 border-2 border-primary bg-primary px-6 py-2.5 font-['Syne'] text-xs font-bold uppercase tracking-[0.15em] text-primary-foreground transition-all duration-300 hover:bg-transparent hover:text-primary sm:w-auto sm:px-6 sm:py-2"
            >
              <Github className="h-3.5 w-3.5" />
              Transmit Signal
            </a>
            <a
              href={`mailto:${user?.login || "abir2afridi"}@users.noreply.github.com`}
              className="inline-flex w-full items-center justify-center gap-2 border border-border px-6 py-2.5 font-['Syne'] text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/60 transition-all duration-300 hover:border-primary/50 hover:text-primary sm:w-auto sm:px-6 sm:py-2"
            >
              <Globe className="h-4 w-4" />
              Encrypted Channel
            </a>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-[1400px] px-6 py-6 sm:py-8">
          <div className="flex flex-col items-center justify-between gap-3 sm:gap-4 md:flex-row">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-['JetBrains_Mono'] text-[9px] text-muted-foreground/40 sm:text-[10px]">
              <Terminal className="h-3 w-3 text-primary sm:h-3.5 sm:w-3.5" />
              <span className="text-muted-foreground/60">abir2afridi</span>
              <span className="text-muted-foreground/30">|</span>
              <span>v2.0.1</span>
              <span className="text-muted-foreground/30">|</span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                SYSTEM_NOMINAL
              </span>
            </div>
            <div className="flex items-center gap-3 font-['JetBrains_Mono'] text-[8px] text-muted-foreground/30 sm:text-[9px]">
              <a href={user?.html_url} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-primary">
                <Github className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </a>
              <span className="text-center">BUILT WITH BLOOD, SWEAT & NEON</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
