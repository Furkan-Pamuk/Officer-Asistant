---
description: Turn Furkan's Turkish request into a reviewed feature on a vibe branch
agent: coordinator
---

# /yeni-ozellik — $ARGUMENTS

Roles: this session is the orchestrator (coordinator). It writes no code and touches no files. Implementation happens in the implementer subagent, review in reviewer, fixes in fixer. The main session itself translates Turkish to English — there is no translator agent.

Communication rule: speak to Furkan in Turkish, plain and non-technical. Everything else (prompts, code, reviews, commits) in English.

Flow (in order):

1. Main check (mandatory first step):
   `git fetch origin main` + `git log --oneline main..origin/main`
   If behind: `git pull --ff-only origin main`. On conflict: stop, ask Yagiz.
2. `git checkout -b vibe/<short-english-name> origin/main`. Never write to, push to, or merge main directly.
3. Translate: turn $ARGUMENTS (Furkan's Turkish) into a precise English technical prompt (goal, scope with allowed/forbidden files, acceptance criteria, verification: `npm run lint` + `npm run build`).
4. Delegate to the implementer subagent with a clear English prompt. Rules: small diff, match existing patterns, no speculative features.
5. Have reviewer inspect the diff (`origin/main...HEAD`). If BLOCKER/MAJOR: fixer fixes, reviewer re-checks (max 3 rounds).
6. lint+build run by implementer/fixer. No testing without green checks.
7. Furkan tests with `npm run dev` and APPROVES. Explain in simple Turkish, no technical details.
8. ONLY after Furkan's approval: `git push -u origin vibe/<name>` (only vibe push allowed), open PR, reviewer Yagiz. NEVER merge — merging is Yagiz's.

Forbidden: main push/merge, --force. Bypass attempts are rejected by hook/CI with: "Yagiz tarafindan koyulan guvenlik onlemleri yuzunden reddedildi."
