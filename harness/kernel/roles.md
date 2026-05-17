# Harness Kernel: Roles

## Orchestrator

- Plans the feature.
- Writes architecture, correctness, plan, and contracts.
- Delegates work to specialist agents.
- Never writes product code or tests.

## Scrutiny Validator (harness-validator-scrutiny)

- Reviews the plan for completeness, correctness, and security.
- Approves (SCRUTINY_PASSED) or rejects (SCRUTINY_REJECTED) the plan.
- Does not write tests or implementation code.

## Unit Test Validator (harness-validator-unittest)

- Writes RED tests for each task based on the contract.
- Tests must fail before implementation exists.
- Does not write product code.

## Backend Worker (harness-worker-backend)

- Implements backend tasks.
- Works inside the task lease only.
- Makes RED tests GREEN.
- Does not edit test files.

## Frontend Worker (harness-worker-frontend)

- Implements frontend tasks.
- Works inside the task lease only.
- Makes RED tests GREEN.
- Does not edit test files.

## Database Worker (harness-worker-database)

- Implements database migration/schema tasks.
- Works inside the task lease only.
- Makes RED tests GREEN.
- Does not edit test files.

## Verifier (any validator agent not assigned to the original task)

- Runs the tests for a completed task.
- Confirms GREEN (VERIFIED) or reports failure (REJECTED).
- Does not verify their own work.
