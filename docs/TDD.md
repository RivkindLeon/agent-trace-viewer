# Agent Trace Viewer — Technical Design

## Stack

- **TypeScript**, Node ≥ 26 runs `.ts` directly (type stripping) for the core, CLI and tests — no build step there.
- **Browser bundle:** `esbuild` (only build dependency) bundles `packages/web` into `dist/` (one HTML, one JS, one CSS).
- **UI:** Preact + plain CSS. Charts are hand-written SVG (no chart library). Timeline uses a virtualised list.
- **Tests:** `node --test` for core/CLI; Playwright (Chromium) smoke tests for the web bundle.
- `npm run check` = typecheck + unit tests + build + e2e. CI runs it on every push and PR.

## Layout

```
packages/core/     parsers, normalised model, analyses (pure, no DOM, no fs)
packages/cli/      `atv` command: summary, open, export (uses core + fs)
packages/web/      viewer UI (uses core in the browser)
fixtures/          synthetic sessions + expected outputs
tools/             fixture generator, size/perf scripts
```

`core` must run unchanged in Node and in the browser: no `fs`, no `path`, no Node globals. Input is a string or
an async iterable of lines.

## Normalised model

```ts
type Session = {
  source: 'claude-code' | 'codex' | 'openclaw' | 'unknown';
  id: string; title?: string; cwd?: string; gitBranch?: string;
  startedAt: string; endedAt: string;          // ISO
  models: string[];
  steps: Step[];                                // ordered by time, then file order
  usage: Usage;                                 // totals
  cost?: { usd: number; estimated: boolean };
  links: { kind: 'pr'; url: string }[];
  warnings: ParseWarning[];                     // unknown record types, bad lines — never throw
};

type Step = {
  id: string; parentId?: string;
  lane: 'main' | `subagent:${string}`;
  kind: 'user' | 'assistant' | 'thinking' | 'tool' | 'system' | 'compaction' | 'other';
  at: string; durationMs?: number;
  text?: string;                                // user/assistant/thinking
  tool?: { name: string; input: unknown; output?: string; isError?: boolean; callId: string };
  usage?: Usage;                                // for the model request that produced this step
  files?: { path: string; op: 'read' | 'edit' | 'create' | 'delete' }[];
  raw: number[];                                // source line numbers, for "show raw"
};

type Usage = { input: number; output: number; cacheRead: number; cacheWrite: number; reasoning?: number };
```

Rules:

- A tool call and its result become **one** `tool` step (paired by `tool_use_id` / `call_id`). An unpaired call
  is a step with no `output` and a warning.
- `durationMs` of a tool step = result timestamp − call timestamp.
- File operations are derived from tool inputs per agent (Claude Code `Read/Edit/Write`, Codex `apply_patch`
  and shell commands where unambiguous). Unknown → no `files`.
- Cost: use explicit cost records when present (Claude Code `cost-state`); otherwise a price table in
  `core/prices.ts` and mark `estimated: true`.

## Parsers

One module per source: `detect(firstLines): boolean` and `parse(lines): Session`. Known record types:

- **Claude Code:** `user`, `assistant` (content blocks `text`, `thinking`, `tool_use`), `user` with
  `tool_result`, `system`, `pr-link`, `cost-state`, `custom-title`, `isSidechain` → subagent lane. Ignore
  bookkeeping types (`file-history-*`, `api-request-*`, `queue-operation`, …) without warnings.
- **Codex:** `session_meta`, `turn_context` (model, effort), `response_item` (`message`, `reasoning`,
  `function_call`, `function_call_output`, `custom_tool_call(_output)`, `web_search_call`), `event_msg`
  (`token_count`, `agent_message`, `turn_aborted`).
- **OpenClaw:** to be specified from a captured sample (PROGRESS M2.4).

## Analyses (`core/analyze/*`)

Pure functions `Session → Finding[]`, each with thresholds in one config object and unit tests:

- `repeatedCommand` — same tool + same normalised input ≥ 3 times within 20 steps.
- `sameFailure` — same tool error text (normalised: numbers, paths, hashes stripped) ≥ 2 times.
- `editRevert` — an edit whose new text equals an earlier edit's old text in the same file.
- `longGap` — no step for > 5 min while not waiting for the user.
- `contextPressure` — per-request input tokens > 80 % of the model's window (window table in `core/models.ts`).

## Redaction (`core/redact.ts`)

Applied to every string field on export. Patterns: common key prefixes (`sk-`, `ghp_`, `xox`, `AKIA`, …),
`-----BEGIN … PRIVATE KEY-----` blocks, `KEY=value` lines where the key name contains
`TOKEN|SECRET|PASSWORD|KEY`, e-mail addresses, `/Users/<name>`/`/home/<name>` → `~`. Returns the redacted
session plus a report (counts per pattern). Tests use planted fake secrets in fixtures.

## Export

`atv export` writes one HTML file with the viewer JS/CSS and the **already redacted** normalised session
inlined as JSON. It must open from `file://` with no network.

## Fixtures

- **Never commit real logs.** Fixtures are produced by `tools/make-fixture.ts` from small hand-written
  scenarios, in each agent's real record shapes, with invented content.
- Each fixture directory: `session.jsonl`, `expected.json` (overview numbers, step kinds, findings).
- A CI check fails if a fixture contains a home path that is not `/home/demo` or `/Users/demo`, or anything the
  redaction patterns match outside `fixtures/redaction/`.

## Performance

`tools/perf.ts` generates a 5 MB / 20 000-line synthetic session; parse + analyse must finish in < 1.5 s in
Node on CI. The timeline renders only visible rows.
