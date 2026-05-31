import { readFileSync, readdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const assetsDir = join(root, "dist", "client", "assets");
const serverAssetsDir = join(root, "dist", "server", "assets");

// Find the manifest file
const manifestFiles = readdirSync(serverAssetsDir).filter((f) =>
  f.startsWith("_tanstack-start-manifest_v-") && f.endsWith(".js"),
);

if (manifestFiles.length === 0) {
  console.error("ERROR: Could not find build manifest");
  process.exit(1);
}

const manifestPath = join(serverAssetsDir, manifestFiles[0]);
const manifestContent = readFileSync(manifestPath, "utf-8");

// Extract clientEntry
const entryMatch = manifestContent.match(/clientEntry:\s*"([^"]+)"/);
if (!entryMatch) {
  console.error("ERROR: Could not extract client entry from manifest");
  process.exit(1);
}
const entryPath = entryMatch[1];
console.log(`Client entry: ${entryPath}`);

// Find CSS file
const cssFiles = readdirSync(assetsDir).filter((f) => f.startsWith("styles-") && f.endsWith(".css"));
const cssPath = cssFiles.length > 0 ? `/assets/${cssFiles[0]}` : "";

// Generate index.html
const html = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Text Processing Toolkit</title>
  <meta name="description" content="116 high-performance text utilities across 14 categories — all in your browser.">
  <script>(function(){try{var t=localStorage.getItem("tpt-theme");if(t==="light"||t==="dark")document.documentElement.className=t;var l=localStorage.getItem("tpt-locale");if(l)document.documentElement.lang=l}catch(e){}})()</script>
  ${cssPath ? `<link rel="stylesheet" href="${cssPath}">` : ""}
  <link rel="icon" type="image/png" href="https://img.icons8.com/?size=100&id=OfjTGv1SlHbW&format=png">
  <meta property="og:title" content="Text Processing Toolkit">
  <meta property="og:description" content="116 high-performance text utilities — all in your browser.">
  <meta property="og:image" content="https://raw.githubusercontent.com/abir2afridi/TextProcessing-Toolkit/main/public/BannerTPT.png">
  <meta name="twitter:card" content="summary_large_image">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="${entryPath}"></script>
</body>
</html>`;

writeFileSync(join(root, "dist", "client", "index.html"), html);
console.log("Generated dist/client/index.html");
