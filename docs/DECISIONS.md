# Decisions

Append-only journal. Entries are never edited or removed; a changed decision is a new entry that says which
one it replaces.

## D-001 — 2026-11-25 — Local-first, no server

Logs contain code, paths and sometimes secrets. Parsing happens in the CLI or in the browser; nothing is
uploaded. This is also the main selling point against hosted observability tools.

## D-002 — 2026-11-25 — TypeScript, Node 26 type stripping, esbuild only for the browser

Same approach as Leon's other projects: no build step for core/CLI/tests; one small build dependency for the
web bundle. Preact for UI, hand-written SVG charts.

## D-003 — 2026-11-25 — Repository language is English

Portfolio project for an international audience: code, docs, UI, commits in English.

## D-004 — 2026-11-25 — Synthetic fixtures only

Real session logs are never committed, not even redacted. Fixtures are generated from invented scenarios in
the agents' real record shapes. Real logs are used only locally for manual checks.

## D-005 — 2026-11-25 — Nightly agent implements, never merges

The `codex` agent on the OpenClaw server takes one task per night, opens a PR with `npm run check` green and
stops. Merge after review (process in `PROCESS.md`).

## D-006 — 2026-11-25 — Public repository from day one, MIT

Answers Q-2. The repository is public from the first commit: the portfolio value includes the visible history of a
project built by a nightly agent. Consequences: everything in the repo, including PR descriptions and fixtures, is
public — the no-real-logs rule (D-004) matters even more; branch protection with a required CI check becomes
available (PROGRESS M0.5).

## Open questions

- **Q-1** Final name (candidates: `tracelens`, `agentscope`, `replaykit`, `atv`) — needs an npm/GitHub name check. (Leon)
- **Q-3** Demo hosting: GitHub Pages vs the OpenClaw server behind Caddy. (Leon)
