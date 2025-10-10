# Idle Tycoon Web

A modern browser-based idle/incremental game inspired by AdVenture Capitalist, built with Next.js, React, and TypeScript.

## 🎮 Features

### MVP (Current Release)
- **6-8 Business Lines**: Progressive unlocking system from Lemonade Stand to Movie Studio
- **Managers**: Automate your businesses by hiring dedicated managers
- **Upgrades**: Business-specific and global multipliers to boost income
- **Bulk Buy**: Purchase 1x, 10x, or 100x levels at once
- **Offline Progress**: Continue earning while away (up to 12 hours)
- **Prestige System**: Reset for permanent multipliers
- **Responsive UI**: Mobile-first design with smooth animations
- **PWA Support**: Installable as a native app
- **Persistent Saves**: Automatic saving via IndexedDB

### Post-MVP (Planned)
- Research tree system
- Seasonal events
- Multiple worlds/dimensions
- Cloud saves
- Analytics dashboards
- Live operations hooks

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9.0.0+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/idle-tycoon-web.git
cd idle-tycoon-web

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The game will be available at `http://localhost:3000`

### Build & Production

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Run tests
pnpm test

# Build for production
pnpm build

# Start production server
pnpm start
```

## 🔒 Security Setup

### GitHub Actions CI/CD

This project uses Snyk for security scanning in CI/CD. To enable security scans:

1. **Create a Snyk Account**: Sign up at [snyk.io](https://snyk.io)

2. **Get Your Token**: 
   - Go to Account Settings → General → Auth Token
   - Copy your personal token

3. **Add to GitHub Secrets**:
   - Go to your repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `SNYK_TOKEN`
   - Value: Your Snyk token

4. **Enable Branch Protection** (recommended):
   - Go to Settings → Branches
   - Add rule for `main` branch
   - Enable "Require status checks to pass before merging"
   - Select the CI workflow checks

The CI pipeline will:
- Run Snyk Open Source scan for dependencies
- Run Snyk Code scan for SAST
- Fail on medium or higher severity issues
- Block merges if security issues are found

## 🏗️ Architecture

### Monorepo Structure

```
idle-tycoon-web/
├─ apps/web/                # Next.js frontend application
│  ├─ app/                  # App Router pages
│  ├─ components/           # React components
│  ├─ lib/                  # Hooks and utilities
│  └─ public/               # Static assets
├─ packages/
│  ├─ sim-core/             # Game simulation engine
│  │  ├─ economy/           # Formulas and constants
│  │  ├─ engine/            # Core simulation logic
│  │  ├─ save/              # Save system with migrations
│  │  ├─ types/             # TypeScript types and schemas
│  │  └─ worker/            # Web Worker for background processing
│  └─ ui-kit/               # Shared UI components
└─ .github/workflows/       # CI/CD pipelines
```

### Key Technologies

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **State Management**: Zustand with Immer
- **Data Persistence**: IndexedDB via localForage
- **Math**: Big.js for arbitrary precision
- **PWA**: next-pwa for offline support
- **Testing**: Vitest, React Testing Library
- **CI/CD**: GitHub Actions, Vercel

### Simulation Architecture

The game uses a deterministic simulation running in a Web Worker:
- Fixed timestep (100-250ms ticks)
- Offline progress calculation on resume
- State snapshots sent to UI
- All game logic isolated from React

## 📊 Game Balancing

### Economy Configuration

Edit `packages/sim-core/src/economy/constants.ts` to adjust:
- Business costs and income
- Manager prices and requirements
- Upgrade effects and costs
- Prestige formulas

### Balancing Script

Run the balancing analyzer:
```bash
pnpm --filter @idle-tycoon/sim-core run balance
```

This generates a CSV with progression curves for tuning.

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Test Structure
- Unit tests for formulas and game logic
- Integration tests for save/load system
- Component tests for UI elements
- E2E tests with Playwright (optional)

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: `pnpm test`
5. **Run linting**: `pnpm lint`
6. **Commit changes**: `git commit -m 'Add amazing feature'`
7. **Push to branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Contribution Guidelines
- All PRs must pass CI checks
- Security scans must pass (no medium+ issues)
- Changes to economy require unit tests
- Keep `sim-core` package framework-agnostic
- Follow existing code style

## 📜 License

This project is currently proprietary. All rights reserved.

## 🙏 Acknowledgments

- Inspired by AdVenture Capitalist
- Built with modern web technologies
- Security scanning powered by Snyk