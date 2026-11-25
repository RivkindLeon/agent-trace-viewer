# Rules for AI agents in this repository

- **English only** in code, docs, UI strings, commits and PRs (D-003).
- **No real session logs, ever** — not in fixtures, tests, docs or PR descriptions (D-004). Use
  `tools/make-fixture.ts`. Example paths are `/Users/demo` and `/home/demo`.
- **No network** in `packages/core` and `packages/web` runtime code (PRD "Privacy").
- `packages/core` is pure: no `fs`, `path`, `process`, DOM. It must run in Node and in the browser.
- Parsers never throw on input: unknown or broken lines become `warnings`.
- `docs/DECISIONS.md` is append-only.
- One task per PR; tick it in `docs/PROGRESS.md` in the same PR.
- Never merge, never push to `main`, never force-push.
- `npm run check` must be green before a PR is opened. Do not delete or skip tests to make it green.
