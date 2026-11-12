# LoanBridge

### AI-Assisted Personal Loan Restructuring & Banking Integration Portal

LoanBridge is a full-stack **Forward Deployed Engineering (FDE) portfolio project** demonstrating how a regional bank could connect legacy loan servicing workflows with a modern lending platform.

The project focuses on API development, financial workflow orchestration, integration reliability, human approval processes, and the future integration of AI-assisted capabilities.

**Project Status:** Phase 2 Complete — Phase 3 Upcoming

> All banking systems and loan records are simulated. This is an educational portfolio project, not a production banking application.

## Business Problem

Loan servicing teams often rely on disconnected legacy systems and manual workflows to evaluate personal loan restructuring requests.

These challenges can result in:

- Operational delays
- Inconsistent eligibility validation
- Manual repayment calculations
- Limited visibility into approval decisions
- Difficulties reconciling integration failures

## Solution Overview

LoanBridge is being developed to demonstrate an end-to-end restructuring workflow, from loan retrieval and eligibility checks to repayment simulation, manager approval, and integration execution.

### Implemented Capabilities

- Retrieve synthetic personal loan records through REST APIs
- Validate loan eligibility for restructuring
- Simulate repayment changes using proposed APR and loan terms
- Calculate estimated monthly payments and interest
- Create and retrieve restructuring proposals
- Submit proposals for manager approval
- Enforce separate analyst and manager approval roles in the demo
- Record workflow audit events
- Execute approved proposals through a simulated integration workflow
- Handle simulated integration timeouts and reconciliation-required states
- Generate template-based explanations of repayment changes
- Provide a dashboard summary API

### Planned Enhancements

- Expanded core application functionality and integrations
- AI-powered explanations through a model provider
- Persistent database storage
- Additional end-to-end testing
- Deployment and CI/CD improvements

## Technology Stack

### Current Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| API | REST, JSON |
| Validation | Zod |
| Testing | Vitest |
| Version Control | Git, GitHub |
| Data | In-memory synthetic loan and proposal records |

Additional technologies and integrations will be documented as they are implemented and verified.

## Architecture

LoanBridge uses a React frontend communicating with a Node.js and Express backend.

The backend provides loan servicing APIs, restructuring calculations, proposal workflows, approval controls, audit logging, and simulated integration behavior.

**Conceptual integration architecture:**

Legacy Banking System → LoanBridge Backend → Modern Lending Platform

**Current implementation:**

React Portal → Express REST APIs → In-Memory Synthetic Banking Data and Workflows

The external banking platforms are fictional. The current implementation does not connect to live financial institutions.

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

```bash
git clone https://github.com/vpesaru-test/loanbridge-fde-platform.git
cd loanbridge-fde-platform
npm install
```

### Start the Application

```bash
npm run dev
```

Default local development endpoints:

- Frontend: http://localhost:5173
- Backend: http://localhost:4000
- Health API: http://localhost:4000/api/health

### Production Build

```bash
npm run build
```

### Run Automated Tests

```bash
npm test
```

## Testing and Verification

Phase 2 verification completed successfully.

**Automated backend tests: 3 passed, 0 failed.**

Verified scenarios:

1. Loan restructuring amortization calculations
2. Eligibility restrictions for delinquent loans
3. Separate manager approval and idempotent execution

Additional manual API verification covered loan retrieval, eligibility checks, proposal simulation, validation errors, proposal creation, and manager approval.

Both backend and frontend production builds completed successfully.

Automated testing coverage will expand as development progresses.

## Project Roadmap

- [x] Phase 1: Requirements and System Design
- [x] Phase 2: Technology Stack and Environment Setup
- [ ] Phase 3: Core Application Development and Integration
- [ ] Phase 4: AI Integration and Advanced Workflows
- [ ] Phase 5: Testing, Deployment, and Portfolio Readiness

The roadmap may evolve as implementation progresses.

## AI Integration Status

LoanBridge is designed to support AI-assisted financial workflow explanations.

Currently, the explanation endpoint uses a **local template-based demonstration**.

Integration with an AI model provider is planned for a future phase.

AI-generated explanations will be informational and will not replace human approval decisions.

## Demo

Live demo: Coming soon.

The application can currently be run locally using the instructions above.

## Disclaimer

LoanBridge is an independent educational portfolio project using synthetic data and fictional banking systems.

It is not affiliated with or endorsed by any financial institution.

All financial calculations are illustrative and are not financial advice.

The current demo uses simplified role identification and in-memory data storage. It is not intended for production use.