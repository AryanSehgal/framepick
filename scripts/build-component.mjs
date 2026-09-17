import { spawnSync } from "node:child_process";
import { mkdirSync, copyFileSync } from "node:fs";
import { resolve } from "node:path";
function run(args) {
  const result = spawnSync(process.execPath, args, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
run([
  "node_modules/vite/bin/vite.js",
  "build",
  "--config",
  "packages/react/vite.config.ts",
]);
run([
  "node_modules/typescript/bin/tsc",
  "-p",
  "packages/react/tsconfig.build.json",
]);
mkdirSync("public/downloads", { recursive: true });
const pack = spawnSync(
  "npm",
  ["pack", "--pack-destination", resolve("public/downloads")],
  { cwd: "packages/react", stdio: "inherit" },
);
if (pack.status !== 0) process.exit(pack.status ?? 1);
copyFileSync(
  "packages/react/README.md",
  "public/downloads/component-readme.md",
);
