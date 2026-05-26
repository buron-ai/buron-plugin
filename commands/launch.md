---
description: File a structured snapshot of what changed in this repo as a Buron source. Captures the diff, PR thread, commits, and screenshots; Buron's curator clusters sources into launches and generates marketing assets downstream.
---

# Launch

Capture what just shipped (or is about to ship) and file it as a Buron source. Buron's curator agent picks up the source, clusters it with related changes into a launch, and downstream agents generate changelog entries, blog posts, social threads, and ads updates.

## Preflight

1. **Buron MCP connected?** — Confirm the Buron MCP server is available. Try a lightweight call (e.g. `listSkills`). If it fails with an auth error, instruct the user to authorize:

   > Run any Buron tool — your IDE will open `app.buron.ai` for OAuth. Re-run `/buron:launch` after authorizing.

   Stop here if not connected.

2. **Git repo state** — Run `git status`. Confirm you're in a git repo. Note uncommitted changes, dirty working tree, or detached HEAD when relevant.

3. **Something to capture?** — Confirm there are commits beyond the default branch *or* an open PR for this branch. If the branch is identical to main with no PR, stop:

   > Nothing new to file. Make a commit, open a PR, or merge something first.

4. **Don't substitute another CI source.** The Buron MCP is the only authoritative destination for `/buron:launch`. Do not fall back to writing local files only or posting to other systems.

## Plan

State what will be captured before doing the work:

1. Branch + base + head SHA.
2. Diff against the base branch (truncated summary, not full patch — file list + lines added/removed).
3. PR thread if one exists (`gh pr view --json title,body,comments`).
4. Commit messages since divergence from base (`git log <base>..HEAD --oneline`).
5. Screenshots or images referenced in the PR body or branch (if any).
6. Working-tree status (uncommitted changes flagged separately).

Flag for the user before filing if any of the following are true:

- The branch contains commits that look like internal refactors only (no user-facing change) — ask whether to file or skip.
- Diff includes files in `auth/`, `infra/`, `.env*`, deployment configs — these will be silently excluded from the filed source per the launch skill's sensitivity rules. Confirm this is okay.

## Commands

Follow the `launch` skill (`skills/launch/SKILL.md`) for the full filing flow. The skill handles environment detection, source path conventions, content structure, and sensitivity filtering. The command here is the deterministic entrypoint that confirms preflight and delegates.

After preflight passes:

1. **Determine destination env** — From environment variables (`GITHUB_ACTIONS`, `CLAUDE_CODE`, `CURSOR_AGENT`, etc.) per the launch skill's "Detect the environment" step.
2. **Gather context** — diff summary, PR thread, commits, screenshots, working tree status.
3. **Compose the source** — structured markdown matching `source_kind: changes`. Dense, traceable, scoped to *what changed*; not a marketing draft.
4. **Apply sensitivity filtering** — silently exclude security, infra, secrets, internal tooling per the skill's sensitivity rules. Do not mention what was excluded.
5. **Write via MCP** — use the Buron `writeFile` MCP tool to push the source to `/wiki/sources/<env>/<YYYY-MM-DD>-<branch-slug>.md`. Also write a local working copy to `.buron/sources/<env>/<YYYY-MM-DD>-<branch-slug>.md`.

No CLI fallback. The MCP is the only write path for `/buron:launch`.

## Verification

After the source is filed:

1. **Confirm the file landed** — call the Buron `readFile` MCP tool against the destination path you just wrote. Verify size matches what you sent and the first ~10 lines render correctly.
2. **Show the user the path** — print the `/wiki/sources/<env>/...` path and the local `.buron/sources/...` path. Mention that Buron's curator will pick it up asynchronously; no further user action is required.
3. **Suggest next** — if this is a significant user-facing launch, suggest the user check `app.buron.ai` in ~5 minutes to see the curator's clustering and the first generated assets.

Do not summarize the marketing implications of what was filed. That's the curator's job; the command's job is filing and confirming.
