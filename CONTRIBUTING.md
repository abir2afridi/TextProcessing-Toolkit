# Contributing to Text Processing Toolkit

Thanks for your interest in contributing! This document covers everything you need to know to get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Project Overview](#project-overview)
- [Development Workflow](#development-workflow)
- [Adding a New Tool](#adding-a-new-tool)
- [i18n / Translations](#i18n--translations)
- [UI Conventions](#ui-conventions)
- [Code Style](#code-style)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

## Code of Conduct

This project follows a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold its terms. Be respectful, constructive, and inclusive.

## Getting Started

```bash
# Prerequisites: Bun (recommended) or npm
# https://bun.sh

# Clone the repository
git clone https://github.com/anomalyco/TextProcessing-Toolkit.git
cd TextProcessing-Toolkit

# Install dependencies
bun install

# Start the development server
bun run dev

# Open http://localhost:3000 in your browser
```

### Other Commands

```bash
bun run build        # Production build
bun run preview      # Preview production build
bun run lint         # Run ESLint
bun run format       # Format with Prettier
```

## Project Overview

This is a **100% client-side** React application. There is no backend, no database, and no server uploads. All text processing happens in the browser.

### Architecture

- **Tools** — Each utility is a React component in `src/components/tools/`. They follow the same pattern: input → options → output.
- **Tool Registry** — `src/lib/tools-registry.ts` registers all tools with metadata (slug, name, tagline, category, icon, keywords). Tools are lazy-loaded.
- **Routing** — TanStack Router with file-based routes in `src/routes/`. Dynamic tool pages at `tools.$slug.tsx`.
- **i18n** — Translations live in `src/i18n/locales/*.json` for 6 languages.
- **State** — Favorites and theme are persisted to `localStorage`.

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/tools-registry.ts` | Tool metadata and lazy component map |
| `src/components/tools/*.tsx` | Individual tool components |
| `src/components/ToolShell.tsx` | Shared tool wrapper (header, IOPanel, OptionRow) |
| `src/i18n/locales/*.json` | Translation files (en, bn, de, es, fr, zh) |
| `src/lib/storage.ts` | localStorage hooks for favorites and recent tools |
| `src/lib/text-utils.ts` | Shared pure text-processing functions |

## Development Workflow

### Branch Naming

- `feat/<description>` — New tools or features
- `fix/<description>` — Bug fixes
- `refactor/<description>` — Code refactoring
- `docs/<description>` — Documentation changes
- `i18n/<language>` — Translation updates

### Commit Style

Use conventional commits:
```
feat: add UUID generator tool
fix: correct line count in text statistics
i18n(bn): add Bengali translations for new tools
```

## Adding a New Tool

Follow these steps to add a new text utility:

### 1. Create the Component

Create `src/components/tools/YourToolName.tsx`:

```tsx
import { useState } from "react";
import ToolShell, { IOPanel, OptionRow } from "@/components/ToolShell";

export default function YourTool() {
  const [input, setInput] = useState("");
  const output = processYourText(input);

  return (
    <ToolShell>
      <OptionRow>{/* options go here */}</OptionRow>
      <IOPanel value={input} onChange={setInput} output={output} />
    </ToolShell>
  );
}
```

ToolShell automatically provides the tool header, category badge, favorite toggle, and consistent layout.

### 2. Register the Tool

Add your tool to the registry in `src/lib/tools-registry.ts`:

```ts
// Import the lazy component
"your-tool-slug": lazyTool(() => import("@/components/tools/YourToolName")),

// Add metadata to the tools array
{ slug: "your-tool-slug", name: "Your Tool Name", tagline: "Brief description of what it does", category: "Dev Tools", icon: YourIcon, keywords: ["keyword1", "keyword2"] },
```

### 3. Add Translations

Add name and tagline translations in all 6 locale files under the `tools` key.

### 4. Verify

```bash
bun run build
```

Check that the tool appears in search, sidebar, and works correctly.

### Tool Guidelines

- Use `IOPanel` for input and output — never build your own textareas
- Use `OptionRow` for option groupings
- Use `font-mono text-[11px] uppercase tracking-widest text-muted-foreground` for labels
- Use `h-8 rounded-sm font-mono text-xs` for inputs and buttons
- Process text synchronously when possible (no async/await for pure transforms)
- Keep the tool focused on one specific task

## i18n / Translations

Translations are in `src/i18n/locales/`. The project supports: English (en), Bengali (bn), German (de), Spanish (es), French (fr), and Chinese (zh).

When adding a new tool, you must add `name` and `tagline` entries in all 6 locale files under `tools.<slug>`.

When fixing or improving existing translations, update only the affected keys.

## UI Conventions

- **Grid layout**: Tool grids use `grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6`
- **Cards**: `rounded-sm border border-border bg-surface`
- **Badges**: `rounded-sm border-primary/40 bg-primary/10 font-mono text-[10px] uppercase tracking-widest text-primary`
- **Labels**: `font-mono text-[11px] uppercase tracking-widest text-muted-foreground`
- **Inputs/Buttons**: `h-8 rounded-sm font-mono text-xs`
- **Icons**: Use Lucide React icons
- **Theme**: All colors must use CSS variables (`text-muted-foreground`, `bg-surface`, `border-border`, etc.) — never hardcode color values

## Code Style

- **TypeScript** — Strict mode. Avoid `any`. Use proper types.
- **Formatting** — Prettier (run `bun run format` before committing)
- **Imports** — Use `@/` path alias for project imports
- **Components** — Default exports for tool components, named exports for shared components
- **CSS** — Tailwind utility classes only. No CSS modules or styled-components.

## Pull Request Process

1. Create a branch from `main`
2. Make your changes and test them (`bun run dev` + manual testing)
3. Run `bun run build` to verify no build errors
4. Run `bun run lint` to check for lint issues
5. Open a pull request against `main`
6. Fill out the PR template completely
7. Wait for review and address any feedback

## Reporting Bugs

Open a [Bug Report](https://github.com/anomalyco/TextProcessing-Toolkit/issues/new/choose) and include:

- The affected tool name
- Steps to reproduce
- Expected vs actual behavior
- Browser, OS, and app version
- Browser console output
- Sample input that triggers the bug (if applicable)

## Feature Requests

Open a [Feature Request](https://github.com/anomalyco/TextProcessing-Toolkit/issues/new/choose) and describe:

- The problem you are trying to solve
- Your proposed solution
- Who would benefit

Not all feature requests will be accepted. The project aims to stay focused, practical, and maintainable.
