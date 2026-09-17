import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

// Local fallback packager for the verified static export. No source files or secrets.
const manifest=JSON.parse(readFileSync(".openai/hosting.json","utf8"));
const output=resolve(manifest.static.directory);
readFileSync(resolve(output,"index.html"));
const stage=resolve("work/static-package");
mkdirSync(resolve(stage,".openai"),{recursive:true});
cpSync(output,resolve(stage,"dist"),{recursive:true});
manifest.static.directory="dist";
writeFileSync(resolve(stage,".openai/hosting.json"),JSON.stringify(manifest,null,2));
const result=spawnSync("tar",["-czf",resolve("work/framepick-site.tar.gz"),"-C",stage,".openai","dist"],{stdio:"inherit"});
if(result.status!==0)process.exit(result.status??1);
console.log(resolve("work/framepick-site.tar.gz"));
