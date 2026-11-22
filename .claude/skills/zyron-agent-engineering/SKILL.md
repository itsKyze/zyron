---
name: zyron-agent-engineering
description: Master agent engineering guidelines synthesized from Cursor, Anthropic Claude Code, Google Antigravity, and OpenAI Codex. Use when planning, writing, refactoring, debugging, or verifying code across Zyron workspaces.
---

# Zyron Master Agent Engineering Guidelines

A unified, production-grade specification for AI coding agents operating across Zyron desktop, web, server, and CLI surfaces. Synthesized directly from the world's leading coding agent architectures: **Cursor**, **Anthropic Claude Code**, **Google Antigravity**, and **OpenAI Codex**.

---

## 1. Codebase Grounding & Exploration (OpenAI Codex)

> [!IMPORTANT]
> **Explore First, Ask Second:** Always ground yourself in the actual repository before asking questions or proposing changes.

1. **Self-Service Discovery:**
   - Search symbols, inspect type definitions, read configs, and trace entry points using specialized tools (`grep`, `glob`, `read_file`).
   - Never ask the user questions that can be answered by exploring the workspace (e.g., "Where is this type defined?", "What library is used for styling?").
2. **Decision Completeness:**
   - When presenting a plan, ensure it is **decision complete**: the implementation steps, affected files, edge cases, and verification commands must be unambiguous so that any agent or engineer can execute it without guesswork.
3. **Plan Mode Boundary:**
   - In Plan Mode, operations must be strictly **non-mutating** (inspection, searching, dry-run checks). Never edit, delete, or generate tracked files until the plan is approved.

---

## 2. Surgical Code Editing & Code Quality (Cursor)

> [!TIP]
> **Surgical Diffs over Whole-File Rewrites:** Make minimal, targeted replacements that preserve surrounding code, formatting, and imports.

1. **Read Before Edit:**
   - You MUST read the relevant section of a file before modifying it. Never guess line contents or import paths.
2. **No Redundant Comments:**
   - Avoid comments that merely narrate what the code does (e.g., `// import module`, `// return result`, `// handle error`, `// increment counter`).
   - Only write comments to explain non-obvious intent, architectural trade-offs, or external constraints.
3. **Automatic Lint & Error Remediation:**
   - If an edit introduces compiler, TypeScript, or linter errors, fix them immediately in the same turn before declaring success.
4. **Modern UI Standards:**
   - When building or touching user interfaces, use modern semantic primitives, accessible focus states, and the design tokens established in the project (e.g., `text-ui` in Zyron).

---

## 3. Terminal Agent Loop & Error Recovery (Anthropic Claude Code)

> [!NOTE]
> **The ReAct Loop: Think ➔ Act ➔ Observe.** Execute commands purposefully, read tool results critically, and adapt autonomously.

1. **Autonomous Error Diagnosis:**
   - When a shell command, test, or build fails, parse the compiler or runtime error output directly. Trace the root cause and apply a fix rather than retrying the identical command blindly.
2. **Dedicated Tools Over Shell Equivalents:**
   - Always prefer specialized tools (`read_file`, `edit_file`, `write_file`) over shell alternatives (`cat`, `sed`, `awk`, `echo > file`).
   - Reserve shell execution exclusively for actual system commands, tests, package management, and daemon control.
3. **Destructive Action Protection:**
   - Never run destructive commands (`rm -rf`, dropping database tables, deleting branches, modifying system configs) without explicit user authorization.

---

## 4. Structured Reporting & Modular Architecture (Google Antigravity)

> [!NOTE]
> **Progressive Disclosure & Visual Clarity:** Keep chat readable, structured, and informative.

1. **Visual Documentation with Mermaid:**
   - Use Mermaid flowcharts (`flowchart TD` / `flowchart LR`) and sequence diagrams (`sequenceDiagram`) to explain architectures, data flows, and state machines.
2. **Structured Callouts:**
   - Use GitHub-style alerts strategically to guide the reader:
     - `> [!NOTE]` for implementation context and rationale.
     - `> [!TIP]` for performance optimizations and best practices.
     - `> [!IMPORTANT]` for essential steps and requirements.
     - `> [!WARNING]` for breaking changes or compatibility risks.
     - `> [!CAUTION]` for high-risk actions.
3. **Parallel Subagent Delegation:**
   - Delegate heavy, repetitive, or parallel tasks (broad codebase surveys, deep web research, browser E2E verification) to bounded subagents to keep the primary conversation context clean.

---

## 5. Verification & Completion Checklist (OpenAI Codex Auto-Review)

Before finalizing any task, verify:

- [ ] **Typecheck & Linter:** Run project checks (e.g., `bun run lint`, `bun run typecheck`).
- [ ] **Targeted Tests:** Run affected test suites (e.g., `vitest run <affected.test.ts>`).
- [ ] **No Secrets:** Confirm zero API keys, auth tokens, or private credentials are in code, commits, or logs.
- [ ] **Actionable Completion Summary:** Provide a concise TL;DR: outcome first, verification evidence, and only remaining decisions.
