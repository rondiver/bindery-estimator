# Project: Bindery Estimator

## Purpose
This project builds an estimating and job-tracking system for commercial bindery services.
The system produces quotes, tickets, and PDFs from structured job data.

## Operating Rules
- Prefer simple, explicit solutions over clever ones
- Avoid premature abstractions
- Do not introduce libraries without justification
- Match existing patterns before adding new ones
- Optimize for readability and maintainability

## Environment
- OS: Ubuntu 24.04 (WSL2)
- Runtime: Node.js 20
- Package manager: npm
- Version control: Git (SSH)
- Deployment: Vercel (via GitHub)

## Coding Standards
- TypeScript preferred
- No implicit `any`
- Explicit interfaces for core data models
- Functions under 50 lines where possible
- No commented-out code

## Data & Security
- No PHI or sensitive production data in repo
- Use environment variables for secrets
- Validate all external inputs

## Claude Instructions
- Ask clarifying questions before major structural changes
- Explain tradeoffs briefly
- Generate diffs or file-level changes, not prose
- Do not refactor unrelated code
- Do not invent requirements

## Out of Scope
- UI polish beyond functional layouts
- Premature scaling concerns
- Unsupported platforms
