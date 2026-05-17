# Harness Kernel: Protocol

## Events

All agents communicate through events written to `.harness/events/`.

### Event format

Filename: `<iso-timestamp>-<EVENT_TYPE>.md`

Content:
```
event: <EVENT_TYPE>
task: <feature>/<task>
agent: <agent-name>
timestamp: <iso-timestamp>
summary: <one-line summary>

<optional details>
```

### Event types

| Event | Who emits | Meaning |
|---|---|---|
| PLANNED | Orchestrator | Architecture, correctness, plan, and contracts written |
| SCRUTINY_PASSED | Scrutiny Validator | Plan approved; implementation may proceed |
| SCRUTINY_REJECTED | Scrutiny Validator | Plan has issues; orchestrator must fix |
| TESTS_RED | Unit Test Validator | RED tests written for a task |
| HANDOFF | Worker | Implementation complete; tests are GREEN locally |
| VERIFIED | Verifier | Task passes all checks |
| REJECTED | Verifier | Task fails; worker must fix |
| PROPOSE | Worker | Worker needs lease expansion |
| BLOCKED | Orchestrator | Cannot proceed; human intervention required |

## Task lifecycle

```
PLANNED → SCRUTINY_PASSED → TESTS_RED → HANDOFF → VERIFIED
                         ↓                      ↓
               SCRUTINY_REJECTED          REJECTED → HANDOFF → VERIFIED
```

## Constraints

- Workers must not start until TESTS_RED exists for their task.
- Verifiers must not verify their own work.
- Orchestrator must not write product code or tests.
