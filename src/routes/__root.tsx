import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n/config";
import { Button } from "@/components/ui/button";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Toaster } from "@/components/ui/sonner";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";

function NotFoundComponent() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-mono text-7xl font-bold text-primary text-glow">{t("error.title")}</h1>
        <h2 className="mt-4 font-mono text-xl font-semibold text-foreground">{t("error.subtitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("error.description")}
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-sm bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("error.back")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const { t } = useTranslation();
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-mono text-xl font-semibold tracking-tight text-foreground">
          {t("error_boundary.title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-sm bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("error_boundary.retry")}
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Text Processing Toolkit" },
      {
        name: "description",
        content:
          "All-in-one text processing toolkit: convert, clean, format, analyze, encode and generate text — entirely in the browser.",
      },
      { property: "og:title", content: "Text Processing Toolkit" },
      { property: "og:description", content: "All-in-one text processing toolkit." },
      { property: "og:image", content: "https://raw.githubusercontent.com/anomalyco/TextProcessing-Toolkit/main/public/BannerTPT.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://raw.githubusercontent.com/anomalyco/TextProcessing-Toolkit/main/public/BannerTPT.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "icon",
        type: "image/png",
        href: "https://img.icons8.com/?size=100&id=OfjTGv1SlHbW&format=png",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("tpt-theme");if(t==="light"||t==="dark")document.documentElement.className=t;var l=localStorage.getItem("tpt-locale");if(l)document.documentElement.lang=l}catch(e){}})()`,
          }}
        />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const { t } = useTranslation();

  useEffect(() => {
    const saved = localStorage.getItem("tpt-theme") as "dark" | "light" | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
    try {
      localStorage.setItem("tpt-theme", theme);
    } catch { /* localStorage unavailable */ }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const [now, setNow] = useState(new Date(0));
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full overflow-x-hidden bg-background">
          <AppSidebar />
          <div className="flex min-h-screen flex-1 flex-col min-w-0">
            <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur">
              <SidebarTrigger className="rounded-sm" />
              <div className="font-mono text-[10px] text-muted-foreground max-sm:hidden">
                <span className="text-primary">$</span> tpt --version 1.0
              </div>
              <div className="font-mono text-[10px] text-muted-foreground sm:hidden">
                <span className="text-primary">tpt</span>
              </div>
              <Link
                to="/about"
                className="font-mono text-[10px] text-muted-foreground transition-colors hover:text-primary"
              >
                {t("header.about")}
              </Link>
              <div className="ml-auto" />
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground max-sm:hidden">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {t("header.online")}
              </div>
              <div className="hidden items-center gap-2 font-mono text-[10px] text-muted-foreground md:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {t("header.description")}
              </div>
              <div className="font-mono text-[10px] text-muted-foreground max-sm:hidden">
                {now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}{" "}
              </div>
              <div className="font-mono text-[10px] text-muted-foreground">
                {String(now.getHours()).padStart(2, "0")}:
                {String(now.getMinutes()).padStart(2, "0")}:
                <span className="text-primary">{String(now.getSeconds()).padStart(2, "0")}</span>
              </div>
              <LanguageSwitcher />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="h-8 w-8 rounded-sm p-0"
                title={t(theme === "dark" ? "theme.switch_to_light" : "theme.switch_to_dark")}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </header>
            <main className="flex-1 min-w-0">
              <Outlet />
            </main>
          </div>
        </div>
        <Toaster />
      </SidebarProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
}
