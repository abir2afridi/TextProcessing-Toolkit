# Text Processing Toolkit (tpt)

[![Built with React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![TanStack Router](https://img.shields.io/badge/TanStack_Router-1.168-FF4154)](https://tanstack.com/router)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?logo=cloudflare&logoColor=white)](https://cloudflare.com)
[![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

A free, open-source collection of **130 high-performance text utilities** that run entirely in your browser. Nothing is uploaded — every operation happens locally on your machine.

> **Built for text. Powered by the browser.**

---

## Features

- **100% private** — zero server uploads, no analytics, no tracking, data never leaves your device
- **126 tools & growing** — 14 categories from Base64 to bcrypt, JSON to TOML, regex to QR
- **Instant execution** — no reloads, no API calls, results appear as you type
- **Consistent interface** — every tool follows the same input/output panel pattern with drag-and-drop file support
- **Unicode-safe** — full support for CJK, Arabic, Cyrillic, emoji, and multi-byte characters
- **Works offline** — once loaded, most tools require no network connection
- **Dark & Light theme** — toggleable, persisted to `localStorage`
- **Responsive** — works on desktop, tablet, and mobile
- **6 languages** — English, বাংলা, Deutsch, Español, Français, 中文
- **Free & open-source** — MIT-licensed, fully auditable, no sign-up needed

---

## Use Cases

| For | What You Can Do |
|-----|-----------------|
| **Developers** | Format JSON/XML/SQL/YAML/TOML, encode/decode Base64/URL/HTML, hash strings, test regex, decode JWT, generate UUIDs/ULIDs/tokens, convert timestamps |
| **Data Professionals** | Clean CSV, convert between JSON/CSV/XML/YAML/TOML, extract emails/URLs/phones, analyze word frequency, compare text diffs |
| **Writers & Editors** | Convert case, deduplicate lines, count words/characters, generate lorem ipsum, sort lines, wrap text, remove whitespace |
| **Security Professionals** | Hash with bcrypt, encrypt/decrypt with AES, generate RSA keys, analyze password strength, generate TOTP/HOTP codes, create BIP39 passphrases |

---

## Categories & Tools

| Category | Count | Tools |
|----------|:-----:|-------|
| **Core Tools** | 5 | Text Tracker & Remover, Text Repeater, Symbol Tracker & Multiplier, Symbol Filter & Bulk Remove, Global Text Formatter |
| **Text Utilities** | 20 | Case Converter, Smart Replace, Whitespace Cleaner, Duplicate Remover, Line Tools, Text Compare, Find & Replace, Remove Duplicate Lines, Reverse Text, Sort Lines, Text Statistics, Word Frequency, Word Wrap, Line Numbering, Indent Tool, Prefix/Suffix, String Obfuscator, Numeronym Generator, Regex Cheatsheet, List Converter |
| **Extractors** | 5 | URL Extractor, Email Extractor, Phone Extractor, Hashtag Extractor, Pattern Extractor |
| **Crypto & Security** | 11 | Bcrypt Hash, Encrypt/Decrypt, Password Strength, HMAC Generator, RSA Key Generator, Token Generator, ULID Generator, BIP39 Passphrase, OTP Generator, Basic Auth Generator, PDF Signature Checker |
| **Converters** | 10 | Roman Numeral, Base64 File, JSON ↔ XML, XML ↔ JSON, JSON ↔ CSV, TOML Converter, Text to ASCII Binary, Text to Unicode, YAML ↔ TOML, YAML ↔ JSON |
| **Web** | 10 | Device Info, OG Meta Generator, Keycode Info, User-Agent Parser, HTTP Status Codes, JSON Diff Viewer, MIME Types, HTML WYSIWYG Editor, Outlook Safelink Decoder, Camera Recorder |
| **Images & Videos** | 13 | QR Code Generator, WiFi QR Code, SVG Placeholder, Palette Generator, Background Remover *(AI-powered)*, Matte Generator, Seamless Scroll Generator, Social Media Cropper, Watermarker, Colour Blindness Simulator, Contrast Checker, Gradient Generator, Harmony Generator |
| **Development** | 6 | Benchmark Builder, Git Cheatsheet, Port Generator, Crontab Generator, Chmod Calculator, Email Normalizer |
| **Network** | 6 | IPv4 Range Expander, IPv4 Subnet Calculator, IPv4 Converter, IPv6 ULA Generator, MAC Address Lookup, MAC Generator |
| **Math** | 3 | Math Evaluator, Percentage Calculator, ETA Calculator |
| **Measurement** | 2 | Chronometer, Temperature Converter |
| **Data** | 2 | IBAN Validator, Phone Formatter |
| **Dev Tools** | 27 | JSON Minify, Docker Run to Compose, Regex Playground, JSON Formatter, HTML Cleaner, Markdown Formatter, Slug Generator, Keyword Density, Base64 Encode/Decode, Hash Generator, Hex/Binary, HTML Entities, JWT Decoder, Morse Code, NATO Phonetic, Number Base, Password Generator, SQL Formatter, String Escape, Timestamp Converter, URL Encoder/Decoder, URL Parser, UUID Generator, Color Converter, CSV ↔ JSON, XML Formatter, YAML Prettify |
| **Advanced** | 10 | Emoji Picker, Invisible Character Detector, Unicode Cleaner, Emoji Manager, ASCII Banner, Character Frequency, Cipher, Lorem Ipsum Generator, Random Picker, Unicode Inspector |

### Capabilities Overview

- **Format & beautify** — JSON, XML, SQL, YAML, TOML, HTML, Markdown
- **Extract & find** — URLs, emails, phones, hashtags, custom regex patterns
- **Encode & encrypt** — Base64, URL, HTML entities, JWT, bcrypt, AES, RSA
- **Convert formats** — JSON ↔ CSV, XML ↔ JSON, YAML ↔ TOML, Markdown ↔ HTML, number bases
- **Analyze & measure** — word frequency, character distribution, keyword density, reading time, text diff
- **Clean & normalize** — deduplicate, trim whitespace, fix line endings, normalize Unicode, strip HTML tags
- **Generate & create** — QR codes, WiFi QR codes, passwords, tokens, UUIDs, ULIDs, lorem ipsum, ASCII banners
- **Network & dev tools** — IPv4 subnet calculator, MAC address lookup, port generator, crontab builder, chmod calculator
- **Check & validate** — password strength, IBAN validation, phone formatting, email validation, MIME types, HTTP status codes

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19 + TypeScript 5.8 |
| **Build tool** | Vite 7 |
| **Routing** | TanStack React Router 1.168 |
| **Server state** | TanStack React Query 5.83 |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | shadcn/ui (New York) + Radix UI primitives |
| **Icons** | Lucide React 0.575 |
| **Charts** | Recharts 2.15 |
| **Forms** | react-hook-form + zod |
| **Crypto** | bcryptjs, crypto-js, node-forge |
| **AI/ML** | @huggingface/transformers, onnxruntime-web (browser-only) |
| **Rich Text** | TipTap Editor |
| **Notifications** | sonner |
| **i18n** | i18next + react-i18next |
| **Runtime** | Bun |
| **Deployment** | Cloudflare Workers / Vercel Serverless |

---

## Getting Started

```bash
# Prerequisites: Bun (recommended) or npm
# https://bun.sh

# Clone the repository
git clone https://github.com/abir2afridi/TextProcessing-Toolkit.git
cd TextProcessing-Toolkit

# Install dependencies
bun install

# Start development server
bun run dev

# Open http://localhost:3000 in your browser
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server with HMR |
| `bun run build` | Production build for Cloudflare |
| `bun run build:vercel` | Production build for Vercel |
| `bun run build:dev` | Development-mode build |
| `bun run preview` | Preview production build locally |
| `bun run deploy` | Build + deploy to Cloudflare Workers |
| `bun run lint` | Run ESLint across the project |
| `bun run format` | Format all files with Prettier |

### Deployment

```bash
# Cloudflare Workers (default)
bun run deploy

# Vercel (requires separate config)
bun run build:vercel
# Then deploy the dist/client folder via Vercel
```

Vercel deployment uses a custom `vite.config.vercel.ts` with SSR via TanStack Start. Browser-only ML packages (`@huggingface/transformers`, `onnxruntime-web`) are excluded from server bundles using `import.meta.env.SSR` guards to stay within Vercel's 250 MB Lambda limit. Cloudflare deployment uses the default `vite.config.ts` with `@cloudflare/vite-plugin`.

---

## Project Structure

```
TextProcessing-Toolkit/
├── api/                    # Vercel serverless function entry
├── docs/                   # Documentation and planning
├── public/                 # Static assets (favicon, OG images)
├── scripts/                # Build and utility scripts
├── src/
│   ├── components/
│   │   ├── tools/          # Individual tool components (120+)
│   │   └── ...             # Shared UI (ToolShell, sidebar, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── i18n/
│   │   ├── locales/        # Translation files (en, bn, de, es, fr, zh)
│   │   └── config.ts       # i18next configuration
│   ├── lib/                # Shared code (tools registry, storage, utilities)
│   ├── routes/             # Application pages (home, tools, about, dev)
│   ├── styles.css          # Global styles / Tailwind CSS v4
│   ├── router.tsx          # TanStack Router configuration
│   ├── server.ts           # Cloudflare Workers server entry
│   ├── server.vercel.ts    # Vercel SSR server entry
│   └── start.ts            # Application bootstrap
├── .github/                # GitHub community files and CI/CD workflows
│   ├── ISSUE_TEMPLATE/     # Issue forms (bug, feature, UI/UX, tool request)
│   ├── workflows/          # CI/CD pipelines (label sync, auto-label, stale)
│   ├── labels.yml          # Repository label definitions
│   └── labeler.yml         # Auto-label rules
├── vite.config.ts          # Vite config (Cloudflare)
├── vite.config.vercel.ts   # Vite config (Vercel)
├── wrangler.jsonc          # Cloudflare Workers config
├── vercel.json             # Vercel deployment config
├── tsconfig.json           # TypeScript strict mode config
├── eslint.config.js        # ESLint flat config
├── .prettierrc             # Prettier config
├── bunfig.toml             # Bun security config
└── components.json         # shadcn/ui config
```

---

## Architecture

- **100% client-side** — no backend, no database, no server uploads; all text processing happens in the browser
- **Tool registry** (`src/lib/tools-registry.ts`) — centralized metadata for all tools with lazy-loaded components per route
- **Favorites & recent tools** — persisted to `localStorage` via `src/lib/storage.ts`
- **Theme** — dark/light toggle persisted to `localStorage("tpt-theme")`
- **Language** — locale detected from `localStorage("tpt-locale")` or `navigator.language`, persisted on change
- **TanStack Router** — file-based routing with auto-generated `routeTree.gen.ts`
- **SSR** — TanStack Start provides server-side rendering on Vercel; Cloudflare Workers runs the edge runtime
- **Browser-only ML** — AI tools (Background Remover) use `import.meta.env.SSR` guards to exclude heavy ML packages from server bundles, keeping Vercel Lambda under 250 MB
- **Cloudflare-ready** — deployable via `@cloudflare/vite-plugin` and `wrangler`

### Data Privacy

This application is designed with privacy as a core principle:
- **Zero data uploads** — all processing is done client-side using JavaScript
- **No tracking** — no analytics, no telemetry, no fingerprinting scripts
- **No sign-up** — no accounts, no authentication, no user profiles
- **Open source** — the entire codebase is MIT-licensed and fully auditable
- Verify for yourself: open your browser's developer tools → Network tab → see that no data is ever transmitted

---

## i18n / Internationalization

The toolkit is fully translated into **6 languages**:

| Code | Language | Native Name |
|------|----------|-------------|
| `en` | English | English |
| `bn` | Bengali | বাংলা |
| `de` | German | Deutsch |
| `es` | Spanish | Español |
| `fr` | French | Français |
| `zh` | Chinese | 中文 |

Language is auto-detected from your browser settings and can be changed via the language switcher in the sidebar. All tool names, descriptions, UI labels, and tooltips are translated.

---

## Roadmap

- [ ] More tools (community-driven additions)
- [ ] Batch processing — process multiple inputs at once
- [ ] Workspace presets — save and restore tool configurations
- [ ] Plugin system — community-built tools via external plugins
- [ ] More languages — expand i18n coverage
- [ ] CLI version — terminal-based text processing

---

## Community & Contributing

We welcome contributions of all kinds! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Development setup and prerequisites
- How to add a new tool (component → registry → translations)
- Translation workflow for i18n
- UI conventions and code style
- Pull request process and checklist

### Issue Templates

When opening an issue, please use the appropriate template:

- [🐛 Bug Report](.github/ISSUE_TEMPLATE/bug_report.yml) — for bugs and unexpected behavior
- [💡 Feature Request](.github/ISSUE_TEMPLATE/feature_request.yml) — for new features or enhancements
- [🎨 UI/UX Issue](.github/ISSUE_TEMPLATE/05-ui-ux.yml) — for visual or usability problems
- [🔧 Tool Request](.github/ISSUE_TEMPLATE/10-tool-request.yml) — for new text-processing tool ideas

### Project Standards

- **Code of Conduct** — all contributors must follow our [Code of Conduct](CODE_OF_CONDUCT.md)
- **Conventional Commits** — commit messages follow the conventional commits format (`feat:`, `fix:`, `i18n:`, etc.)
- **Branch naming** — `feat/<description>`, `fix/<description>`, `refactor/<description>`, `docs/<description>`, `i18n/<language>`

### CI/CD

The repository includes automated GitHub Actions workflows:

| Workflow | Purpose |
|----------|---------|
| **Label Sync** | Syncs repository labels from `.github/labels.yml` on push to main |
| **Auto Label** | Automatically labels issues and PRs based on changed file paths |
| **PR Size** | Labels pull requests by size (XS → XL) based on line count |
| **Stale Management** | Marks inactive issues (60d) and PRs (30d), closes after 14 more days |

---

## License

MIT
