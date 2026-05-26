#!/usr/bin/env node

import { readFileSync } from "node:fs";

// Drain stdin — Claude Code sends a JSON envelope on SessionStart that we
// don't need for a presence indicator. Reading it avoids EPIPE on some
// shells when the hook exits before the producer flushes.
try {
  readFileSync(0, "utf8");
} catch {
  // No stdin — fine.
}

// v0.1.0: presence-only welcome. The hook running at all proves the plugin
// is installed. A future version will hit a backend whoami endpoint and
// print "Connected as <email> / <org> / <team>" — that needs server work
// first (see plugin README + buron-app/app/api/mcp/route.ts).
const message = [
  "✓ Buron plugin loaded. The Buron MCP server at app.buron.ai is",
  "registered for this session. Authenticate by invoking any Buron tool —",
  "your IDE will open a browser for OAuth on first use.",
].join(" ");

process.stdout.write(`${message}\n`);
