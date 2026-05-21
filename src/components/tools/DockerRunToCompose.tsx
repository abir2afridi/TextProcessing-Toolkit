import { useState, useMemo } from "react";
import { IOPanel } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { Download, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { composerize } from "composerize-ts";
import { MessageType, type Message } from "composerize-ts";

const DEFAULT_RUN = "docker run -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock:ro --restart always --log-opt max-size=1g nginx";

function MessagesBlock({ title, messages, icon: Icon, className }: { title: string; messages: string[]; icon: typeof AlertTriangle; className: string }) {
  if (messages.length === 0) return null;
  return (
    <div className={`rounded-sm border px-3 py-2 ${className}`}>
      <div className="mb-1 flex items-center gap-1.5 font-mono text-xs font-bold">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </div>
      <ul className="list-inside list-disc space-y-0.5 font-mono text-[11px]">
        {messages.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}

export default function DockerRunToCompose() {
  const [input, setInput] = useState(DEFAULT_RUN);

  const result = useMemo(() => {
    if (!input.trim()) return { yaml: "", messages: [] as Message[] };
    try {
      return composerize(input.trim());
    } catch {
      return { yaml: "", messages: [{ type: MessageType.errorDuringConversion, value: "Failed to parse docker run command" }] };
    }
  }, [input]);

  const notTranslatable = result.messages.filter((m) => m.type === MessageType.notTranslatable).map((m) => m.value);
  const notImplemented = result.messages.filter((m) => m.type === MessageType.notImplemented).map((m) => m.value);
  const errors = result.messages.filter((m) => m.type === MessageType.errorDuringConversion).map((m) => m.value);

  const download = () => {
    if (!result.yaml) return;
    const blob = new Blob([result.yaml], { type: "application/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "docker-compose.yml";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("docker-compose.yml downloaded");
  };

  return (
    <div className="space-y-4">
      <IOPanel
        label="Your docker run command:"
        value={input}
        onChange={setInput}
        placeholder="Your docker run command to convert..."
        rows={3}
        monospace
      />

      <div className="h-px bg-border" />

      <IOPanel label="docker-compose.yml" value={result.yaml} readOnly />

      <div className="flex justify-center">
        <Button size="sm" disabled={!result.yaml} onClick={download} className="h-8 rounded-sm font-mono text-xs">
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Download docker-compose.yml
        </Button>
      </div>

      <MessagesBlock
        title="This options are not translatable to docker-compose"
        messages={notTranslatable}
        icon={Info}
        className="border-sky-400/40 bg-sky-400/10 text-sky-400"
      />

      <MessagesBlock
        title="This options are not yet implemented and therefore haven't been translated to docker-compose"
        messages={notImplemented}
        icon={AlertTriangle}
        className="border-yellow-400/40 bg-yellow-400/10 text-yellow-400"
      />

      <MessagesBlock
        title="The following errors occurred"
        messages={errors}
        icon={AlertCircle}
        className="border-destructive/40 bg-destructive/10 text-destructive"
      />
    </div>
  );
}
