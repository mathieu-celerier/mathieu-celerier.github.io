import { execFileSync } from "node:child_process";

function run(cmd, args) {
  execFileSync(cmd, args, { stdio: "inherit" });
}

run("node", ["scripts/bibtex-to-astro.mjs"]); // your existing publications generator
run("node", ["scripts/gen-cv.mjs"]); // new CV generator+compiler
