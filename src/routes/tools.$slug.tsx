import { createFileRoute, notFound } from "@tanstack/react-router";
import { Suspense, useEffect } from "react";
import { ToolShell } from "@/components/ToolShell";
import { getTool, toolComponents } from "@/lib/tools-registry";
import { useRecent } from "@/lib/storage";

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
    return {
      meta: t
        ? [
            { title: `${t.name} — Text Processing Toolkit` },
            { name: "description", content: t.tagline },
            { property: "og:title", content: `${t.name} — Text Processing Toolkit` },
            { property: "og:description", content: t.tagline },
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
