# Progress

One line per task. Tick it (`[x]`) in the same PR that completes it, with the PR number.
Work the earliest open milestone first, one task per night. A milestone is done when all its tasks are ticked
**and** its "Done when" check has passed. Tasks marked **(Leon)** or **(Claude)** are not for the nightly agent —
skip them and take the next one.

## M0 — Foundation

- [x] M0.1 Specs: PRD, TDD, PROGRESS, DECISIONS, PROCESS, AGENTS (Claude) (initial commit)
- [ ] M0.2 Workspace: root `package.json` with workspaces `packages/*`; `tsconfig.base.json`; empty `core`, `cli`,
      `web` packages with one passing test each; scripts `typecheck`, `test`, `check`
- [ ] M0.3 CI: `.github/workflows/ci.yml` runs `npm ci && npm run check` on push and PR (Node 26)
- [ ] M0.4 Fixture guard: `tools/check-fixtures.ts` (TDD "Fixtures" rules), wired into `check`

Done when: a PR with a deliberately failing test goes red, and green after the fix.

## M1 — Claude Code parser and normalised model

- [ ] M1.1 Types for the normalised model (`core/model.ts`) exactly as in TDD
- [ ] M1.2 `tools/make-fixture.ts` + fixture `claude-basic` (prompt → thinking → 3 tool calls → answer)
- [ ] M1.3 Claude Code parser: messages, thinking, tool call/result pairing, durations, usage per request
- [ ] M1.4 Subagent lanes (`isSidechain`), `pr-link`, `custom-title`, `cost-state`; fixture `claude-subagent`
- [ ] M1.5 File operations from `Read`/`Edit`/`Write`/`MultiEdit`; fixture `claude-files`
- [ ] M1.6 Robustness: bad JSON lines, unknown types, truncated last line → warnings, never throw; fixture `claude-broken`

Done when: all Claude Code fixtures match `expected.json`; Claude runs the parser on 3 real local sessions
(not committed) and reports warnings count = 0 for known types.

## M2 — More sources

- [ ] M2.1 Format detection (`core/detect.ts`) with tests on all fixtures
- [ ] M2.2 Codex parser (TDD record list); fixtures `codex-basic`, `codex-aborted`
- [ ] M2.3 Codex file operations from `apply_patch`; fixture `codex-patch`
- [ ] M2.4 Capture the OpenClaw session format from the server, write it into TDD, build a synthetic fixture (Claude)
- [ ] M2.5 OpenClaw parser per M2.4

Done when: one real session from each source parses with no unknown-type warnings (checked by Claude, logs not committed).

## M3 — CLI summary

- [ ] M3.1 `atv <file>`: overview block (TDD Session totals) as plain text; `--json` prints the normalised session
- [ ] M3.2 Cost: `cost-state` when present, else `core/prices.ts` estimate marked `~`
- [ ] M3.3 `atv <dir>`: table of all sessions in a directory (date, source, duration, tokens, cost, title), newest first

Done when: `atv ~/.claude/projects/<p>/` lists real sessions with sensible numbers (Claude checks 2 by hand).

## M4 — Web viewer

- [ ] M4.1 `packages/web` skeleton: esbuild bundle, drag-and-drop / file picker, parse in a Web Worker, Overview view
- [ ] M4.2 Timeline: virtualised rows, time axis, colour by kind, subagent lanes collapsible, failed tools marked
- [ ] M4.3 Step inspector: side panel with full content, raw line numbers, truncation with "show all"
- [ ] M4.4 `atv open <file>`: serves the bundle on 127.0.0.1 with a random port and the session preloaded
- [ ] M4.5 Playwright smoke: load each fixture, overview numbers equal `expected.json`, click a tool step, inspector opens
- [ ] M4.6 No-network test: bundle contains no `fetch`/`XMLHttpRequest`/`WebSocket`; e2e asserts zero requests after load

Done when: Leon opens a real bad night of the `codex` agent and finds the stuck part (Leon).

## M5 — Insights

- [ ] M5.1 Tokens & context chart (SVG): input/cache/output per request, compaction markers
- [ ] M5.2 Files view with links to steps
- [ ] M5.3 Tools view: calls, failures, total/median duration
- [ ] M5.4 Analyses `repeatedCommand`, `sameFailure` with fixtures `stuck-repeat`, `stuck-same-failure`
- [ ] M5.5 Analyses `editRevert`, `longGap`, `contextPressure` with fixtures
- [ ] M5.6 Stuck panel in the UI: findings list, click → timeline jumps and highlights the span

Done when: each finding fixture shows exactly its expected findings in CLI `--json` and in the UI.

## M6 — Share

- [ ] M6.1 `core/redact.ts` + report; fixture `redaction` with planted fake secrets of every pattern
- [ ] M6.2 `atv export <file> -o out.html`: single file, redacted by default, `--no-redact` needs confirmation flag
- [ ] M6.3 Export e2e: open from `file://`, zero network requests, no planted secret present in the HTML
- [ ] M6.4 Performance: `tools/perf.ts` 5 MB session < 1.5 s parse+analyse in CI; timeline scroll stays responsive

Done when: Claude exports a real session, greps the HTML for the user's name, home path and known key prefixes — nothing found.

## M7 — Public launch

- [ ] M7.1 Final name, npm package name check, repo visibility (Leon)
- [ ] M7.2 Demo site: build `dist/` with 3 bundled synthetic samples (good run, looping run, subagents); mobile layout
- [ ] M7.3 Deploy demo (static hosting decision — Leon), link in README
- [ ] M7.4 README: what/why, 20-second GIF, install, privacy section, supported formats
- [ ] M7.5 `npm publish` dry run; publish (Leon)
- [ ] M7.6 Launch post draft: "What I learned reading 100 nights of my coding agent" (Claude drafts, Leon edits)

Done when: the demo link works on Leon's phone; `npx <name> <file>` works on a clean machine.
