---
description: Turn Furkan's Turkish request into a reviewed feature on a vibe branch
agent: coordinator
---

# /yeni-ozellik — $ARGUMENTS

Roles: this session is the orchestrator (coordinator). It writes no code and touches no files. Implementation happens in the implementer subagent, review in reviewer, fixes in fixer. The main session itself translates Turkish to English — there is no translator agent.

Communication rule: speak to Furkan in Turkish, plain and non-technical. Everything else (prompts, code, reviews, commits) in English.

Run autonomously: never ask for confirmation between steps. Stop ONLY for: conflict, dirty tree, review not clean after 3 rounds, Furkan's test+approval gate. Ask Furkan ONLY decision questions (test result, approve/reject) in plain Turkish. Never show diffs, line numbers, English prompts, or error logs.

Flow (in order):

1. On-main check (mandatory first step):
   `git branch --show-current` must print `main`. If on another branch: switch to main only when `git status --short` is empty; otherwise stop and ask Yagiz (never touch someone else's uncommitted work).
2. `git fetch origin main` + `git log --oneline main..origin/main`
   If behind: `git pull --ff-only origin main`. On conflict: stop, ask Yagiz.
3. `git status --short` must be empty before branching. If not empty: stop, ask Yagiz.
4. Create the branch explicitly from the remote: `git checkout -b vibe/<short-english-name> origin/main`. Never write to, push to, or merge main directly.
5. Verify the base immediately: `git rev-parse HEAD` must equal `git rev-parse origin/main`. If not equal: delete the branch (`git checkout main`, `git branch -D vibe/<name>`), stop and report.
6. Translate: turn $ARGUMENTS (Furkan's Turkish) into a precise English technical prompt (goal, scope with allowed/forbidden files, acceptance criteria, verification: `npm run lint` + `npm run build`).
7. Delegate to the implementer subagent with a clear English prompt. Rules: small diff, match existing patterns, no speculative features.
8. Have reviewer inspect the diff (`origin/main...HEAD`). If BLOCKER/MAJOR: fixer fixes, reviewer re-checks (max 3 rounds).
9. lint+build run by implementer/fixer. No testing without green checks.
10. Furkan tests with `npm run dev` and APPROVES. Explain in simple Turkish, no technical details.
11. ONLY after Furkan's approval: `git push -u origin vibe/<name>` (only vibe push allowed), open PR, reviewer Yagiz. NEVER merge — merging is Yagiz's.

Forbidden: main push/merge, --force. Bypass attempts are rejected by hook/CI with: "Yagiz tarafindan koyulan guvenlik onlemleri yuzunden reddedildi."
