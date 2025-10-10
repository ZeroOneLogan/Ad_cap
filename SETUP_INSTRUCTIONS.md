# Idle Tycoon Web - Setup Instructions

## 🚀 Quick Start

Since this is running in Codex Web, I cannot execute local commands. Please follow these instructions to get your game running:

### 1. Install Dependencies

Open your terminal in the project root and run:

```bash
pnpm install
```

### 2. Start Development Server

```bash
pnpm dev
```

Your game will be available at http://localhost:3000

## 🔐 Security Setup (Required for CI)

1. **Create a Snyk Account**
   - Go to https://snyk.io
   - Sign up for a free account
   - Go to Account Settings → General → Auth Token
   - Copy your token

2. **Add Token to GitHub**
   - Go to your GitHub repository
   - Navigate to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `SNYK_TOKEN`
   - Value: Paste your Snyk token
   - Click "Add secret"

3. **Enable Branch Protection**
   - Go to Settings → Branches
   - Add rule for `main` branch
   - Enable "Require status checks to pass"
   - Select `build-test-scan`
   - Save changes

## 🎮 Game Features Implemented

✅ **Core Game Loop**
- 8 progressive businesses (Lemonade Stand → Movie Studio)
- Exponential cost/income progression
- Automated income generation

✅ **Managers**
- Unlock at business level 25
- Automate business income collection
- One manager per business type

✅ **Upgrades**
- Business-specific multipliers (2x, 4x income)
- Global multipliers affecting all businesses
- Speed upgrades to reduce cycle times

✅ **Prestige System**
- Reset progress for permanent multipliers
- Formula: prestige = floor(150 × totalEarnings^0.7)
- 10% income boost per prestige level
- 1% speed boost per prestige level

✅ **Persistence**
- Auto-save every 30 seconds
- IndexedDB storage with migrations
- Offline progress calculation (up to 12 hours)

✅ **PWA Support**
- Installable on mobile/desktop
- Works offline
- Service worker caching

✅ **Performance**
- Simulation runs in Web Worker
- Non-blocking UI updates
- Deterministic calculations
- Big number support (up to 10^308)

## 📁 Project Structure

```
idle-tycoon-web/
├── apps/web/              # Next.js frontend
├── packages/
│   ├── sim-core/         # Game simulation engine
│   └── ui-kit/          # Shared UI components
├── .github/workflows/    # CI/CD pipelines
└── scripts/             # Utility scripts
```

## 🧪 Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test -- --coverage

# Run in watch mode
pnpm test -- --watch
```

## 📊 Game Balancing

Generate balance data CSV files:

```bash
pnpm balance:sweep
```

This creates CSV files in `balance-data/` with:
- Business progression curves
- ROI calculations
- Prestige point thresholds

## 🚢 Deployment Options

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Deploy with zero config

### Docker
```bash
docker build -t idle-tycoon .
docker run -p 3000:3000 idle-tycoon
```

### Manual Build
```bash
pnpm build
pnpm start
```

## ⚠️ Important Notes

1. **PWA Icons**: Generate proper icons before production deployment
   - Use https://www.pwabuilder.com/imageGenerator
   - Replace placeholder in `apps/web/public/icons/`

2. **Environment Variables**: For production, set:
   - `NODE_ENV=production`
   - Any analytics keys (optional)

3. **Security**: The CI pipeline will block any PRs with:
   - Medium+ severity vulnerabilities
   - Failed tests or type checks
   - Linting errors

## 🐛 Troubleshooting

### "SNYK_TOKEN not found"
- Ensure the GitHub secret is properly set
- Check token hasn't expired in Snyk account

### Build fails locally
- Ensure Node.js 20+ is installed
- Clear cache: `rm -rf node_modules .next`
- Reinstall: `pnpm install`

### Game doesn't save
- Check browser allows IndexedDB
- Clear browser storage and reload
- Check console for errors

## 📚 Next Steps

1. **Customize Content**
   - Edit businesses in `packages/sim-core/src/economy/constants.ts`
   - Adjust formulas in `formulas.ts`
   - Add new upgrades/managers

2. **Enhance UI**
   - Add more animations
   - Create achievement system
   - Add sound effects

3. **Expand Features**
   - Research tree
   - Multiple worlds
   - Seasonal events
   - Cloud saves

## 🆘 Support

- Check README.md for detailed documentation
- Review test files for usage examples
- Create GitHub issues for bugs

Happy idling! 🎮