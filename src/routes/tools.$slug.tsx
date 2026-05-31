import { createFileRoute, notFound } from "@tanstack/react-router";
import { Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ToolShell } from "@/components/ToolShell";
import { getTool, toolComponents } from "@/lib/tools-registry";
import { useRecent } from "@/lib/storage";
import i18n from "@/i18n/config";

export const Route = createFileRoute("/tools/$slug")({
  component: ToolPage,
  notFoundComponent: () => (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center">
        <div className="font-mono text-sm text-muted-foreground">tool not found</div>
      </div>
    </div>
  ),
  head: ({ params }) => {
    const t = getTool(params.slug);
    const name = t ? i18n.t(`tools.${t.slug}.name`) : "";
    const tagline = t ? i18n.t(`tools.${t.slug}.tagline`) : "";
    return {
      meta: t
        ? [
            { title: `${name} — Text Processing Toolkit` },
            { name: "description", content: tagline },
            { property: "og:title", content: `${name} — Text Processing Toolkit` },
            { property: "og:description", content: tagline },
          ]
        : [{ title: "Tool — Text Processing Toolkit" }],
    };
  },
});

function ToolPage() {
  const { slug } = Route.useParams();
  const tool = getTool(slug);
  const Comp = toolComponents[slug];
  const { push } = useRecent();

  useEffect(() => {
    if (tool) push(tool.slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!tool || !Comp) throw notFound();

  return (
    <ToolShell tool={tool}>
      <Suspense
        fallback={
          <div className="grid h-64 place-items-center font-mono text-xs text-muted-foreground">
            loading…
          </div>
        }
      >
        <Comp />
      </Suspense>
    </ToolShell>
  );
}
