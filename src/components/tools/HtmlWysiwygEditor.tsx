import { useState, useEffect, useCallback, useRef } from "react";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { format } from "prettier";
import htmlParser from "prettier/plugins/html";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Bold, Italic, Strikethrough, Code,
  Heading1, Heading2, Heading3, Heading4,
  List, ListOrdered, Code2, Quote,
  RemoveFormatting, Undo, Redo,
  Copy, WrapText,
} from "lucide-react";

const DEFAULT_HTML = "<h1>Hey!</h1><p>Welcome to this html wysiwyg editor</p>";

function MenuButton({ icon: Icon, title, onClick, active }: { icon: typeof Bold; title: string; onClick: () => void; active: boolean }) {
  return (
    <button
      title={title}
      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
      className={`flex h-8 w-8 items-center justify-center rounded-sm text-foreground transition-colors hover:bg-surface ${active ? "bg-primary/15 text-primary" : ""}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function MenuDivider() {
  return <div className="mx-0.5 h-5 w-px bg-border" />;
}

const DIVIDER_INDICES = new Set([4, 8, 12]);

export default function HtmlWysiwygEditor() {
  const editorRef = useRef<Editor | null>(null);
  const [mounted, setMounted] = useState(false);
  const [formatted, setFormatted] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const editor = new Editor({
      element: document.createElement("div"),
      extensions: [StarterKit],
      content: DEFAULT_HTML,
      onUpdate: ({ editor }) => {
        formatHTML(editor.getHTML());
      },
      onSelectionUpdate: () => {
        setTick((t) => t + 1);
      },
      editorProps: {
        attributes: { class: "outline-none min-h-[120px]" },
      },
    });

    editorRef.current = editor;
    setMounted(true);

    const el = editor.view.dom;
    const target = document.getElementById("wysiwyg-mount");
    if (target) {
      target.appendChild(el);
      // append prosemirror styles
      const style = editor.view.dom.ownerDocument.createElement("style");
      style.textContent = `
        .ProseMirror { outline: none; min-height: 120px; }
        .ProseMirror > * + * { margin-top: 0.75em; }
        .ProseMirror p { margin: 0; }
        .ProseMirror ul, .ProseMirror ol { padding: 0 1rem; }
        .ProseMirror h1 { font-size: 2em; font-weight: 700; }
        .ProseMirror h2 { font-size: 1.5em; font-weight: 700; }
        .ProseMirror h3 { font-size: 1.17em; font-weight: 700; }
        .ProseMirror h4 { font-size: 1em; font-weight: 700; }
        .ProseMirror code { background: hsl(var(--surface)); padding: 2px 4px; border-radius: 5px; font-size: 85%; }
        .ProseMirror pre { background: hsl(var(--surface)); font-family: monospace; padding: 0.75rem 1rem; border-radius: 0.5rem; }
        .ProseMirror pre code { color: inherit; padding: 0; background: none; font-size: 0.8rem; }
        .ProseMirror blockquote { padding-left: 1rem; border-left: 2px solid hsl(var(--border)); }
        .ProseMirror hr { border: none; border-top: 2px solid hsl(var(--border)); margin: 2rem 0; }
      `;
      target.appendChild(style);
    }

    return () => {
      editor.destroy();
      editorRef.current = null;
    };
  }, []);

  const formatHTML = useCallback(async (html: string) => {
    try {
      const result = await format(html, { parser: "html", plugins: [htmlParser] });
      setFormatted(result);
    } catch {
      setFormatted(html);
    }
  }, []);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(formatted);
    toast.success("HTML copied to clipboard");
  }, [formatted]);

  const editor = editorRef.current;

  const items = editor
    ? [
        { icon: Bold, title: "Bold", action: () => editor.chain().focus().toggleBold().run(), check: () => editor.isActive("bold") },
        { icon: Italic, title: "Italic", action: () => editor.chain().focus().toggleItalic().run(), check: () => editor.isActive("italic") },
        { icon: Strikethrough, title: "Strike", action: () => editor.chain().focus().toggleStrike().run(), check: () => editor.isActive("strike") },
        { icon: Code, title: "Inline code", action: () => editor.chain().focus().toggleCode().run(), check: () => editor.isActive("code") },
        { icon: Heading1, title: "Heading 1", action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), check: () => editor.isActive("heading", { level: 1 }) },
        { icon: Heading2, title: "Heading 2", action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), check: () => editor.isActive("heading", { level: 2 }) },
        { icon: Heading3, title: "Heading 3", action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), check: () => editor.isActive("heading", { level: 3 }) },
        { icon: Heading4, title: "Heading 4", action: () => editor.chain().focus().toggleHeading({ level: 4 }).run(), check: () => editor.isActive("heading", { level: 4 }) },
        { icon: List, title: "Bullet list", action: () => editor.chain().focus().toggleBulletList().run(), check: () => editor.isActive("bulletList") },
        { icon: ListOrdered, title: "Ordered list", action: () => editor.chain().focus().toggleOrderedList().run(), check: () => editor.isActive("orderedList") },
        { icon: Code2, title: "Code block", action: () => editor.chain().focus().toggleCodeBlock().run(), check: () => editor.isActive("codeBlock") },
        { icon: Quote, title: "Blockquote", action: () => editor.chain().focus().toggleBlockquote().run(), check: () => editor.isActive("blockquote") },
        { icon: WrapText, title: "Hard break", action: () => editor.chain().focus().setHardBreak().run(), check: () => false },
        { icon: RemoveFormatting, title: "Clear format", action: () => editor.chain().focus().clearNodes().unsetAllMarks().run(), check: () => false },
        { icon: Undo, title: "Undo", action: () => editor.chain().focus().undo().run(), check: () => false },
        { icon: Redo, title: "Redo", action: () => editor.chain().focus().redo().run(), check: () => false },
      ]
    : [];

  void tick;

  return (
    <div className="space-y-4">
      <div className="rounded-sm border border-border bg-surface">
        <div className="flex flex-wrap items-center border-b border-border px-3 py-2">
          {items.length > 0 && items.map((item, i) => (
            <div key={i} className="flex items-center">
              {DIVIDER_INDICES.has(i) && <MenuDivider />}
              <MenuButton icon={item.icon} title={item.title} onClick={item.action} active={item.check()} />
            </div>
          ))}
          {!mounted && (
            <span className="px-3 py-1.5 font-mono text-xs text-muted-foreground">Loading editor...</span>
          )}
        </div>
        <div className="px-6 py-4" id="wysiwyg-mount">
          {!mounted && (
            <div className="font-mono text-xs text-muted-foreground">Initializing...</div>
          )}
        </div>
      </div>

      <div className="rounded-sm border border-border bg-surface p-4">
        <div className="mb-2 font-mono text-xs text-muted-foreground">HTML output</div>
        <div className="relative">
          <textarea
            readOnly
            value={formatted}
            className="min-h-[120px] w-full resize-y rounded-sm border border-border bg-background p-3 font-mono text-xs text-foreground outline-none"
          />
          <Button
            size="sm"
            disabled={!formatted}
            onClick={handleCopy}
            className="absolute right-2 top-2 h-7 rounded-sm font-mono text-[11px]"
          >
            <Copy className="mr-1 h-3 w-3" />
            Copy
          </Button>
        </div>
      </div>
    </div>
  );
}
