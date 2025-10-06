Agents.md — Idle Tycoon Web (Codex Web Safe)

Context: You are running Codex in the browser. You cannot execute MCP tools or local shell commands. Your job is to generate files, configure CI, and print exact instructions the user can run locally if needed. All security scanning must be enforced via GitHub Actions, not MCP.

⸻

Project Title

Idle Tycoon Web — a modern browser idle/incremental game inspired by AdVenture Capitalist, with deeper systems and premium feel.

Project Overview
	•	Loop: Earn → invest → automate → prestige → expand → events.
	•	MVP (first release): 6–8 business lines, managers, upgrades, bulk‑buy, offline progress, prestige v1, responsive UI, persistent saves, PWA, preview deploy.
	•	Post‑MVP: Research tree, seasonal events, multi‑worlds, cloud saves, analytics dashboards, live‑ops hooks.

Non‑Negotiables
	1.	Security scans must run in CI (Snyk CLI via GitHub Actions). Block merge on ≥ medium severity.
	2.	Great feel: snappy UI, micro‑animation polish, clear math, big‑number formatting, mobile‑first.
	3.	Deterministic simulation core separate from React; runs in a Web Worker.

⸻

Tech Stack
	•	App: Next.js (App Router) + React 18 + TypeScript
	•	Styles: Tailwind CSS + Framer Motion (respect prefers-reduced-motion)
	•	State: Zustand/Jotai + Immer
	•	Persistence: IndexedDB via localForage (migrations included)
	•	PWA: next-pwa (installable, offline cache)
	•	Numbers/Math: decimal.js or big.js for massive values
	•	Charts: Recharts (lightweight)
	•	Testing: Vitest + React Testing Library; Playwright (optional)
	•	Tooling: pnpm, ESLint, Prettier, Changesets (optional)
	•	CI/CD: GitHub Actions + Vercel previews

⸻

Monorepo Architecture

idle-tycoon-web/
├─ apps/web/                     # Next.js front end
│  ├─ app/                       # routes (App Router)
│  ├─ components/                # UI components
│  ├─ lib/                       # helpers, hooks
│  ├─ pwa/                       # manifest, service worker
│  └─ styles/                    # Tailwind
├─ packages/
│  ├─ sim-core/                  # headless game simulation
│  │  ├─ economy/                # formulas & constants
│  │  ├─ features/               # upgrades, managers, prestige
│  │  ├─ save/                   # serialization, migrations
│  │  ├─ worker/                 # web‑worker tick executor
│  │  └─ types/                  # shared types & zod schemas
│  └─ ui-kit/                    # design tokens + primitives
├─ .github/workflows/            # CI pipelines (build, test, snyk)
├─ package.json                  # pnpm workspace root
└─ pnpm-workspace.yaml

Tick Model: fixed timestep (100–250ms). Offline progress computed from lastSeen. Avoid floating‑point drift; prefer decimal/bigint.

⸻

Game Design — MVP Details
	•	Businesses: 6–8 progressive lines; unlock chain; each line has cost curve and income rate.
	•	Example formulas
	•	cost(n) = baseCost × costGrowth^n
	•	rate(n) = baseRate × (upgradeMult × managerMult × globalMult)
	•	Bulk Buy: x1/x10/max with preview math.
	•	Managers: unlock automation per line.
	•	Upgrades: per‑line and global; linear + milestone.
	•	Prestige: reset to earn meta‑currency with persistent bonuses.
	•	Seed formula: prestige = floor(k × totalEarnings^α) with α∈[0.6,0.8] (tune later).
	•	Offline: cap grant window (e.g., 8–12h) and show summary on resume.

⸻

Data & Balancing
	•	Central economy.ts for constants.
	•	Content as JSON DSL (businesses, upgrades, milestones). Provide a balancing script that sweeps curves and prints CSV.

⸻

Performance & UX
	•	Simulation in Web Worker; UI only reads snapshots.
	•	Memoized selectors to minimize re‑renders.
	•	Animated affordances (buyable glow, milestone toasts) and haptic‑like feedback.
	•	Compact number formatting (K, M, B, T, aa, ab, …) with locale‑aware display.

⸻

Persistence
	•	IndexedDB via localForage with versioned schema and migrations.
	•	Cloud save (Supabase) is post‑MVP.

⸻

Security & Compliance (CI‑Only, No MCP)

Because Codex is running on the web, it must not attempt to run MCP or local commands. Instead, Codex must create the following files and print setup instructions:
	1.	GitHub Secret required: SNYK_TOKEN (create in repo → Settings → Secrets → Actions).
	2.	Workflow file: .github/workflows/ci.yml with jobs in this order:
	•	checkout → setup Node → setup pnpm → install → Snyk Open‑Source (SCA) scan → Snyk Code scan → typecheck → lint → unit tests → build → upload artifacts → Vercel preview (optional).
	3.	Fail the workflow on ≥ medium severity issues so merges are blocked by branch protection rules.

Example CI (Codex must generate this file):

name: CI
on:
  pull_request:
  push:
    branches: [main]
jobs:
  build-test-scan:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      security-events: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - run: pnpm install --frozen-lockfile

      # Snyk Open Source (dependencies)
      - name: Snyk Open Source
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: test --severity-threshold=medium

      # Snyk Code (SAST)
      - name: Snyk Code
        run: npx snyk code test --severity-threshold=medium
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

      - run: pnpm run typecheck
      - run: pnpm run lint
      - run: pnpm run test -- --run
      - run: pnpm run build

      # Optionally upload SARIF to GitHub Code Scanning
      - name: Upload Snyk Code results
        if: always()
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: snyk.sarif
          category: snyk-code

Note: If npx snyk is not available, Codex must add snyk as a devDependency and wire scripts accordingly. The user must add SNYK_TOKEN for scans to function.

⸻

Scripts (Codex should add to root package.json)

{
  "scripts": {
    "dev": "next dev -w apps/web",
    "build": "next build apps/web",
    "start": "next start apps/web",
    "typecheck": "tsc -p . --noEmit",
    "lint": "eslint .",
    "format": "prettier -w .",
    "test": "vitest"
  }
}


⸻

Step‑By‑Step Tasks for Codex (Web‑Safe)
	1.	Scaffold repo
	•	Create pnpm workspace, apps/web (Next.js + Tailwind), packages/sim-core, packages/ui-kit.
	•	Set up ESLint/Prettier/TS config; add Vitest.
	2.	Simulation core
	•	Implement deterministic tick, business cost/rate formulas, upgrades, managers, prestige, offline calculator.
	•	Add unit tests covering formulas and serialization.
	•	Provide a Web Worker that produces read‑only state snapshots.
	3.	UI MVP
	•	Business list with bulk buy (x1/x10/max), managers, upgrades; disabled states and tooltips.
	•	Balance sheet panel and prestige modal.
	•	Number formatting and basic animations.
	4.	Persistence & PWA
	•	localForage save/load with versioned migrations.
	•	Add manifest and service worker; ensure installable.
	5.	Security & CI
	•	Generate .github/workflows/ci.yml (above), add README.md section on SNYK_TOKEN.
	•	Emit a README-security.md that explains how scans block merges.
	6.	Preview Deploy
	•	Add Vercel project settings instructions in README.md. If Vercel token/setup is unavailable, skip deployment step but keep CI.

⸻

Acceptance Criteria (MVP)
	•	Core loop playable on desktop & mobile.
	•	Save/Load survives reload and device restarts.
	•	Offline grant correct within ±0.1% of formula for a known interval.
	•	Prestige resets state and grants permanent bonus.
	•	CI runs Snyk SCA + Code scans and fails on ≥ medium severity.
	•	Build succeeds; app serves without console errors.

⸻

README Additions Codex Must Write
	•	Quickstart (pnpm install, dev, build, start).
	•	Security Setup (add SNYK_TOKEN secret; how CI blocks merges; how to view results).
	•	Architecture Overview (sim-core/worker, UI store, PWA).
	•	Balancing Guide (editing economy JSON and running the sweep script).

⸻

Contributing
	•	All PRs must pass typecheck, lint, unit tests, build, and CI security scans.
	•	Any change to economy/save logic requires unit tests.
	•	Keep packages/sim-core framework‑agnostic.

⸻

License
	•	Proprietary for now (or AGPL‑3.0 if you prefer copyleft—decide before open‑sourcing).
