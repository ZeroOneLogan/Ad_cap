# AdCap+

This repository contains lightweight Swift models that explore the prestige math
behind the AdCap+ idle economy. The core of the project is a reusable
`AngelInvestorCalculator` that turns lifetime earnings into prestige rewards and
production multipliers, mirroring the systems documented in the design brief.

## Packages

The Swift package `AdCapPlus` exposes the `AdCapCore` library target.

### AngelInvestorCalculator

* Smoothly converts lifetime earnings into angel investors using configurable
  parameters (threshold, scaling factor, and exponent).
* Provides helper utilities to evaluate prestige resets, estimate production
  multipliers with diminishing returns, and determine the earnings needed to hit
  a target angel milestone.

## Running Tests

```bash
swift test
```
