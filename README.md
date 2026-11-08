# LoanBridge

### AI-Assisted Personal Loan Restructuring & Banking Integration Portal

LoanBridge is a full-stack Forward Deployed Engineering (FDE) portfolio project demonstrating how a regional bank can integrate a legacy loan servicing system with a modern lending platform.

> Project status: In development. All banking systems and loan records are simulated.

## Business Problem

Loan servicing teams often rely on disconnected legacy systems and manual workflows to evaluate personal loan restructuring requests. This creates operational delays, inconsistent validation, and limited visibility into approval and integration outcomes.

## Proposed Solution

LoanBridge will provide:

- Personal loan lookup and validation
- Repayment restructuring simulations
- AI-assisted explanations of proposed changes
- Human review and approval workflows
- Integration with mock legacy and modern lending APIs
- Audit trails and resilient error handling

## Technology Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Zustand
- Backend: Node.js, Express, TypeScript
- Database: SQLite, Prisma
- AI: Provider adapter with mock fallback
- Testing: Vitest, Supertest, Playwright
- CI/CD: GitHub Actions

## Architecture

Legacy Banking API → LoanBridge Backend → Modern Lending Platform API

The React portal communicates with the LoanBridge backend, which handles validation, simulations, approvals, AI explanations, and integration orchestration.

## Project Roadmap

- [x] Phase 1: Requirements and System Design
- [ ] Phase 2: Environment and Repository Setup
- [ ] Phase 3: Backend APIs and Integration
- [ ] Phase 4: Frontend Development
- [ ] Phase 5: Testing and Deployment

## Demo

Live demo: Coming soon.

## Disclaimer

This is an independent educational portfolio project using synthetic data and fictional banking systems. It is not affiliated with or endorsed by any financial institution. Calculations are illustrative and not financial advice.