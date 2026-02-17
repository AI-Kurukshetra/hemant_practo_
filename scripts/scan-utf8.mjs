import { readdirSync, readFileSync, statSync } from "fs";
import { join, extname } from "path";

const root = process.cwd();
const ignoreDirs = new Set(["node_modules", ".next", ".git"]);
const textExtensions = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".json", ".css", ".md", ".sql", ".env", ".txt", ".yml", ".yaml",
  ".config", ".map"
]);

const decoder = new TextDecoder("utf-8", { fatal: true });
let bad = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (!ignoreDirs.has(entry)) walk(full);
      continue;
    }

    const ext = extname(entry).toLowerCase();
    if (!textExtensions.has(ext) && !entry.startsWith(".")) {
      continue;
    }

    try {
      const bytes = readFileSync(full);
      decoder.decode(bytes);
    } catch {
      bad.push(full);
    }
  }
}

walk(root);
if (bad.length) {
  console.error("Invalid UTF-8 files:");
  for (const f of bad) console.error(f);
  process.exit(1);
}

console.log("No invalid UTF-8 text files found.");
