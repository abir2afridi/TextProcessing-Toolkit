import { useState, useMemo, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { HmacSHA1, enc } from "crypto-js";
import QRCode from "qrcode";
import { toast } from "sonner";

const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32toHex(base32: string) {
  const bits = base32
    .toUpperCase()
    .replace(/=+$/, "")
    .split("")
    .map((c) => BASE32_CHARS.indexOf(c).toString(2).padStart(5, "0"))
    .join("");
  return (bits.match(/.{1,8}/g) ?? [])
    .map((chunk) => Number.parseInt(chunk, 2).toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string) {
  return (hex.match(/.{1,2}/g) ?? []).map((c) => Number.parseInt(c, 16));
}

function generateHOTP({ key, counter = 0 }: { key: string; counter?: number }) {
  const digest = HmacSHA1(enc.Hex.parse(counter.toString(16).padStart(16, "0")), enc.Hex.parse(base32toHex(key))).toString(enc.Hex);
  const bytes = hexToBytes(digest);
  const offset = bytes[19] & 0xf;
  const v = ((bytes[offset] & 0x7f) << 24) | ((bytes[offset + 1] & 0xff) << 16) | ((bytes[offset + 2] & 0xff) << 8) | (bytes[offset + 3] & 0xff);
  return String(v % 1000000).padStart(6, "0");
}

function generateTOTP({ key, now = Date.now() }: { key: string; now?: number }) {
  const counter = Math.floor(now / 1000 / 30);
  return generateHOTP({ key, counter });
}

function generateSecret() {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += BASE32_CHARS[arr[i] % 32];
  }
  return result;
}

function buildKeyUri({ secret, app = "TPT", account = "demo-user" }: { secret: string; app?: string; account?: string }) {
  const params = new URLSearchParams({ issuer: app, secret, algorithm: "SHA1", digits: "6", period: "30" });
  return `otpauth://totp/${encodeURIComponent(app)}:${encodeURIComponent(account)}?${params.toString()}`;
}

export default function OTPGenerator() {
  const [secret, setSecret] = useState(generateSecret);
  const [now, setNow] = useState(Date.now());
  const [qrcode, setQrcode] = useState("");

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  const keyUri = useMemo(() => buildKeyUri({ secret }), [secret]);

  useEffect(() => {
    QRCode.toDataURL(keyUri, { width: 210, margin: 1 }).then(setQrcode);
  }, [keyUri]);

  const interval = (now / 1000) % 30;
  const tokens = useMemo(
    () => ({
      previous: generateTOTP({ key: secret, now: now - 30000 }),
      current: generateTOTP({ key: secret, now }),
      next: generateTOTP({ key: secret, now: now + 30000 }),
    }),
    [secret, now],
  );

  const secretHex = useMemo(() => base32toHex(secret), [secret]);
  const epoch = Math.floor(now / 1000);
  const counter = Math.floor(now / 1000 / 30);

  const secretValid = secret.toUpperCase().match(/^[A-Z234567]+$/);

  return (
    <div className="flex flex-wrap gap-6">
      <div className="min-w-[300px] flex-1 space-y-4">
        <div className="rounded-sm border border-border bg-surface p-4">
          <Label className="mb-1 block font-mono text-[11px] text-muted-foreground">Secret</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                value={secret}
                onChange={(e) => setSecret(e.target.value.toUpperCase())}
                placeholder="Paste your TOTP secret..."
                className={`h-8 w-full rounded-sm font-mono text-xs ${!secretValid ? "border-destructive" : ""}`}
              />
              {!secretValid && (
                <span className="mt-0.5 block font-mono text-[10px] text-destructive">Secret should be a base32 string</span>
              )}
            </div>
            <Button
              size="sm"
              onClick={() => setSecret(generateSecret())}
              className="h-8 w-8 rounded-sm p-0"
              title="Generate a new random secret"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9"/><path d="M21 3v6h-6"/></svg>
            </Button>
          </div>
        </div>

        <div className="rounded-sm border border-border bg-surface p-4">
          <div className="mb-1 text-center font-mono text-xs font-semibold text-foreground">Current OTP</div>
          <div className="flex">
            <button
              onClick={() => { navigator.clipboard.writeText(tokens.previous); toast.success("Copied previous OTP"); }}
              className="flex-1 border border-border bg-background px-2 py-3 font-mono text-sm text-foreground hover:bg-surface rounded-l-sm"
              title="Copy previous OTP"
            >
              {tokens.previous}
            </button>
            <button
              onClick={() => { navigator.clipboard.writeText(tokens.current); toast.success("Copied current OTP"); }}
              className="flex-[2] border-y border-x-0 border-border bg-background px-2 py-3 font-mono text-2xl text-foreground hover:bg-surface"
              title="Copy current OTP"
            >
              {tokens.current}
            </button>
            <button
              onClick={() => { navigator.clipboard.writeText(tokens.next); toast.success("Copied next OTP"); }}
              className="flex-1 border border-border bg-background px-2 py-3 font-mono text-sm text-foreground hover:bg-surface rounded-r-sm"
              title="Copy next OTP"
            >
              {tokens.next}
            </button>
          </div>

          <div className="mt-2">
            <div className="relative h-2 w-full overflow-hidden rounded-sm bg-border">
              <div
                className="h-full rounded-sm bg-primary transition-all duration-100"
                style={{ width: `${(100 * interval) / 30}%` }}
              />
            </div>
            <div className="mt-1 text-center font-mono text-[11px] text-muted-foreground">
              Next in {String(Math.floor(30 - interval)).padStart(2, "0")}s
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 rounded-sm border border-border bg-surface p-4">
          {qrcode && <img src={qrcode} alt="OTP Key URI QR Code" className="h-[210px] w-[210px]" />}
          <a
            href={keyUri}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center justify-center rounded-sm bg-primary px-4 font-mono text-xs text-primary-foreground hover:bg-primary/90"
          >
            Open Key URI in new tab
          </a>
        </div>
      </div>

      <div className="min-w-[280px] flex-1 space-y-4">
        <div className="rounded-sm border border-border bg-surface p-4">
          <div className="mb-1 font-mono text-[11px] text-muted-foreground">Secret in hexadecimal</div>
          <div className="break-all rounded-sm bg-background px-3 py-2 font-mono text-xs text-foreground">
            {secretHex || "Secret in hex will be displayed here"}
          </div>
        </div>

        <div className="rounded-sm border border-border bg-surface p-4">
          <div className="mb-1 font-mono text-[11px] text-muted-foreground">Epoch</div>
          <div className="rounded-sm bg-background px-3 py-2 font-mono text-xs text-foreground">
            {epoch}
          </div>
        </div>

        <div className="rounded-sm border border-border bg-surface p-4">
          <div className="font-mono text-[11px] text-muted-foreground">Iteration</div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-[90px] font-mono text-[11px] text-muted-foreground">Count :</span>
              <div className="flex-1 rounded-sm bg-background px-3 py-1.5 font-mono text-xs text-foreground">{counter}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-[90px] font-mono text-[11px] text-muted-foreground">Padded hex :</span>
              <div className="flex-1 rounded-sm bg-background px-3 py-1.5 font-mono text-xs text-foreground">
                {counter.toString(16).padStart(16, "0")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
