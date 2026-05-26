---
name: launch
description: File a rich dump of what changed in this repo (PR / branch / shipment) as a Buron source. Use when the user asks for /launch, launch notes, launch kits, or asks to prepare a launch. Also suggest running it when a significant user-facing feature is completed — not for refactors or fixes.
---

# Launch

## What this does

Dump everything you can see about what just changed (or is about to ship) into a single rich source file, push it to Buron, and exit.

You are not a marketer. You are not deciding which product this is. You are not deciding whether this is one launch or three. You are not writing copy. A launch is a *compiled* artifact — Buron's curator agent reads accumulated `source_kind: changes` sources for the team's products, resolves which product each one belongs to, clusters them into launches, and synthesises the marketing brief from there.

Your only job: produce dense, traceable raw material with as much context as you can pull from inside this repo + GitHub. The source you file has `source_kind: changes` — a snapshot of what changed at this filing event. Many `changes` sources roll up into one launch.

## Sensitivity

Source content feeds downstream into public-facing materials. Silently exclude:

- Security implementation details, vulnerability information, auth internals
- Infrastructure, deployment configuration, database schemas
- API keys, tokens, secrets, internal endpoints
- Internal tooling, build systems, CI/CD configuration
- Anything the company would not want publicly visible

Don't mention that content was excluded. Just leave it out.

## Step 1 — Detect the environment

Pick the destination prefix `<env>`:

- `GITHUB_ACTIONS=true` → `ci`
- Running from `.cursor/skills/` OR `CURSOR_AGENT` set → `cursor`
- Running from `.claude/skills/` OR `CLAUDE_CODE` set → `claude-code`
- Running from `.github/skills/` OR `GITHUB_COPILOT_CLI` set → `copilot`
- Running from `.codex/skills/` OR `OPENAI_CODEX` set → `codex`
- Otherwise → `agents`

Destination path: `/wiki/sources/<env>/<YYYY-MM-DD>-<branch-slug>.md`. Local working copy: `.buron/sources/<env>/<YYYY-MM-DD>-<branch-slug>.md`.

`<branch-slug>` is the current branch with the prefix stripped (`feat/foo-bar` → `foo-bar`). If on the default branch, use a short timestamp slug.

## Step 1a — First-time baseline (only on the first run for this repo)

Before filing the changes source for the current PR, check whether Buron has any prior sources for this repo:

```bash
buron file glob "/wiki/sources/*/*.md" | xargs -I{} buron file read {} | grep -l "repo: <org>/<repo>"
```

(Or just `buron file list /wiki/sources/cursor` etc. for each env — if all are empty / contain no files matching this repo, it's the first run.)

If first run, file an additional **baseline source** first. This gives Buron's curator a ground-state for the project so subsequent launches have context for "before / after". Use the same frontmatter shape with `source_kind: baseline` (instead of `changes`) and a slug like `<YYYY-MM-DD>-baseline.md`.

Body for the baseline:

- **Project overview** — what the product is, derived from README, package.json, marketing pages, app routes. The same shape the curator would otherwise have to derive on its own.
- **Current capabilities** — every user-facing capability you can identify in the repo today. Group by surface if there are distinct areas. Be thorough.
- **How it works** — end-to-end user journey, in user terms.
- **Tech surface** — at a high level (web app, mobile, API, CLI, etc.) — not implementation detail.
- **Recent shipping cadence** — `git log --since="90 days ago" --pretty=format:"%h %s"` summarised into themes (don't list every commit). What's been shipped in the last quarter, broadly.
- **Known assets** — README links, demo URLs, marketing pages, video assets — anything the curator might reuse.
- **Open questions / context gaps** — what you couldn't determine from the repo alone (pricing, customer count, market positioning) so the curator knows what to ask the user later.

Push the baseline:

```bash
buron file write /wiki/sources/<env>/<YYYY-MM-DD>-baseline.md \
  --from-file .buron/sources/<env>/<YYYY-MM-DD>-baseline.md
```

Then continue with the current changes source (steps 2-5 below). The two sources land separately in Buron — the curator treats `baseline` as the ground-state and `changes` as the delta.

## Step 2 — Gather everything

Pull every reachable signal. Lift content **verbatim** wherever you can. Don't compress, summarise, or interpret.

### Git

- Detect base branch: `git remote show origin` → parse "HEAD branch", fall back to `main`
- `git remote get-url origin` → repo URL
- `git log <base>..HEAD --pretty=full` — full commit messages with bodies
- `git diff <base>..HEAD --stat` — file-level summary
- `git diff <base>..HEAD` — actual changes (skim for context, don't paste the whole diff)
- Branch name and current HEAD SHA

### GitHub (via `gh` if authenticated)

- `gh pr view --json number,url,title,body,comments,reviews` — lift PR title, body, and every comment **verbatim with author attribution**
- For each issue number referenced in the PR or commit messages: `gh issue view <n> --json title,body,comments` — lift body and comments verbatim
- If the PR body contains screenshot / video / demo URLs, capture those URLs

### Repo

- `README.md`, `CHANGELOG.md`, `docs/`, `RFCs/` — lift sections that changed in this branch or describe what shipped
- JSDoc and inline code comments around the changed paths — lift verbatim, cite file paths
- Test file names and `describe` / `it` strings around the changed area (these are behaviour in English)
- Feature flag names mentioned in the diff

### Optional clustering signal

If any of these are set, capture the value into the source frontmatter as `launch_id`. The curator uses this to merge multi-PR launches; if missing, the curator clusters heuristically.

- `BURON_LAUNCH_ID` env var
- A `launch_id: <slug>` line in the PR body (case-insensitive)
- A `launch_id: <slug>` trailer in any commit message in this branch

Don't ask the user about this. If the signal is present, use it. If not, leave it off.

## Step 3 — Write the source file

Local path: `.buron/sources/<env>/<YYYY-MM-DD>-<branch-slug>.md`

### Frontmatter

```yaml
---
title: <descriptive title — what shipped, in plain user language, derived from the PR title or branch name>
type: source
source_kind: changes
env: <cursor | claude-code | copilot | codex | ci | agents>
repo: <org/repo from git remote>
branch: <branch-name>
pr_url: <https://...>           # null if no PR yet
pr_number: <int>                # null if no PR yet
commit_range: <base>..<HEAD-sha>
launch_id: <slug>               # OMIT if no signal was found in step 2
created: <YYYY-MM-DD>
---
```

Buron resolves which product this source belongs to from `repo` (or asks the user once during product onboarding). You don't pick a product slug.

### Body

Each section is a prompt to surface what you found. Write what you have. Skip sections that are empty rather than padding them.

```markdown
## What shipped

Multi-paragraph user-facing narrative. If multiple capabilities shipped,
each gets its own subsection with real detail — describe screens, entry
points, what a user clicks and what happens. No compression.

## PR / issue thread

Verbatim PR title, body, and comments (with author attribution).
Verbatim issue body and comments for any linked issue. Use blockquotes
to make verbatim content clear.

## Code-side context

Commit messages with bodies. Verbatim JSDoc / code comments around
changed paths. Test file behaviours (the names of test cases describe
what the code does). Cite file paths.

## Repo documentation references

Sections of README / CHANGELOG / docs/ / RFCs that changed in this
branch or describe what shipped. Verbatim where possible.

## Edge cases and limits

Feature flags this is gated behind. Beta vs GA status. Rollout plan if
visible in PR or config. Known limitations. Who has access today vs
later.

## Quotes

Anything from PR comments, issue threads, beta-tester references in
commit messages, internal threads cited in the PR — verbatim with
attribution.

## Assets

Screenshot paths inside the repo. Video / image URLs from the PR body.
Demo URLs from the PR or README. Design file URLs if any are referenced.

## Open questions / risks

Things you noticed that aren't engineering decisions but might matter
for marketing. Surface them honestly.
```

**Do not write a Summary / What's New / Who / Breaking section.** That's the curator's job, downstream.

## Step 4 — Push to Buron

```bash
buron file write /wiki/sources/<env>/<YYYY-MM-DD>-<branch-slug>.md \
  --from-file .buron/sources/<env>/<YYYY-MM-DD>-<branch-slug>.md
```

## Step 5 — Confirm and exit

Confirm:
- The path the source landed at
- That Buron's curator (`gtm:curate-launch`) will process this on its next run, resolve the product, and synthesise a launch brief from accumulated sources

Exit. You don't poll. You don't wait for assets. The curator is async.

## Rules

- Don't ask about the product. Buron resolves it from the repo.
- Don't ask about launch_id. Pick up the signal if it's present, leave it off if not.
- Don't write a marketing brief. Sources are raw; briefs are the curator's output.
- Lift content **verbatim** wherever you can. Verbatim with attribution beats paraphrase.
- Skip empty sections. Don't pad.
- Sensitivity rules apply throughout.
