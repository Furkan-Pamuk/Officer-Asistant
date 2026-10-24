<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Repository instructions

## Scope

This repository is the source of truth for Officer-Asistant (Shark) — an offline-ready maritime assistant PWA built with Next.js 16, React 19, TypeScript, Tailwind CSS, Dexie (IndexedDB), Supabase, and Stripe. The root `AGENTS.md` is the project maintenance file and follows the AGENTS.md convention for AI coding tools that load it automatically.

## Operating principles

- Working code only. Plausibility is not correctness; verify before reporting done.
- Never fabricate file paths, APIs, commit hashes, command output, or test results. Read the file, run the command, or say what is unknown.
- Say when a premise appears wrong before implementing around it.
- Ask before proceeding only when a request has multiple plausible interpretations and the choice materially affects the result.
- Touch only what the task requires. Avoid drive-by refactors, formatting, or cleanup.
- Keep communication direct and concise. Skip flattery, filler, ceremonial openings, and emoji.

## Command execution

- Prefer running code, tests, linters, and type checks over guessing.
- Read complete errors, logs, and stack traces before fixing them.

## Before editing

- State the plan or success criteria before editing. For non-trivial work, include the verification you expect to run.
- Read the files you will touch and the nearby callers, consumers, or docs that define their behavior.
- Match existing project patterns, naming, layout, and style even if a different approach would be appealing in a new project.
- Resolve ambiguity by reading code or running commands when practical; surface assumptions out loud when they affect the result.

## Editing

- Keep credentials, tokens, sessions, history, caches, logs, and runtime databases out of this repository.
- Use the minimum code or documentation change that solves the stated problem.
- Do not add speculative features, abstractions, configurability, or hooks.
- Do clean up orphans created by your own change, such as unused imports or obsolete helper functions.
- Do not delete pre-existing dead code unless asked; mention it in the summary if it matters.

## Verification

- Run the smallest meaningful verification during iteration and the requested or relevant final verification before reporting done.
- If verification fails, fix the cause instead of weakening the check.
- For UI or visual changes, verify visually with screenshots or equivalent rendered output.
- Run `npm run lint` and `npm run build` to verify changes.

## Maintenance

- Keep this file short enough to follow. Add rules only when they prevent a real repeat mistake or document durable project behavior.
- When the user corrects an approach, tighten the relevant rule instead of appending a vague warning.
