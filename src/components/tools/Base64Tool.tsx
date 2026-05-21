import { useState, useMemo } from "react";
import { IOPanel } from "@/components/ToolShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function makeUriSafe(encoded: string) {
  return encoded.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function unURI(encoded: string) {
  return encoded.replace(/-/g, "+").replace(/_/g, "/").replace(/[^A-Za-z0-9+/]/g, "");
}

function removePotentialDataAndMimePrefix(str: string) {
  return str.replace(/^data:.*?;base64,/, "");
}

function textToBase64(str: string, { makeUrlSafe = false }: { makeUrlSafe?: boolean } = {}) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  const encoded = btoa(bin);
  return makeUrlSafe ? makeUriSafe(encoded) : encoded;
}

function base64ToText(str: string, { makeUrlSafe = false }: { makeUrlSafe?: boolean } = {}) {
  if (!isValidBase64(str, { makeUrlSafe })) {
    throw new Error("Incorrect base64 string");
  }
  let cleanStr = removePotentialDataAndMimePrefix(str);
  if (makeUrlSafe) {
    cleanStr = unURI(cleanStr);
  }
  const bin = atob(cleanStr);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function isValidBase64(str: string, { makeUrlSafe = false }: { makeUrlSafe?: boolean } = {}) {
  let cleanStr = removePotentialDataAndMimePrefix(str);
  if (makeUrlSafe) {
    cleanStr = unURI(cleanStr);
  }
  try {
    const bin = atob(cleanStr);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    let bin2 = "";
    bytes.forEach((b) => (bin2 += String.fromCharCode(b)));
    const reEncoded = btoa(bin2);
    if (makeUrlSafe) {
      return removePotentialPadding(reEncoded) === cleanStr;
    }
    return reEncoded === cleanStr.replace(/\s/g, "");
  } catch {
    return false;
  }
}

function removePotentialPadding(str: string) {
  return str.replace(/=/g, "");
}

export default function Base64Tool() {
  const [textInput, setTextInput] = useState("");
  const [encodeUrlSafe, setEncodeUrlSafe] = useState(false);
  const [base64Input, setBase64Input] = useState("");
  const [decodeUrlSafe, setDecodeUrlSafe] = useState(false);

  const base64Output = useMemo(
    () => textToBase64(textInput, { makeUrlSafe: encodeUrlSafe }),
    [textInput, encodeUrlSafe],
  );

  const textOutput = useMemo(() => {
    try {
      return base64ToText(base64Input.trim(), { makeUrlSafe: decodeUrlSafe });
    } catch {
      return "";
    }
  }, [base64Input, decodeUrlSafe]);

  const b64Invalid =
    base64Input.trim() !== "" &&
    (() => {
      try {
        return !isValidBase64(base64Input.trim(), { makeUrlSafe: decodeUrlSafe });
      } catch {
        return true;
      }
    })();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-sm border border-border bg-surface p-4">
        <div className="mb-3 font-mono text-xs font-bold text-foreground">String to base64</div>
        <div className="mb-3 flex items-center gap-2">
          <Label className="font-mono text-[11px] text-muted-foreground">Encode URL safe</Label>
          <Switch checked={encodeUrlSafe} onCheckedChange={setEncodeUrlSafe} />
        </div>
        <IOPanel
          label="String to encode"
          value={textInput}
          onChange={setTextInput}
          placeholder="Put your string here..."
          rows={5}
        />
        <div className="mt-3">
          <IOPanel
            label="Base64 of string"
            value={base64Output}
            readOnly
            placeholder="The base64 encoding of your string will be here"
            rows={5}
          />
        </div>
        <div className="mt-3 flex justify-center">
          <Button
            size="sm"
            disabled={!base64Output}
            onClick={() => {
              navigator.clipboard.writeText(base64Output);
              toast.success("Base64 string copied to the clipboard");
            }}
            className="h-8 rounded-sm font-mono text-xs"
          >
            Copy base64
          </Button>
        </div>
      </div>

      <div className="rounded-sm border border-border bg-surface p-4">
        <div className="mb-3 font-mono text-xs font-bold text-foreground">Base64 to string</div>
        <div className="mb-3 flex items-center gap-2">
          <Label className="font-mono text-[11px] text-muted-foreground">Decode URL safe</Label>
          <Switch checked={decodeUrlSafe} onCheckedChange={setDecodeUrlSafe} />
        </div>
        {b64Invalid && (
          <div className="mb-2 rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-1.5 font-mono text-[11px] text-destructive">
            Invalid base64 string
          </div>
        )}
        <IOPanel
          label="Base64 string to decode"
          value={base64Input}
          onChange={setBase64Input}
          placeholder="Your base64 string..."
          rows={5}
        />
        <div className="mt-3">
          <IOPanel
            label="Decoded string"
            value={textOutput}
            readOnly
            placeholder="The decoded string will be here"
            rows={5}
          />
        </div>
        <div className="mt-3 flex justify-center">
          <Button
            size="sm"
            disabled={!textOutput}
            onClick={() => {
              navigator.clipboard.writeText(textOutput);
              toast.success("String copied to the clipboard");
            }}
            className="h-8 rounded-sm font-mono text-xs"
          >
            Copy decoded string
          </Button>
        </div>
      </div>
    </div>
  );
}
