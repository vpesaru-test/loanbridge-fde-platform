# LoanBridge architecture and learning notes

## Customer problem

A fictional regional bank needs a controlled way to simulate modifications to existing unsecured personal loans while bridging a legacy servicing system and a modern lending platform.

## Business rules in this demo

- Only ACTIVE loans can be simulated and proposed.
- Proposed APR must be 0–30%, term 6–84 months.
- Proposals begin in DRAFT, then PENDING_APPROVAL, APPROVED/REJECTED, and COMPLETED.
- A Manager role is required to approve; the creator cannot approve their own proposal.
- Execution requires approval, checks source loan version, and is idempotent for completed proposals.
- All state transitions produce audit events.

## Architecture decision records

1. **React + Vite:** lightweight and easy to understand for JavaScript learners.
2. **Zustand:** stores UI navigation, selected loan and demo role; server is the source of truth for proposals.
3. **Express + Zod:** explicit HTTP routes and input validation, similar to enterprise integration gateways.
4. **Pure payment engine:** deterministic function, easy to unit-test and review.
5. **In-memory persistence:** removes local installation barriers, at the cost of losing state on restart.
6. **Mock AI provider:** demonstrates the integration seam without external credentials or non-deterministic responses.

## Future integration boundary

Legacy fields might be `LN_ACCT_NO`, `CUR_BAL`, `INT_RATE`, and `TERM_LEFT`. A dedicated adapter would map these to the canonical Loan model and validate units and provenance. The modern platform adapter would translate an approved proposal into a modification command and persist idempotency keys and external request IDs.

## Security and compliance gaps

The demo role switcher is **not** authentication. Production use requires OIDC, server-side role authorization, least privilege, protected secrets, PII minimization, encrypted storage, audit retention policy, and domain/legal review. Current synthetic names are not real borrower identities. Never import bank production data.

## Test strategy

- Unit tests: payment formula, zero APR, boundaries.
- API tests: validation, eligibility, approvals, conflict status, idempotency.
- Next iteration: Playwright E2E, accessibility, contract and failure-injection tests.

## Explanation of the payment calculation

The engine computes the standard fully amortizing fixed-payment formula using monthly rate `APR / 1200`. It rounds the monthly payment to cents. For zero APR, it divides principal by term. Real lending systems must account for accrual methods, fees, payment timing, rounding and contract-specific requirements.
