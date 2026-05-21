// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    define: {
      global: "globalThis",
    },
    optimizeDeps: {
      include: [
        "json5",
        "@scure/bip39",
        "@scure/bip39/wordlists/english.js",
        "@scure/bip39/wordlists/czech.js",
        "@scure/bip39/wordlists/french.js",
        "@scure/bip39/wordlists/italian.js",
        "@scure/bip39/wordlists/japanese.js",
        "@scure/bip39/wordlists/korean.js",
        "@scure/bip39/wordlists/portuguese.js",
        "@scure/bip39/wordlists/simplified-chinese.js",
        "@scure/bip39/wordlists/spanish.js",
        "@scure/bip39/wordlists/traditional-chinese.js",
      ],
    },
  },
});
