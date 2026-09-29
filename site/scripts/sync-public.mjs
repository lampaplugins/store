import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const siteDir = join(scriptsDir, "..");
const root = join(siteDir, "..");
const publicDir = join(siteDir, "public");
const dataDir = join(siteDir, "src", "data");

mkdirSync(publicDir, { recursive: true });
mkdirSync(dataDir, { recursive: true });

function clearSynced() {
  if (!existsSync(publicDir)) return;
  for (const name of readdirSync(publicDir)) {
    if (name === "extensions.json" || name.endsWith(".js") || name === "pavelpikta" || name === "wmajiug3e") {
      rmSync(join(publicDir, name), { recursive: true, force: true });
    }
  }
}

clearSynced();

cpSync(join(root, "extensions.json"), join(publicDir, "extensions.json"));
cpSync(join(root, "extensions.json"), join(dataDir, "extensions.json"));

for (const name of readdirSync(root)) {
  if (!name.endsWith(".js")) continue;
  cpSync(join(root, name), join(publicDir, name));
}

for (const dir of ["pavelpikta", "wmajiug3e"]) {
  const src = join(root, dir);
  if (existsSync(src)) cpSync(src, join(publicDir, dir), { recursive: true });
}

console.log("sync-public: copied catalog assets → site/public/");
