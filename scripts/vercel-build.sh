#!/bin/bash
set -e

npm run build

node scripts/generate-index-html.js
