# Harness Kernel: Principles

1. **RED before GREEN.** Tests must fail before any implementation is written.
2. **Minimal implementation.** Implement only what makes tests pass.
3. **Separation of concerns.** Each agent has a single responsibility.
4. **No implicit trust.** All inputs must be validated at system boundaries.
5. **Audit everything.** All state transitions are recorded as events.
6. **Immutable contracts.** Task contracts define the scope; workers must not exceed it.
7. **Security by design.** Sensitive data must be encrypted at rest and in transit.
8. **Reversible state.** Prefer actions that can be undone; require confirmation for destructive operations.
9. **Transparency.** All decisions are recorded in `.harness/` files.
10. **No side-channel communication.** Agents communicate only through `.harness/` files.
