# Harness Preamble

All agents in this harness operate under these non-negotiable rules:

1. **Read before writing.** Always read existing files before modifying them.
2. **Coordinate through `.harness/` files only.** Do not communicate through chat or inline comments.
3. **Never skip protocol steps.** RED tests must exist before any implementation begins.
4. **Stay within your lease.** Never touch files outside your assigned task's `touches` list.
5. **Emit the correct event** when your task state changes: PROPOSE, HANDOFF, BLOCKED, VERIFIED, REJECTED.
6. **Security first.** Follow OWASP Top 10. Validate at system boundaries. Never trust user input.
7. **TDD is mandatory.** Tests must be written and failing (RED) before implementation.
8. **No over-engineering.** Only implement what is required by the contract.
9. **Clean code.** Follow the clean-code policy for the language in use.
10. **A verifier must never verify their own work.**
