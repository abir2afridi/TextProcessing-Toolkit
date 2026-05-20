import { Link, useRouterState } from "@tanstack/react-router";
import { Search, Star, Terminal } from "lucide-react";
import { useState, useMemo } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { tools, categories, type ToolMeta } from "@/lib/tools-registry";
import { useFavorites } from "@/lib/storage";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { favorites, isFavorite } = useFavorites();
  const [q, setQ] = useState("");

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

  const grouped = useMemo(() => {
    const m = new Map<string, ToolMeta[]>();
    for (const c of categories) m.set(c, []);
    for (const t of filtered) m.get(t.category)?.push(t);
    return m;
  }, [filtered]);

  const favTools = tools.filter((t) => favorites.includes(t.slug));
  const isActive = (slug: string) => pathname === `/tools/${slug}`;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 px-2 py-1.5">
          <div className="grid h-8 w-8 place-items-center rounded-sm bg-primary text-primary-foreground">
            <Terminal className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-mono text-sm font-bold tracking-tight">tpt://</span>
              <span className="text-[10px] text-muted-foreground">text processing toolkit</span>
            </div>
          )}
        </Link>
        {!collapsed && (
          <div className="relative px-2 pb-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search tools…"
              className="h-8 rounded-sm border-sidebar-border bg-sidebar-accent pl-7 font-mono text-xs placeholder:text-muted-foreground/60"
            />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="gap-0">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && favTools.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Favorites
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {favTools.map((t) => (
                  <SidebarMenuItem key={t.slug}>
                    <SidebarMenuButton asChild isActive={isActive(t.slug)} className="font-mono text-xs">
                      <Link to="/tools/$slug" params={{ slug: t.slug }} className="flex items-center gap-2">
                        <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                        <span className="truncate">{t.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {categories.map((cat) => {
          const items = grouped.get(cat) || [];
          if (items.length === 0) return null;
          return (
            <SidebarGroup key={cat}>
              {!collapsed && (
                <SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {cat}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((t) => {
                    const Icon = t.icon;
                    const fav = isFavorite(t.slug);
                    return (
                      <SidebarMenuItem key={t.slug}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(t.slug)}
                          tooltip={t.name}
                          className={cn("font-mono text-xs", isActive(t.slug) && "bg-sidebar-accent text-primary")}
                        >
                          <Link to="/tools/$slug" params={{ slug: t.slug }} className="flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5 shrink-0" />
                            {!collapsed && <span className="truncate">{t.name}</span>}
                            {!collapsed && fav && <Star className="ml-auto h-3 w-3 fill-primary text-primary" />}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      {!collapsed && (
        <Link to="/dev" className="block border-t border-sidebar-border p-3 text-center transition-colors hover:bg-sidebar-accent/30">
          <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/50">
            IT-Tools v2025.11.17
          </div>
          <div className="font-mono text-[8px] text-muted-foreground/40">
            &copy; 2025 Abir Hasan Siam
          </div>
        </Link>
      )}
    </Sidebar>
  );
}
