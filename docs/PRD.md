# Agent Trace Viewer — Product Requirements

Working name: **agent-trace-viewer** (`atv`). Final name is an open decision (see `DECISIONS.md`, Q-1).

## Problem

Coding agents (Claude Code, Codex CLI, OpenClaw) write detailed session logs as JSONL, but nobody reads them:
a single session is thousands of lines of nested JSON. When an agent burns an hour, loops on the same failing
test, or quietly drops a requirement, the only way to understand it is to scroll raw JSON or ask another model.

There is no simple, local, private tool that answers in one screen:

- What did the agent actually do, step by step, and how long did each step take?
- Where did the tokens (and money) go? When did the context fill up?
- Where did it get stuck — repeated commands, repeated failures, edit/revert cycles?
- Which files did it read and change?

## Product

A **local-first** viewer for coding-agent session logs:

1. **CLI** — `atv <session.jsonl>` prints a summary; `atv open <session.jsonl>` opens the viewer in the browser;
   `atv export <session.jsonl> -o trace.html` writes a single self-contained, redacted HTML file to share.
2. **Web viewer** — a static page. Logs are parsed **in the browser**; nothing is uploaded anywhere. The same
   page is the public demo site (drag-and-drop your own file, or open a bundled synthetic sample).

## Users

- **Primary:** developers who run coding agents daily and want to understand a bad (or great) session.
- **Secondary:** people who teach or write about agents and need to show a session to others (blog posts,
  talks, bug reports to agent vendors).
- **Portfolio audience:** hiring managers and engineers who open the demo link — it must look good and work in
  10 seconds with no install.

## Core views (v1)

| View | Shows |
|---|---|
| **Overview** | agent, model(s), start/end, duration, turns, tool calls, tokens in/out/cache, cost if known, files changed, errors, outcome (last message, PR link if present) |
| **Timeline** | one row per step on a time axis: user prompt, thinking, assistant text, tool call (with paired result), subagent (sidechain) collapsed into its own lane; colour by kind; failed tool results marked |
| **Step inspector** | click a step → full content: tool input, output (truncated with "show all"), thinking, token usage for that request |
| **Tokens & context** | cumulative tokens and per-request context size over time; cache read vs fresh input; context-compaction points |
| **Files** | files read / edited / created, with counts and first/last touch time; click → steps that touched it |
| **Stuck detector** | flagged spans: same command repeated N times, same failing command with same error, edit then revert of the same hunk, long gaps with no tool output. Each flag links to the steps |
| **Tools** | per tool: calls, failures, total and median duration |

## Sources (v1)

| Agent | Log location | Priority |
|---|---|---|
| Claude Code | `~/.claude/projects/<project>/<session>.jsonl` | M1 |
| Codex CLI | `~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl` | M2 |
| OpenClaw | agent session JSONL on the server (format to be captured, see PROGRESS M2.4) | M2 |

Format detection is automatic. Unknown record types are kept as "other" steps and never crash the parser.

## Privacy (a feature, not a footnote)

- No network calls from the viewer or CLI. No analytics. A test enforces this (no `fetch`/`XMLHttpRequest`
  in the bundle except dev tooling).
- **Export redaction** is on by default: secrets (API keys, tokens, private keys, `.env`-style assignments),
  e-mail addresses, absolute home paths (`/Users/<name>` → `~`). A redaction report lists what was removed.
- The repository never contains real session logs. Fixtures are synthetic (see `TDD.md`, "Fixtures").

## Non-goals (v1)

- No server, accounts, uploads, or hosted storage.
- No live tailing of a running session (possible v2).
- No editing or replaying sessions against a model.
- No comparison of two sessions (v2 candidate).
- No support for non-coding chat exports.

## Success

- Opening a 5 MB Claude Code session shows the overview in under 2 s on a laptop.
- Leon can look at a real bad night of the `codex` agent and point at the stuck span in under a minute.
- The public demo works on desktop and phone, and the README has a short GIF that explains the tool without text.
- Portfolio signal: public repo, MIT, green CI, clear docs, a launch post.
