# Security Scanning Overview

Idle Tycoon Web enforces security scanning exclusively through GitHub Actions, keeping local developer environments clean while preserving a high security bar.

## Workflow Summary

- **Location**: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)
- **Triggers**: `push` events to `main` and all pull requests.
- **Tools**:
  - `snyk/actions/node@master` runs Snyk Open Source (SCA) against workspace dependencies with `--severity-threshold=medium`.
  - `npx snyk code test --severity-threshold=medium` performs SAST analysis (Snyk Code).
- **Failure policy**: Both Snyk steps exit non-zero on medium or higher severity findings, preventing merges when branch protection is configured.
- **SARIF upload**: Results are published back to GitHub via `github/codeql-action/upload-sarif@v3`, populating the “Code scanning alerts” tab.

## Required Secrets

Add a repository secret named `SNYK_TOKEN` that contains a Snyk API token with permission to run both Open Source and Code scans.

## Local Guidance

Developers do not need to install or execute Snyk locally. Instead, review findings inside GitHub after each CI run:

1. Open the failing workflow run to inspect console output.
2. Navigate to **Security → Code scanning alerts** for a triaged view with file annotations.
3. Resolve vulnerabilities (upgrade packages, refactor code) and re-run CI.

## Blocking Criteria

- Medium, high, or critical Snyk findings block merges.
- Typecheck, lint, test, and build steps must all pass; CI is an all-or-nothing gate.

## Extending Coverage

To extend the security posture:

- Enable additional Snyk monitors for continuous dependency tracking.
- Add dependency review or license compliance actions.
- Integrate Playwright smoke tests to catch DOM XSS regressions alongside SAST.
