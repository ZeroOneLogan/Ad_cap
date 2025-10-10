# Security Configuration Guide

This document explains the security setup for Idle Tycoon Web and how the CI/CD pipeline enforces security standards.

## Overview

The project uses Snyk for comprehensive security scanning:
- **Snyk Open Source**: Scans dependencies for known vulnerabilities
- **Snyk Code**: Static Application Security Testing (SAST) for code vulnerabilities

## CI/CD Security Workflow

### How It Works

1. **On Every PR and Push to Main**:
   - Dependencies are scanned for vulnerabilities
   - Source code is analyzed for security issues
   - Build fails if medium or higher severity issues are found
   - Results are uploaded to GitHub Security tab

2. **Blocking Merges**:
   - CI workflow must pass before merging
   - Security scans are part of required checks
   - This prevents vulnerable code from entering main branch

### Security Scan Results

You can view security findings in multiple places:

1. **Pull Request Checks**: Security status shown on each PR
2. **Actions Tab**: Detailed logs from security scans
3. **Security Tab**: GitHub Code Scanning results (if enabled)
4. **Snyk Dashboard**: Full details at app.snyk.io

## Setup Instructions

### 1. Prerequisites

- GitHub repository with admin access
- Snyk account (free tier works)

### 2. Configure Snyk Token

```bash
# Get your token from https://app.snyk.io/account
# Add to GitHub repository secrets as SNYK_TOKEN
```

### 3. Enable Branch Protection

1. Go to Settings → Branches
2. Add rule for `main` branch
3. Enable "Require status checks to pass"
4. Select these checks:
   - `build-test-scan`
   - Any other CI jobs

### 4. Configure Security Policies

Edit `.github/workflows/ci.yml` to adjust:
- Severity threshold (currently `medium`)
- Scan types (dependencies, code, containers)
- Additional security tools

## Security Best Practices

### Dependencies
- Review all dependency updates
- Use exact versions in package.json
- Run `pnpm audit` locally before commits
- Keep dependencies up to date

### Code Security
- Never commit secrets or API keys
- Use environment variables for sensitive data
- Validate all user inputs
- Sanitize data before rendering

### PWA Security
- Serve over HTTPS only
- Implement Content Security Policy
- Use secure service worker practices
- Validate offline data integrity

## Responding to Security Issues

### When CI Fails Due to Security

1. **Check the Logs**:
   ```bash
   # View failing action in GitHub Actions tab
   # Look for specific vulnerability details
   ```

2. **Fix Dependencies**:
   ```bash
   # Update vulnerable package
   pnpm update [package-name]
   
   # Or use Snyk to fix
   npx snyk fix
   ```

3. **Fix Code Issues**:
   - Review Snyk Code findings
   - Apply recommended fixes
   - Re-run scans locally

### Local Security Testing

Run security scans locally before pushing:

```bash
# Install Snyk CLI
npm install -g snyk

# Authenticate
snyk auth

# Test dependencies
snyk test

# Test code
snyk code test

# Get remediation advice
snyk fix
```

## Security Monitoring

### Automated Monitoring
- Snyk monitors dependencies continuously
- GitHub Dependabot provides alerts
- Security advisories tracked automatically

### Manual Reviews
- Review security tab weekly
- Check Snyk dashboard for new issues
- Update dependencies monthly

## Exceptions and Overrides

If you need to accept a risk:

1. **Document the Risk**:
   - Create `.snyk` policy file
   - Explain why it's acceptable
   - Set expiry date

2. **Example .snyk File**:
   ```yaml
   version: v1.25.0
   ignore:
     SNYK-JS-EXAMPLE-1234567:
       - '*':
           reason: False positive, not applicable
           expires: '2024-12-31T23:59:59.999Z'
   ```

3. **Get Approval**:
   - Discuss with team
   - Document in PR
   - Review periodically

## Contact

For security questions or to report vulnerabilities:
- Create a private security advisory in GitHub
- Contact the maintainers directly
- Do NOT create public issues for security problems