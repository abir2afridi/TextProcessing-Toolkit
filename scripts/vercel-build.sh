#!/bin/bash
set -e

# Build with Vercel-specific config (no Cloudflare plugin)
npx vite build --config vite.config.vercel.ts
