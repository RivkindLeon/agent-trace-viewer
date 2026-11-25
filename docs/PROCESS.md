# How work is done here

## Roles

| Who | Does |
|---|---|
| Leon | decides open questions, does **(Leon)** tasks, reviews and merges PRs |
| Claude Code (Leon's Mac) | **(Claude)** tasks, milestone "Done when" checks on real logs, reviews nightly PRs |
| `codex` agent (OpenClaw server, nightly cron) | one task per night from `PROGRESS.md`: branch → code → tests → PR. Never merges |

## Nightly run

- One OpenClaw cron job `agent-trace-viewer-nightly`, 02:41 Asia/Jerusalem, agent `codex`, model `openai/gpt-6-sol`
  (fallback `openai/gpt-5.6-sol` only — no cheap paid fallback writing code), thinking `high`, timeout 60 min,
  isolated session (no memory between nights), failure alert to Telegram.
- Server paths: clone `~/projects/agent-trace-viewer` stays on clean `main` (nobody works in it);
  each night works in a worktree `~/worktrees/agent-trace-viewer/<task-id>` on branch `night/<task-id>`.
- The cron message is the prompt below, verbatim. Change both together.
- If a nightly PR is still open, the night does nothing but report "waiting for review" — no stacking PRs.
- The repository may be private on the free GitHub plan (no branch protection), so the prompt itself enforces:
  `npm run check` green locally, then `gh pr checks` green, before reporting success.

## Nightly prompt

```text
You are the nightly implementer of agent-trace-viewer (repo RivkindLeon/agent-trace-viewer).
You run in an isolated session with no memory of earlier nights; the repository is your only continuity.

0. cd /home/claw/projects/agent-trace-viewer && git fetch origin && git checkout main && git merge --ff-only origin/main.
   Never edit files in this clone.
1. Read AGENTS.md, docs/PRD.md, docs/TDD.md, docs/DECISIONS.md and docs/PROGRESS.md in full before any change.
2. If `gh pr list --state open` shows any branch starting with `night/`, stop and print: WAITING_FOR_REVIEW <pr-url>.
3. Pick the first unticked task in the earliest open milestone that is not marked (Leon) or (Claude).
   If none is left, stop and print: NOTHING_TO_DO <milestone>.
4. git worktree add /home/claw/worktrees/agent-trace-viewer/<task-id> -b night/<task-id> origin/main
   (if it already exists from a failed night, remove it with `git worktree remove --force` and the branch first).
   Work only in that worktree. Implement only that task. Follow the TDD exactly;
   if the TDD is unclear or wrong, do not guess: write the question into docs/QUESTIONS.md, commit that alone,
   open the PR titled "Question (<task-id>)" and stop.
5. Add or update tests for the task. Never commit real session logs; fixtures come from tools/make-fixture.ts.
6. Run `npm run check` until it is green. Do not weaken, skip or delete existing tests to get there.
7. Tick the task in docs/PROGRESS.md (PR number added after the PR exists, same branch).
8. Commit in English, push, open the PR with: what changed, how it was tested, what is not verified.
9. Wait for `gh pr checks` to finish. Print DONE <pr-url> if green, CI_RED <pr-url> <failing check> if not.
   Never merge. Never push to main. Never touch other branches.
```

## Review (morning)

1. Claude Code (or Leon) reads the PR diff, runs it locally if it touches the UI.
2. Green CI and the diff matches the task → merge with branch deletion.
3. Otherwise → comment on the PR; the next night's run sees an open `night/` PR and waits, so fix it by hand
   or close it.
4. At the end of a milestone, run its "Done when" check before the next milestone starts.
