import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { types as extensionToMime, extensions as mimeToExtension } from "mime-types";

interface SearchSelectProps {
  options: { label: string; value: string }[];
  placeholder: string;
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}

function SearchSelect({ options, placeholder, value, onChange }: SearchSelectProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())).slice(0, 200),
    [options, query],
  );

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <div
        className="flex h-8 w-full cursor-pointer items-center rounded-sm border border-border bg-background px-3 font-mono text-xs text-foreground"
        onClick={() => { setOpen(!open); setQuery(""); }}
      >
        {selected ? selected.label : <span className="text-muted-foreground">{placeholder}</span>}
      </div>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-sm border border-border bg-background shadow-lg">
            <div className="sticky top-0 border-b border-border bg-background p-1">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="h-7 w-full rounded-sm font-mono text-xs"
                autoFocus
              />
            </div>
            {filtered.map((o) => (
              <div
                key={o.value}
                className={`cursor-pointer px-3 py-1.5 font-mono text-xs hover:bg-surface ${o.value === value ? "bg-primary/10 text-primary" : "text-foreground"}`}
                onClick={() => { onChange(o.value); setOpen(false); }}
              >
                {o.label}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-2 font-mono text-xs text-muted-foreground">No results</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function MimeTypes() {
  const mimeInfos = useMemo(
    () =>
      Object.entries(mimeToExtension)
        .map(([mimeType, extensions]) => ({ mimeType, extensions }))
        .sort((a, b) => a.mimeType.localeCompare(b.mimeType)),
    [],
  );

  const mimeOptions = useMemo(
    () => mimeInfos.map(({ mimeType }) => ({ label: mimeType, value: mimeType })),
    [mimeInfos],
  );

  const extOptions = useMemo(
    () =>
      Object.entries(extensionToMime)
        .map(([ext]) => ({ label: `.${ext}`, value: ext }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [],
  );

  const [selectedMime, setSelectedMime] = useState<string | undefined>();
  const [selectedExt, setSelectedExt] = useState<string | undefined>();

  const foundExtensions = useMemo(
    () => (selectedMime ? mimeToExtension[selectedMime] ?? [] : []),
    [selectedMime],
  );

  const foundMime = useMemo(
    () => (selectedExt ? extensionToMime[selectedExt] ?? "" : ""),
    [selectedExt],
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-sm border border-border bg-surface p-4">
          <div className="mb-1 font-mono text-xs font-bold text-foreground">Mime type to extension</div>
          <div className="mb-3 font-mono text-[11px] text-muted-foreground">
            Know which file extensions are associated to a mime-type
          </div>
          <SearchSelect
            options={mimeOptions}
            value={selectedMime}
            onChange={setSelectedMime}
            placeholder="Select your mimetype here... (ex: application/pdf)"
          />
          {foundExtensions.length > 0 && (
            <div className="mt-3 font-mono text-xs text-foreground">
              Extensions of files with the{" "}
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                {selectedMime}
              </span>{" "}
              mime-type:
              <div className="mt-2 flex flex-wrap gap-2">
                {foundExtensions.map((ext) => (
                  <span
                    key={ext}
                    className="rounded-full bg-primary/10 px-3 py-1 font-mono text-[11px] text-primary"
                  >
                    .{ext}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-sm border border-border bg-surface p-4">
          <div className="mb-1 font-mono text-xs font-bold text-foreground">File extension to mime type</div>
          <div className="mb-3 font-mono text-[11px] text-muted-foreground">
            Know which mime type is associated to a file extension
          </div>
          <SearchSelect
            options={extOptions}
            value={selectedExt}
            onChange={setSelectedExt}
            placeholder="Select your extension here... (ex: pdf)"
          />
          {selectedExt && (
            <div className="mt-3 font-mono text-xs text-foreground">
              Mime type associated to the extension{" "}
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                .{selectedExt}
              </span>{" "}
              file extension:
              <div className="mt-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 font-mono text-[11px] text-primary">
                  {foundMime}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-sm border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="px-4 py-2 text-left text-muted-foreground">Mime types</th>
                <th className="px-4 py-2 text-left text-muted-foreground">Extensions</th>
              </tr>
            </thead>
            <tbody>
              {mimeInfos.map(({ mimeType, extensions }) => (
                <tr key={mimeType} className="border-b border-border last:border-0 hover:bg-background/40">
                  <td className="px-4 py-2 text-foreground">{mimeType}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1.5">
                      {extensions.map((ext) => (
                        <span
                          key={ext}
                          className="rounded-full bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] text-primary"
                        >
                          .{ext}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
