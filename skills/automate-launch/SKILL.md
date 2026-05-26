---
name: automate-launch
description: Set up automatic launch filing so you don't have to run /launch manually. Use when the user asks to automate launches, set up CI, schedule launches, or says they keep forgetting to run /launch.
---

# Automate Buron launch

## What this does

Set up automatic filing of Buron sources so launches happen without someone remembering to run `/launch`. There are 2 paths — ask the user which they prefer:

1. **CI** — a GitHub Actions workflow that files a source on every PR
2. **Editor automation** — a recurring task in the current editor that runs `/launch` on a schedule or trigger

If the user isn't sure, recommend CI — it catches every PR automatically.

## Path 1: CI automation

Run the CLI command:

```bash
buron setup-ci
```

This walks through:
- Picking the AI agent for CI (Claude Code, Cursor, or Codex)
- Creating the GitHub Actions workflow at `.github/workflows/buron.yml`
- Setting the `BURON_TOKEN` and provider API key as GitHub secrets

After setup, every PR files a source to Buron automatically. The user doesn't need to think about it.

Confirm the workflow file exists and secrets are set before finishing.

## Path 2: editor automation

Set up a recurring task that runs `/launch` in the current editor. The specifics depend on which editor you're running in — use your own automation or scheduling features to wire it up.

### What the automation should do

The recurring task should:

1. Run the `/launch` skill from the skills directory in this repo
2. Gather the full git diff, commit messages, PR thread, code comments, and any changed docs
3. Write the structured source file and push it to Buron

### Claude Code

If Buron's MCP server is connected, the CLI is already authenticated — no extra token setup needed.

Use Claude Code's built-in routine or scheduling features to create a recurring task that runs `/launch`. Ask the user when they want it to run — after every commit, on a schedule, or manually triggered.

### Cursor

Use Cursor's built-in automation or rules features to create a task that runs `/launch` after merges or on the user's preferred trigger.

### Codex

Use Codex's built-in task or automation features to create a recurring task that runs `/launch`. Ask the user when they want it to run.

### Other editors

Fall back to CI automation (path 1). Editor-level automation isn't available for every agent runtime.

## After setup

Confirm to the user:
- Which automation path was set up
- How to verify it's working (trigger a test run or check for the source file)
- That Buron handles everything downstream — content generation, campaign updates, performance tracking
