# buron-plugin

The Buron plugin for AI IDEs. Installing it connects your repo to the Buron MCP server and adds editor skills for capturing launches, setting up Google Ads conversion tracking, and automating marketing workflows.

## What you get

- **MCP connection** to `app.buron.ai` — your IDE agent can read and write files in your team's library, query Google Ads, list dashboards, and run the same operations the Buron CLI exposes.
- **Editor skills** that the agent can invoke:
  - `/launch` — capture what you shipped and push a structured snapshot to Buron
  - `/setup-google-ads-tracking` — walk through a conversion-tracking spec and audit the implementation in your repo
  - `/automate-launch` — set up CI so launches file themselves on every PR

## Install

### Claude Code

```bash
/plugin install buron-ai/buron-plugin
```

Or, manually, drop a `.mcp.json` at your repo root:

```json
{
  "mcpServers": {
    "buron": { "type": "http", "url": "https://app.buron.ai/api/mcp" }
  }
}
```

### Cursor

Install via Cursor's plugin browser, or add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "buron": { "type": "http", "url": "https://app.buron.ai/api/mcp" }
  }
}
```

### OpenAI Codex

Coming soon. For now use [`@buron/cli`](https://github.com/buron-ai/buron-cli) — `buron setup` configures Codex directly.

### Other IDEs

Any IDE that supports the MCP HTTP transport can connect to `https://app.buron.ai/api/mcp`. Auth flows through OAuth on first use.

## First run

After install, the first time you use a Buron MCP tool (or run any skill), the agent will open `app.buron.ai` in your browser for OAuth. Sign in, approve, and the tools light up.

Once connected, try:

```
/launch
```

…after shipping a PR, or:

```
/setup-google-ads-tracking
```

…to audit conversion tracking for the product in your current repo.

## Repository layout

```
.mcp.json                            MCP server registration
.claude-plugin/plugin.json           Claude Code manifest
.cursor-plugin/plugin.json           Cursor manifest
.plugin/plugin.json                  Generic / fallback manifest
skills/
  launch/SKILL.md                    Agent-discovered guidance
  setup-google-ads-tracking/SKILL.md
  automate-launch/SKILL.md
commands/
  launch.md                          User-invoked slash command: /buron:launch
hooks/
  hooks.json                         Claude Code hook registration
  session-start-welcome.mjs          Prints a presence indicator at session start
```

`skills/` are guidance the agent picks up by conversational match (description-based). `commands/` are explicit slash commands the user types — they follow a deterministic Preflight → Plan → Commands → Verification structure.

Skill and command bodies in this repo are the source of truth. Other Buron surfaces (the CLI's bundled templates, the in-app skill catalog) sync from here.

## Related

- [buron-ai/buron-cli](https://github.com/buron-ai/buron-cli) — headless CLI for the same backend; use it in CI, scripts, or any non-agent context.

## License

MIT
