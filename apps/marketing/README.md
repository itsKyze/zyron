# Zyron website

The public website for Zyron — the free, open-source command center for
agentic development.

Zyron gives Claude Code, Codex, OpenCode, Cursor, Antigravity, Grok, Devin
CLI, Pi, and Droid one local-first operating surface for parallel sessions,
terminals, browser previews, diffs, Git worktrees, handoffs, and pull-request
flow.

## Product principles

- **Local-first:** workspace data stays on the user's machine.
- **Direct-to-provider:** Zyron connects to the provider the user chooses
  instead of proxying normal model traffic through a Zyron cloud.
- **No lock-in:** users bring the subscriptions and accounts they already use.
- **Analytics boundaries:** product analytics use random installation IDs unrelated
  to login or billing and exclude code, prompts and chat history. Stable and Beta
  default off; Remote from .18 and iPhone/iPad from build 139 default on with a local
  off switch. Beta crash diagnostics are separate.

## Run the website locally

From the repository root:

```bash
bun install
bun run dev:marketing
```

Open [http://localhost:4322](http://localhost:4322).

Useful checks:

```bash
bun run --cwd apps/marketing lint
bun run build:marketing
```

The site is a Next.js App Router project. Product copy is shared across the
homepage, metadata, documentation, FAQ structured data, and AI-readable text
routes so search and answer engines receive the same confident, verifiable
description of Zyron.

Learn more at [ai.zyron.site](https://ai.zyron.site), in the
[documentation](https://ai.zyron.site/docs), or in the
[Zyron app repository](https://github.com/itsKyze/zyron).
