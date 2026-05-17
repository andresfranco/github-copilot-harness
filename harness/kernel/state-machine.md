# Harness Kernel: State Machine

## Task states

```
PENDING → IN_PROGRESS → HANDOFF → VERIFIED
                 ↓           ↓
              BLOCKED     REJECTED → IN_PROGRESS
```

## Global states

```
INIT → PLANNED → SCRUTINY → TESTS_WRITTEN → IMPLEMENTING → VERIFYING → DONE
                     ↓                           ↓              ↓
               SCRUTINY_FAIL              BLOCKED        REJECTION_LOOP
```

## Transitions

| From | To | Trigger |
|---|---|---|
| INIT | PLANNED | Orchestrator writes spec files |
| PLANNED | SCRUTINY | Orchestrator delegates to scrutiny validator |
| SCRUTINY | TESTS_WRITTEN | Scrutiny passes; unittest validator writes RED tests |
| TESTS_WRITTEN | IMPLEMENTING | Worker starts implementation |
| IMPLEMENTING | HANDOFF | Worker makes tests GREEN |
| HANDOFF | VERIFYING | Verifier reviews |
| VERIFYING | VERIFIED | Verifier confirms GREEN |
| VERIFYING | REJECTED | Verifier finds failure |
| REJECTED | IMPLEMENTING | Worker fixes |
| All | BLOCKED | Agent cannot proceed |
