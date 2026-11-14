#!/usr/bin/env node
// npm "prebuild" guard: refuse to build on anything older than Node 24.
//
// Why: production runs on Node 24 (PM2 `interpreter` in ecosystem.config.cjs), but the
// box's shared system /usr/bin/node is still 22 (it serves the other tenants and is not
// upgraded in place) and comes first on a plain shell's PATH. Building with the wrong
// major is easy to do by accident and ships an artefact that was never compiled/traced on
// the runtime it serves on. Build with:
//   PATH=/home/runcloud/.nvm/versions/node/v24.22.3/bin:$PATH npm run build
// (or `nvm use` — .nvmrc pins 24). Keep in step with ecosystem.config.cjs `interpreter`.
const REQUIRED_MAJOR = 24;
const NODE24_BIN = "/home/runcloud/.nvm/versions/node/v24.22.3/bin";

const major = Number(process.versions.node.split(".")[0]);
if (major < REQUIRED_MAJOR) {
  console.error(
    `\n✖ Node ${process.versions.node} at ${process.execPath} — testadhd.ro builds/runs on Node ${REQUIRED_MAJOR}+.\n` +
      `  Use: PATH=${NODE24_BIN}:$PATH npm run build  (or: nvm use)\n`,
  );
  process.exit(1);
}
console.log(`check-node: Node ${process.versions.node} OK (>= ${REQUIRED_MAJOR})`);
