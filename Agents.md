# Project Title
AdCap+ — A Modern Idle Capitalist for iOS

# Project Overview
**Purpose.** Build a premium-feeling idle/clicker economy game inspired by *Adventure Capitalist*—but deeper, fairer, and smoother.  
**Functionality.** Tap/automate businesses, upgrade managers, prestige with “angel investors,” earn offline, complete live events, and compete via Game Center leaderboards—without predatory monetization.  
**Scenarios.** Single-player iOS app with optional cloud sync for saves, optional cosmetic IAPs, and weekend “event economies.”

**Why this project.** Classic idle games are fun but often grindy or pay-walled. AdCap+ focuses on elegant progression math, generous offline yield, and meaningful mid/late-game systems (synergy upgrades, research tree, rotating modifiers).

**Repository.** https://github.com/ZeroOneLogan/Ad_cap

---

# Tech Stack
**Frontend:** Swift 5.10+, SwiftUI, Combine/Observation, SF Symbols, GameKit UI  
**Backend (optional):** CloudKit or Firebase (Firestore) for cross-device save & analytics (privacy-respecting)  
**Data/Persistence:** Core Data (SQLite) or `GRDB.swift` (SQLite) + lightweight JSON snapshots for cloud sync  
**Monetization:** StoreKit 2 (non-consumable cosmetics, no pay-to-win)  
**Build/CI:** Xcode 16+, Swift Package Manager, fastlane, GitHub Actions  
**Quality:** XCTest, XCUITest, SwiftLint, SwiftFormat, Snyk (SCA + Code via MCP)  
**MCP Tools available to Codex:** `mcp_compass`, `mcp_fetch`, `mcp_filesystem`, `mcp_snyk_snyk_sca_scan`, `mcp_snyk_snyk_code_scan`

---

# Project Structure
```
Ad_cap/
├── AdCapPlus.xcodeproj
├── AdCapPlus/
│   ├── App/                     # @main App, Environment setup
│   ├── Features/
│   │   ├── Businesses/          # Business list, detail, upgrade flows
│   │   ├── Managers/            # Hire/upgrade managers, automation toggles
│   │   ├── Prestige/            # Angel calc, bonuses, reset
│   │   ├── Research/            # Meta-upgrades / tech tree
│   │   ├── Events/              # Limited-time event economies
│   │   ├── Economy/             # Balancing tables, growth curves, sim
│   │   └── Monetization/        # StoreKit 2, receipts, paywall
│   ├── Models/                  # Codable structs, Core Data entities
│   ├── ViewModels/              # MVVM glue, async/await ticks
│   ├── Views/                   # SwiftUI screens & components
│   ├── Services/                # Persistence, Cloud, Notifications, GameKit
│   ├── Persistence/             # Core Data stack / SQLite adapters
│   ├── Resources/               # Assets.xcassets, localized strings
│   ├── Config/                  # .xcconfig, Build settings, Secrets templates
│   └── Utilities/               # Extensions, Logging, Formatting
├── Packages/                    # Local SPM pkgs if needed
├── Tests/
│   ├── UnitTests/
│   └── UITests/
├── fastlane/
├── scripts/                     # CI, tools, pre-commit hooks
├── Docs/                        # Design notes, balancing, economy specs
└── README.md
```

---

# Development Guidelines

## Agent Operating Rules (Codex)
1. **Security Gate (MANDATORY & BLOCKING).**  
   After cloning or updating dependencies, **run both**:
   - `mcp_snyk_snyk_sca_scan` (dependency vulnerability scan)
   - `mcp_snyk_snyk_code_scan` (Snyk Code SAST)  
   If **any** vulnerability >= *medium* is found, Codex must:
   - Propose and apply fixes (upgrade SPM versions, refactor code, add guards).
   - Re-run both scans until clean (or risk accepted only if dev explicitly approves in writing).
   - Only then proceed with feature work, commits, or PRs.

2. **Tooling Budget & Check-ins.**  
   Use MCP tools judiciously (prefer ≤ 10 calls per major task). Summarize intended actions before mass refactors or dependency bumps.

3. **Deterministic Edits.**  
   All changes must include rationale in commit messages and update relevant docs/tests.

## Code Style
- **SwiftFormat & SwiftLint** in CI and pre-commit.  
- Prefer **MVVM** + unidirectional data flow; isolate time-based tick logic from views.  
- Concurrency: `async/await`, `Task` for ticks; avoid blocking the main thread.  
- Avoid magic numbers; centralize economy constants in `Features/Economy/`.

## Naming Conventions
- **Files/Types:** `PascalCase` (e.g., `AngelCalculator.swift`)  
- **Variables/Functions:** `camelCase`  
- **Async funcs:** suffix with contextual verbs (e.g., `recalculateAngelYield()`)

## Git Workflow
- **Branches:** `feat/<area>-<slug>`, `fix/<issue>-<slug>`, `chore/...`, `perf/...`  
- **Commits:** Conventional Commits (`feat:`, `fix:`, `refactor:`, `build:` …)  
- **PRs:** Must pass CI (build, tests, **Snyk SCA + Code**). Include screenshots for UI changes and a short testing checklist.

---

# Environment Setup

## Development Requirements
- **Xcode:** 16.x (iOS 18 SDK)  
- **Swift:** 5.10+  
- **SPM:** Built-in to Xcode  
- **Ruby (optional):** for fastlane  
- **Snyk Account/API:** configured for MCP snyk tools (handled via MCP)

## Installation Steps
```bash
# 1) Clone
git clone https://github.com/ZeroOneLogan/Ad_cap
cd Ad_cap

# 2) Open
open AdCapPlus.xcodeproj

# 3) Resolve SPM packages in Xcode (File > Packages > Resolve)
# 4) (MANDATORY) Run Snyk gates via MCP:
#    a) Dependency (SCA)
mcp_snyk_snyk_sca_scan {"path":"."}
#    b) Code (SAST)
mcp_snyk_snyk_code_scan {"path":"."}

# If findings >= medium severity exist, STOP and fix before building.
```

(Optionally configure **fastlane** for TestFlight and screenshots.)

---

# Core Feature Implementation

## Feature Module 1 — Idle Economy & Ticks
**Goal.** Deterministic income generation both online and offline.

**Approach.**
- Central `TickEngine` updates every 250–500ms using `Task.sleep` with drift compensation.
- `EconomyModel` holds business states (level, multiplier, manager status, cycle time).
- Offline earnings: compute from last seen timestamp + managers’ automation flags.

**Key Types.**
```swift
struct Business: Identifiable, Codable {
    let id: UUID
    var name: String
    var level: Int
    var baseYield: Decimal
    var cycleSeconds: Double
    var hasManager: Bool
    var multipliers: [Multiplier] // e.g., research, angels, events
}

final class TickEngine {
    private var task: Task<Void, Never>?
    func start(loop: @escaping () -> Void) {
        task = Task.detached { [weak self] in
            var next = ContinuousClock.now
            while !Task.isCancelled {
                loop()
                next += .milliseconds(350)
                try? await Task.sleep(until: next, tolerance: .milliseconds(20), clock: .continuous)
            }
        }
    }
    func stop() { task?.cancel() }
}
```

## Feature Module 2 — Prestige (“Angels”) & Research
**Goal.** Soften late-game stagnation.

**Approach.**
- `AngelCalculator` estimates angels from lifetime earnings with diminishing returns.
- Prestige snapshot saves core meta-progress; resets per-run state.
- Research tree grants global multipliers, unlocking with angel currency.

```swift
struct PrestigeSummary: Codable {
    let angelsGained: Decimal
    let multipliersUnlocked: [String]
}
```

---

# Testing Strategy

## Unit Testing
- **Framework:** XCTest  
- **Coverage:** ≥ 85% for `Features/Economy`, `Prestige`, and `OfflineEarnings`  
- **Org:** Mirror app module structure; test deterministic tick & math with fixed seeds.

## Integration Testing
- Simulate 24h offline earnings; ensure no overflow/NaN.  
- Validate StoreKit 2 purchase/restore in sandbox.  
- Cloud sync conflict resolution (last-writer-wins for non-critical; merge for currency).

## End-to-End (UI) Testing
- **Tools:** XCUITest  
- **Workflow:** On PR, launch, hire first manager, buy upgrades, perform prestige, verify UI states & balances.

---

# Deployment Guide

## Build Process
- Xcode Archive (Release).  
- Fastlane lanes: `beta` (TestFlight), `release` (App Store).

## Deployment Steps
1. Increment version & build number.  
2. Ensure **Snyk scans are clean**.  
3. Run fastlane `beta` to TestFlight.  
4. Smoke test on iPhone (latest & one older).  
5. Submit for review with privacy nutrition labels.

---

# Environment Variables
Use `.xcconfig` with placeholders in `Config/` and do **not** commit secrets.

```
ANALYTICS_WRITE_KEY=
FIREBASE_GOOGLE_PLIST_PATH=
APP_STORE_SHARED_SECRET=
GAMECENTER_LEADERBOARD_ID=
```

---

# Performance Optimization

## Frontend
- Prefer value-type models; avoid over-invalidating SwiftUI views (use `@Observable`/`@StateObject` correctly).  
- Use Instruments: Time Profiler, Allocations, Energy Log.  
- Batch recomputations per tick; render at 60fps but update economy at slower cadence.

## Backend/Storage
- Write-throttling for Core Data (e.g., every N seconds or on app background).  
- Compact snapshots for cloud sync to minimize payloads.

---

# Security Considerations

## Mandatory Snyk Gates (MCP)
- **SCA:** `mcp_snyk_snyk_sca_scan {"path":"."}`  
- **Code:** `mcp_snyk_snyk_code_scan {"path":"."}`  
- **Fix policy:** If any “medium” or higher vulnerability is found, Codex must:
  1. Propose fix (SPM upgrade, code change) with rationale.
  2. Apply fix.
  3. Re-scan both SCA & Code.
  4. Proceed only when clean (or explicitly approved risk).

## Data Security
- Validate all external inputs (IAP receipts, cloud payloads).  
- Use Keychain for secrets/tokens.  
- No sensitive data in logs; redact user identifiers.

## Authentication & Authorization
- StoreKit 2 handles purchases/entitlements locally; verify receipts server-side only if running a backend.  
- For cloud saves: per-user namespaces with CloudKit private DB or Firebase auth.

---

# Monitoring and Logging

## Application Monitoring
- Lightweight analytics (privacy-first): session counts, feature usage, crashes.  
- Error tracking (e.g., Xcode Organizer, optional Sentry/Crashlytics).

## Log Management
- Log levels: `debug`, `info`, `warn`, `error`.  
- Avoid PII; gate verbose logs behind debug builds.

---

# Common Issues

**Issue 1: SPM cache weirdness after dependency bumps**  
**Solution:** `File > Packages > Reset Package Caches`, clean build folder.

**Issue 2: StoreKit 2 purchases not appearing in sandbox**  
**Solution:** Sign out/in of sandbox account on device; reset transactions in App Store Connect; test on real device.

**Issue 3: Snyk reports Swift stdlib symbols**  
**Solution:** Confirm false positive via Snyk Code details; add minimal ignore with expiry **only** if justified and documented in PR.

---

# Reference Resources
- Apple: SwiftUI, Concurrency, StoreKit 2, GameKit docs  
- Balancing: “Idle game economy” articles, growth functions (exponential, polynomial, sigmoid)  
- Testing: XCTest / XCUITest guides  
- CI/CD: fastlane & GitHub Actions examples

---

# Changelog
**v0.1.0 (YYYY-MM-DD)**  
- Initial scaffold, economy model, tick engine, prestige shell, Snyk MCP gates wired.

---

## MCP Runbook (for Codex)
```xml
<runbook version="1.0">
  <step id="clone">
    <desc>Clone repo and open Xcode project</desc>
    <cmd>git clone https://github.com/ZeroOneLogan/Ad_cap</cmd>
  </step>

  <step id="security-gate" blocking="true">
    <desc>MANDATORY: Run Snyk scans via MCP; fail fast on findings</desc>
    <mcp call="mcp_snyk_snyk_sca_scan">{ "path": "." }</mcp>
    <mcp call="mcp_snyk_snyk_code_scan">{ "path": "." }</mcp>
    <onFinding severity="medium">
      <action>Propose & apply fixes; re-run scans until clean</action>
    </onFinding>
  </step>

  <step id="build">
    <desc>Resolve SPM, build Debug, run UnitTests</desc>
  </step>

  <step id="feature">
    <desc>Implement feature branch with tests; keep tool calls & changes summarized</desc>
  </step>

  <step id="ci">
    <desc>Open PR; CI must pass build, tests, and both Snyk scans</desc>
  </step>
</runbook>
```
