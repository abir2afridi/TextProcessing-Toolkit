# Text Processing Toolkit (tpt)

A free, open-source collection of **115+ high-performance text utilities** that run entirely in your browser. Nothing is uploaded — every operation happens locally on your machine.

[![Built with React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![TanStack Router](https://img.shields.io/badge/TanStack_Router-1.168-FF4154)](https://tanstack.com/router)

---

## Features

- **100% client-side** — all processing happens in your browser, zero server uploads
- **115+ tools** across 14 categories (Text Utilities, Converters, Crypto, Web, Math, Dev Tools, Networks, Advanced, etc.)
- **Works offline** — once loaded, most tools require no network connection
- **Unicode-safe** — full support for multi-byte characters, emoji, and special scripts
- **Consistent UI** — every tool follows the same interaction pattern with input/output panels and action buttons
- **Dark & Light theme** — toggleable, persisted to localStorage
- **Responsive** — works on desktop, tablet, and mobile
- **Privacy-first** — no telemetry, no tracking, no data collection
- **Free & open-source** — MIT-licensed

---

## Categories & Tools

| Category | Tools |
|---|---|
| **Core Tools** (5) | Text Tracker & Remover, Text Repeater, Symbol Tracker & Multiplier, Symbol Filter & Bulk Remove, Global Text Formatter |
| **Text Utilities** (20) | Case Converter, Smart Replace, Whitespace Cleaner, Duplicate Remover, Line Tools, Text Compare, Find & Replace, Remove Duplicate Lines, Reverse Text, Sort Lines, Text Statistics, Word Frequency, Word Wrap, Line Numbering, Indent Tool, Prefix/Suffix, String Obfuscator, Numeronym Generator, Regex Cheatsheet, List Converter |
| **Extractors** (5) | URL Extractor, Email Extractor, Phone Extractor, Hashtag Extractor, Pattern Extractor |
| **Crypto & Security** (11) | Bcrypt Hash, Encrypt/Decrypt, Password Strength, HMAC Generator, RSA Key Generator, Token Generator, ULID Generator, BIP39 Passphrase, OTP Generator, Basic Auth Generator, PDF Signature Checker |
| **Converters** (10) | Roman Numeral, Base64 File, JSON ↔ XML, XML ↔ JSON, JSON ↔ CSV, TOML Converter, Text to ASCII Binary, Text to Unicode, YAML ↔ TOML, YAML ↔ JSON |
| **Web** (10) | Device Info, OG Meta Generator, Keycode Info, User-Agent Parser, HTTP Status Codes, JSON Diff Viewer, MIME Types, HTML WYSIWYG Editor, Outlook Safelink Decoder, Camera Recorder |
| **Images & Videos** (3) | QR Code Generator, WiFi QR Code, SVG Placeholder |
| **Development** (5) | Git Cheatsheet, Port Generator, Crontab Generator, Chmod Calculator, Email Normalizer |
| **Network** (4) | IPv4 Subnet Calculator, IPv4 Converter, IPv6 ULA Generator, MAC Generator |
| **Math** (3) | Math Evaluator, Percentage Calculator, ETA Calculator |
| **Measurement** (2) | Chronometer, Temperature Converter |
| **Data** (2) | IBAN Validator, Phone Formatter |
| **Dev Tools** (27) | JSON Minify, Docker Run to Compose, Regex Playground, JSON Formatter, HTML Cleaner, Markdown Formatter, Slug Generator, Keyword Density, Base64 Encode/Decode, Hash Generator, Hex/Binary, HTML Entities, JWT Decoder, Morse Code, NATO Phonetic, Number Base, Password Generator, SQL Formatter, String Escape, Timestamp Converter, URL Encoder/Decoder, URL Parser, UUID Generator, Color Converter, CSV ↔ JSON, XML Formatter, YAML Prettify |
| **Advanced** (9) | Invisible Character Detector, Unicode Cleaner, Emoji Manager, ASCII Banner, Character Frequency, Cipher, Lorem Ipsum Generator, Random Picker, Unicode Inspector |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + TypeScript 5.8 |
| **Build tool** | Vite 7 |
| **Routing** | TanStack React Router 1.168 |
| **Server state** | TanStack React Query 5.83 |
| **Styling** | Tailwind CSS v4 |
| **UI** | Radix UI primitives + shadcn/ui |
| **Icons** | Lucide React 0.575 |
| **Charts** | Recharts 2.15 |
| **Forms** | react-hook-form + zod |
| **Crypto** | bcryptjs, crypto-js |
| **Notifications** | sonner |
| **Deployment** | Cloudflare |

---

## Getting Started

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Lint
bun run lint

# Format
bun run format
```

---

## Project Structure

```
src/
  components/     -- UI components (tools, shell, shared)
  hooks/          -- Custom React hooks
  lib/            -- Shared library code (tools registry, storage, utilities)
  routes/         -- Application pages (home, tools, about, dev)
  styles.css      -- Global styles / Tailwind CSS config
  router.tsx      -- Router configuration
  server.ts       -- Server entry point
  start.ts        -- Application bootstrap
```

---

## Architecture

- **100% client-side SPA** — no backend, no database, no server uploads
- **Tool registry** (`src/lib/tools-registry.ts`) — centralized tool metadata, lazy-loaded per route
- **Favorites** — persisted to localStorage via `src/lib/storage.ts`
- **Theme** — dark/light toggle persisted to `localStorage("tpt-theme")`
- **TanStack Router** — file-based routing with auto-generated `routeTree.gen.ts`
- **Cloudflare-ready** — deployable to Cloudflare via `@cloudflare/vite-plugin`

---

## License

MIT
