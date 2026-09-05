# Goal Template

Use this template to compose the text for a long-running Codex `/goal`. This file is a manual reference; it does not become the active goal automatically.

## Objective

What must be completed?

## Scope

What files, components, or systems may be changed?

## Out of scope

What must not be changed?

## Constraints

What rules, compatibility requirements, safety limits, or user instructions must be respected?

## Acceptance criteria

What observable conditions mean the work is complete?

## Verification

Which commands, tests, lint/build checks, or browser verification must be run?

## Stop conditions

What state requires stopping instead of continuing (for example, an unresolved product decision or a repeated failure)?

## Escalation conditions

Under what circumstances is user judgment, approval, credentials, or external access required?

## Usage

At the start of a long-running task, adapt the sections above into one active goal:

```text
/goal <set the goal text created from the sections above>
```

Keep the goal about what must be achieved: objective, scope, constraints, verification, and stop conditions. Do not fill it with a long list of infrastructure actions such as rereading `AGENTS.md` after compaction. The responsibilities are intentionally separate:

- Goal layer: the durable objective and completion boundary for the work.
- Recovery hook: the procedure and project rules reintroduced after compaction.
