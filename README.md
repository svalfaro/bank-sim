# Bank Simulation

I've created a bank simulation that simulates core online banking operations like deposit, withdrawal, and transfer. However, this project not only taught me what to build but HOW to build an application. The roadmap is divided into phases, from setting up dev tools to testing. It's important to create a working quality application but the process of building this simulation offered the opportunity to simulate a professional engineering workflow: branching strategy, pull requests, and code review - even while building solo.

## Tech stack

- **Runtime:** Node.js
- **Framework:** Express
- **Templates:** Handlebars (server-side rendering)
- **Database:** PostgreSQL
- **Auth:** Google OAuth 2.0 + express-session
- **Security:** Helmet, CSRF protection, rate limiting, input validation

## Features

- [ ]  User authentication via Google OAuth
- [ ]  Account dashboard
- [ ]  Deposit and withdrawal
- [ ]  Account transfers
- [ ]  Transaction history
- [ ]  Audit log — every action recorded

## Project structure

<img alt="screenshot" src="../../../../var/folders/t_/b1c9tgb935zg5nx6w80cm5640000gn/T/TemporaryItems/NSIRD_screencaptureui_z2JJRz/Screenshot%202026-04-06%20at%205.52.38%E2%80%AFAM.png">

## Getting started

### Prerequisites

- Node.js
- PostgreSQL
- A Google OAuth app ([create one here](https://console.cloud.google.com))

### Installation

```bash
git clone git@github.com:svalfaro/bank-sim.git
cd bank-sim/server
npm install
cp ../.env.example ../.env   # fill in your values
npm run dev
```

## Development workflow

This project follows a structured Git workflow:

- `main` — stable, production-ready code
- `dev` — active development
- `feature/*` — one branch per feature, merged via pull request

## Development process

[will be filled out once completed; with logs]


## Security architecture

Bank Simulation implements defense-in-depth across multiple OWASP Top 10
categories. Security decisions are documented in code comments throughout
the codebase. This section maps implemented controls to specific categories.

### A01 — Broken Access Control

- Ownership verified at the **data layer** via SQL JOIN — not trusted from
  client input
- UUID primary keys prevent account enumeration attacks
- `ALLOWED_FIELDS` whitelist in `editAccount()` prevents mass assignment
- `ON DELETE RESTRICT` maintains referential integrity across all tables

### A03 — Injection Prevention

- Parameterized queries throughout — zero string concatenation in SQL
- ESLint rule `no-eval` enforced codebase-wide
- Handlebars escapes all template output by default — XSS prevention
  at the rendering layer

### A04 — Insecure Design

- Soft deletes only — financial records are never destroyed
- Immutable transactions — no `updated_at` column by design
- `NUMERIC(12,2)` for all financial values — prevents floating point errors
- ACID-compliant multi-step operations with `BEGIN/COMMIT/ROLLBACK`
- Server refuses to start without database connectivity — fail fast principle

### A05 — Security Misconfiguration

- `dotenv-safe` validates all required environment variables on startup
- `npm audit` resolved before every merge — 5 vulnerabilities patched
- `.env` excluded from version control — `.env.example` documents requirements
- Connection pool configured with timeouts — prevents pool exhaustion

### A06 — Vulnerable and Outdated Components

- `package-lock.json` committed — reproducible, auditable installs
- `npm audit` run on every dependency change
- No wildcard versions — intentional dependency pinning

### A07 — Identification and Authentication Failures

- Server-side sessions over JWT — instant invalidation capability
- Sessions stored in PostgreSQL — survive restarts, queryable, auditable
- Google OAuth 2.0 — passwords never stored or transmitted (Phase 3)
- Brute force protection via rate limiting (Phase 6)

### A09 — Security Logging and Monitoring Failures

- `audit_logs` table captures: actor, action, timestamp, IP address,
  user agent, and outcome for every sensitive operation
- Audit records are immutable — no `updated_at` column by design
- Failed authentication attempts logged even without a valid user
- HTTP request logging via morgan on every request
- Security metrics dashboard (Phase 7)

## Roadmap

- [X]  Phase 1 — Project foundation and dev tooling
- [ ]  Phase 2 — Database schema and audit log
- [ ]  Phase 3 — Authentication
- [ ]  Phase 4 — Core banking API
- [ ]  Phase 5 — Frontend templates
- [ ]  Phase 6 — Security hardening
- [ ]  Phase 7 — Portfolio polish and live demo

---

*Built by Sheila Alfaro — NJ, USA*
