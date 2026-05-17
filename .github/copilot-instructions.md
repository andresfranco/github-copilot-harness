# Harness Operating Rules

This repository uses a tool-agnostic TDD multi-agent harness.

Always read and obey:

- harness/prompts/_preamble.md
- harness/kernel/principles.md
- harness/kernel/protocol.md
- harness/kernel/state-machine.md
- harness/kernel/roles.md
- harness/policies/tdd.md
- harness/policies/clean-code.md
- harness/policies/security.md
- profile/STACK.md

Coordinate through `.harness/` files only.

The flow is:

1. Orchestrator writes architecture, correctness assertions, plan, and contracts.
2. Scrutiny Validator reviews the plan.
3. Unit Test Validator writes RED tests.
4. Workers implement only after RED tests exist.
5. A different validator verifies each worker result.
6. Integration happens only after all tasks are verified.

Workers must never edit tests.
A verifier must never verify work it created.
If a task needs files outside its lease, emit PROPOSE to Orchestrator.