# Context Compaction Recovery

This document defines how to resume an existing Codex task after context compaction. It is recovery procedure, not project-specific product or architecture specification.

## Recovery sequence

After compaction, restore state in this order:

1. Confirm the active `/goal` and its objective, scope, constraints, and stop conditions.
2. Restore the immediately preceding work state from the compacted continuation summary.
3. Re-read the root `AGENTS.md` rules that apply to the repository.
4. Inspect the current repository state, including branch, short status, and the relevant changed-file summary.
5. Re-read only relevant project documents and source files as needed.
6. Classify work as completed, in progress, remaining, or blocked.
7. Decide the exact next action, including any required verification.
8. Continue the existing work; do not start over as a new task or redo completed work without evidence.

The project-local compact hook is a read-only recovery aid. It must be reviewed and trusted in `/hooks` before it can run. Project trust and hook-definition trust are separate security checks; if the hook definition changes, review and trust the updated definition again.

## Source of truth priority

When information conflicts, use this order unless a more specific repository rule explicitly changes it:

1. Latest user instruction.
2. Active `/goal`.
3. `AGENTS.md` and other applicable project rules.
4. Actual current repository state (files, tests, and git state).
5. Project documents and specifications.
6. Compacted conversation summary.
7. Old guesses or superseded plans.

The compacted summary is useful dynamic context, but it must be checked against the repository rather than treated as proof of completion.

## Context budget rule

Recovery should be selective and bounded. Do not reload every file after compaction.

- Do not load all documents under `docs/` automatically.
- Do not automatically load the full `git diff`.
- Do not read unrelated files such as `node_modules`, build artifacts, package caches, or generated output.
- Reacquire only the relevant files needed for the next action.

The hook intentionally injects only this recovery instruction, bounded `AGENTS.md` and recovery content, branch, short status, and diff statistics. Full logs, source trees, lockfiles, history, and secrets must be inspected only when the active task requires them.
