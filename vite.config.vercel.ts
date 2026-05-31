import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    server: { entry: "server.vercel" },
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
