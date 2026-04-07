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
- [ ] User authentication via Google OAuth
- [ ] Account dashboard
- [ ] Deposit and withdrawal
- [ ] Account transfers
- [ ] Transaction history
- [ ] Audit log — every action recorded

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

## Roadmap
- [x] Phase 1 — Project foundation and dev tooling
- [ ] Phase 2 — Database schema and audit log
- [ ] Phase 3 — Authentication
- [ ] Phase 4 — Core banking API
- [ ] Phase 5 — Frontend templates
- [ ] Phase 6 — Security hardening
- [ ] Phase 7 — Portfolio polish and live demo

---
*Built by Sheila Alfaro — NJ, USA*