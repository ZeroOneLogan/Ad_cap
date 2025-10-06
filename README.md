# Idle Tycoon Web

Idle Tycoon Web is a modern incremental game that pairs a deterministic simulation core with a premium-feeling Next.js front end. Invest in businesses, hire managers, secure upgrades, and prestige your way to exponential riches across desktop and mobile.

## Quickstart

```bash
pnpm install
pnpm dev      # run Next.js with the App Router
pnpm build    # production build
pnpm start    # run the production server
pnpm test     # run Vitest unit tests
pnpm lint     # run ESLint checks
pnpm typecheck
```

> **Note:** The pnpm lockfile is intentionally omitted from the repository to avoid binary-diff issues in the constrained Codex
> environment. After cloning, run `pnpm install` locally to generate a fresh `pnpm-lock.yaml` before committing changes.

## Security Setup

1. Create a new GitHub Actions secret named `SNYK_TOKEN` that contains an API token generated from your Snyk account.
2. The CI workflow defined in [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs Snyk Open Source and Snyk Code scans on every push and pull request. Both scans are configured to fail the pipeline on medium (or higher) severity issues, ensuring branch protection rules can block insecure merges.
3. Workflow results surface directly within the GitHub Actions UI and in the Code Scanning alerts view (via the SARIF upload step). Review findings there before merging.

A dedicated [README-security.md](README-security.md) file provides additional detail on the scanning pipeline.

## Architecture Overview

- **Monorepo layout** – A pnpm workspace with:
  - `apps/web` – Next.js App Router front end with Tailwind CSS, Framer Motion, and a client-side simulation orchestrator that syncs with a Web Worker.
  - `packages/sim-core` – Framework-agnostic deterministic simulation containing economy data, tick engine, offline calculator, serialization, and worker harness.
  - `packages/ui-kit` – Lightweight design primitives (Button, Card, StatPill) built on Tailwind tokens.
- **State flow** – The React UI uses Zustand with Immer to communicate with a dedicated Web Worker (`simWorker.worker.ts`). The worker hosts the simulation engine (`@idle-tycoon/sim-core`) and emits read-only snapshots for rendering. Bulk purchasing, upgrades, managers, and prestige commands are relayed via structured messages.
- **Persistence** – Saves are stored in IndexedDB via `localForage`. On load, saves are validated and migrated through the sim-core schema utilities, and offline progress is computed before the worker starts.
- **Numbers & math** – All monetary values rely on `decimal.js` to eliminate floating-point drift. Formatting utilities surface compact currency strings (K, M, B, aa...)
- **PWA** – `next-pwa` wraps the build, creating an installable experience with a manifest and service worker scaffold.

## Balancing Guide

Game economy content (businesses, upgrades, managers, prestige tiers) is defined in [`packages/sim-core/src/economy/economy.ts`](packages/sim-core/src/economy/economy.ts). To iterate on balancing:

1. Adjust constants or add new entries within the JSON-like configuration arrays.
2. Update or extend unit tests in [`packages/sim-core/src/__tests__/engine.test.ts`](packages/sim-core/src/__tests__/engine.test.ts) to cover new formulas.
3. Run `pnpm ts-node packages/sim-core/scripts/balance.ts` to export a CSV of per-level business costs for spreadsheet tuning.

## Vercel Preview Deploys

1. Create a new Vercel project and link it to this repository.
2. Set the **Framework Preset** to **Next.js** and ensure the build command is `pnpm build` with output directory `.next`.
3. Configure the following environment variables in Vercel (if needed):
   - `SNYK_TOKEN` – optional if you mirror CI scans in preview builds.
4. Pushes and pull requests will automatically receive preview deployments once Vercel is linked. The GitHub Action already builds the project, so no additional configuration is required for CI.

## Contributing

- All pull requests must pass `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, and the CI security scans before merge.
- Any adjustments to economy formulas, offline logic, or serialization must be paired with updated unit tests in `packages/sim-core`.
- Keep `packages/sim-core` free from React/DOM dependencies so it remains portable.

## License

Proprietary – distribution outside this repository requires explicit permission.
