import { useState, useMemo } from "react";
import { IOPanel } from "@/components/ToolShell";

interface XmlNode {
  name: string;
  attrs: Record<string, string>;
  children: (XmlNode | string)[];
}

function parseXml(xml: string): XmlNode {
  const trimmed = xml.trim();
  const m = trimmed.match(/^<([\w:-]+)([^>]*)>([\s\S]*)<\/\1>\s*$/);
  if (!m) throw new Error("Invalid XML: expected a single root element");
  const [, name, attrsStr, inner] = m;
  const attrs: Record<string, string> = {};
  const attrRe = /([\w:-]+)\s*=\s*"([^"]*)"/g;
  let am: RegExpExecArray | null;
  while ((am = attrRe.exec(attrsStr)) !== null) attrs[am[1]] = am[2];
  const children = parseChildren(inner.trim());
  return { name, attrs, children };
}

function parseChildren(s: string): (XmlNode | string)[] {
  const nodes: (XmlNode | string)[] = [];
  let pos = 0;
  while (pos < s.length) {
    if (s[pos] === "<") {
      const endTag = s.indexOf(">", pos);
      if (endTag === -1) throw new Error("Unclosed tag");
      const tagContent = s.slice(pos + 1, endTag);
      if (tagContent.startsWith("/")) {
        const closeName = tagContent.slice(1).trim();
        const closeEnd = s.indexOf(`</${closeName}>`, pos);
        if (closeEnd === -1) break;
        pos = closeEnd + closeName.length + 3;
        continue;
      }
      const tagMatch = s.slice(pos).match(/^<([\w:-]+)([^>]*)>([\s\S]*?)<\/\1>/);
      if (tagMatch) {
        const [, name, attrsStr, inner] = tagMatch;
        const attrs: Record<string, string> = {};
        const attrRe = /([\w:-]+)\s*=\s*"([^"]*)"/g;
        let am: RegExpExecArray | null;
        while ((am = attrRe.exec(attrsStr)) !== null) attrs[am[1]] = am[2];
        nodes.push({ name, attrs, children: parseChildren(inner.trim()) });
        pos += tagMatch[0].length;
      } else {
        pos = s.indexOf(">", pos) + 1;
      }
    } else {
      const next = s.indexOf("<", pos);
      const text = next === -1 ? s.slice(pos) : s.slice(pos, next);
      const t = text.trim();
      if (t) nodes.push(t);
      pos = next === -1 ? s.length : next;
    }
  }
  return nodes;
}

function toJson(node: XmlNode): unknown {
  const result: Record<string, unknown> = {};
  if (Object.keys(node.attrs).length) result["@attributes"] = node.attrs;
  if (node.children.length) {
    const textParts = node.children.filter((c): c is string => typeof c === "string");
    const elements = node.children.filter((c): c is XmlNode => typeof c !== "string");
    if (elements.length) {
      for (const el of elements) {
        if (result[el.name]) {
          if (!Array.isArray(result[el.name])) result[el.name] = [result[el.name]];
          (result[el.name] as unknown[]).push(toJson(el));
        } else {
          result[el.name] = toJson(el);
        }
      }
    }
    if (textParts.length === 1 && !elements.length) return textParts[0];
    if (textParts.length) result["#text"] = textParts.join(" ");
  }
  return result;
}

export default function XmlToJson() {
  const [input, setInput] = useState('<root>\n  <person id="1">\n    <name>Alice</name>\n    <age>30</age>\n  </person>\n</root>');
  const output = useMemo(() => {
    try { return JSON.stringify(toJson(parseXml(input)), null, 2); }
    catch (e) { return `[error] ${(e as Error).message}`; }
  }, [input]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <IOPanel label="XML Input" value={input} onChange={setInput} />
      <IOPanel label="JSON Output" value={output} readOnly />
    </div>
  );
}
