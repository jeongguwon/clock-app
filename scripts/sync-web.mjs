import { cp, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const webDir = path.join(rootDir, "web");

const files = ["index.html", "main.js", "styles.css", "staticwebapp.config.json"];

await mkdir(webDir, { recursive: true });

for (const fileName of files) {
  const from = path.join(rootDir, fileName);
  const to = path.join(webDir, fileName);
  await cp(from, to, { force: true });
}

console.log("Synced static files to web/ for Azure deploy.");
