# Project Instructions

This repository inherits the global autonomous development protocol.

Project-specific instructions in this file take precedence when applicable.

---

## Source of Truth

Before substantial implementation work, read:

- `docs/PRODUCT.md`
- `docs/DESIGN.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/SPEC_AUDIT.md`

These documents are the authoritative source for product behavior,
architecture, implementation scope, and acceptance criteria.

If conversation history conflicts with the approved project documents,
follow the project documents unless the user explicitly changes the requirement.

Important implementation decisions must be written back into the project documents.

---

## Project Commands

Replace the commands below with the actual commands used by this repository.

### Install

Example:

    npm install

### Development

Example:

    npm run dev

### Test

Example:

    npm test

### Typecheck

Example:

    npm run typecheck

If this repository has no separate typecheck command,
replace this section with the appropriate validation command or remove it.

### Lint

Example:

    npm run lint

### Build

Example:

    npm run build

---

## Required Validation

Before substantial implementation work is considered complete,
run every applicable validation command defined above.

At minimum, verify:

- relevant tests pass
- type checking passes when available
- linting passes when available
- production build passes when applicable

Do not declare completion while a required validation command is failing.

If a validation command cannot be executed,
report:

- which command could not run
- why it could not run
- what validation was performed instead
- remaining risk

---

## Repository Constraints

Follow the repository's existing conventions before introducing new patterns.

Unless explicitly approved in `docs/DESIGN.md`:

- preserve existing public API compatibility
- preserve existing data contracts
- preserve existing routing behavior
- preserve existing persistence formats
- avoid unnecessary production dependencies
- avoid unrelated refactors
- avoid renaming unrelated files or symbols
- do not manually edit generated files
- do not modify deployment configuration unless required by the task

Prefer the smallest maintainable change that satisfies the approved design.

---

## Architecture Changes

Do not silently introduce architectural changes.

Examples include:

- replacing a major library
- changing state-management strategy
- changing persistence strategy
- changing API boundaries
- adding a new service
- restructuring major directories
- changing authentication or authorization architecture
- introducing a new framework-level abstraction

If implementation reveals that an architecture change is necessary:

1. stop the conflicting implementation work
2. report the conflict to the Commander
3. update `docs/DESIGN.md`
4. update affected tasks in `docs/IMPLEMENTATION_PLAN.md`
5. resume implementation only after the decision is recorded

---

## Product Requirement Ambiguity

Implementers must not guess product behavior when multiple reasonable
interpretations would produce meaningfully different results.

If an important ambiguity is found:

1. mark the task as blocked
2. describe the unresolved question
3. explain why it affects implementation
4. escalate through the global autonomous development protocol

Once resolved, write the decision into the appropriate project document.

Do not leave important decisions only in agent conversation history.

---

## Implementation Scope

Each implementation task should be bounded.

An implementation worker should receive:

- objective
- relevant design section
- scope
- expected files or components
- dependencies
- do-not-change boundaries
- acceptance criteria
- verification commands

Do not expand the task merely because additional improvements are possible.

Potential improvements outside the approved scope should be reported separately.

---

## Parallel Work

Parallel implementation is encouraged only when it is safe.

Tasks may run in parallel when:

- dependencies are satisfied
- requirements are independently specified
- file ownership does not substantially overlap
- one task does not depend on uncommitted behavior from another

Avoid assigning multiple workers to modify the same file concurrently.

Prefer:

    dependency layer
    -> parallel implementation
    -> integration and verification
    -> next dependency layer

---

## UI / UX Changes

For user-visible changes, verify all supported layouts and interaction states.

Unless this project's documentation says otherwise, check:

- normal desktop layout
- narrow/mobile layout
- loading state
- empty state
- error state
- long or unusual content
- disabled or unavailable states where applicable

Do not consider a UI change complete based only on the happy path.

---

## Error Handling

New or changed behavior must define expected failure behavior.

Do not silently swallow errors unless the approved design explicitly requires it.

When relevant, verify:

- network failure
- invalid input
- missing data
- unexpected server response
- partial data
- retry/recovery behavior
- user-visible error messaging

---

## Tests

Add or update tests when the implementation changes behavior that can reasonably
be protected by automated tests.

Prioritize tests for:

- acceptance criteria
- regressions
- edge cases
- fixed bugs
- important business logic
- state transitions
- parsing and transformation logic

Do not add low-value tests solely to increase test count.

---

## Documentation

Update project documentation when implementation changes:

- product behavior
- architecture
- public interfaces
- configuration
- required commands
- deployment procedure
- important operational assumptions

Documentation should describe the resulting system, not merely the implementation process.

---

## Generated Files

Do not manually edit generated files unless this repository explicitly requires it.

When a generated artifact must change:

1. identify its source
2. change the source
3. run the appropriate generation command
4. verify the generated result

---

## Dependencies

Do not add a new production dependency when the existing stack can reasonably
solve the problem without significant complexity.

When a new production dependency is justified, verify:

- it is actively maintained
- it is compatible with the existing stack
- its license is acceptable for the project
- the functionality is not already available in the repository
- the dependency is necessary for the approved design

Record significant dependency decisions in `docs/DESIGN.md`.

---

## Security

Do not weaken existing security controls to make implementation easier.

Pay particular attention to changes involving:

- authentication
- authorization
- secrets
- user-controlled input
- file handling
- network requests
- database queries
- HTML rendering
- redirects
- external URLs
- command execution

If the task has security implications not covered by the design,
escalate the decision instead of silently choosing a weaker behavior.

---

## Git / Change Hygiene

Keep changes focused on the approved task.

Before reporting completion:

- inspect the final diff
- remove accidental debug code
- remove temporary files
- remove unused imports
- remove commented-out experimental code
- verify unrelated files were not modified unintentionally

Do not rewrite unrelated history or make destructive Git operations
unless explicitly requested.

---

## Definition of Done

A substantial implementation is complete only when all applicable conditions are met:

- approved implementation tasks are complete
- required tests pass
- required type checks pass
- required lint checks pass
- required builds pass
- acceptance criteria in `docs/DESIGN.md` pass
- independent review returns `PASS`
- no known blocking issue remains
- important implementation decisions are reflected in project documentation

If any required condition is not satisfied, the work is not `DONE`.

---

## Project-Specific Rules

Add rules below that apply only to this repository.

Examples:

- Supported Node.js version is defined in `.nvmrc`.
- UI-visible changes must be checked at 390x844 and 320x568.
- API response types in `src/types/` are treated as public contracts.
- Database migrations that have shipped must never be modified in place.
- Files under `src/generated/` must not be edited manually.

Replace these examples with the actual constraints for this project.