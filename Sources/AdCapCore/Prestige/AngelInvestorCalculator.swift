import Foundation

/// `AngelInvestorCalculator` encapsulates the prestige math used to determine
/// how many angel investors a player earns from lifetime earnings and how those
/// angels convert into production bonuses. The implementation favours smooth
/// progression over dramatic spikes while still rewarding long-term play.
public struct AngelInvestorCalculator: Sendable {
    /// Tunable constants that describe how prestige should scale.
    public struct Parameters: Equatable, Sendable {
        /// Minimum lifetime earnings required before any angels are awarded.
        public var activationEarnings: Decimal
        /// Divides the post-threshold earnings to keep numbers approachable.
        public var scalingFactor: Decimal
        /// Exponent that controls how aggressively earnings are converted into angels.
        public var growthExponent: Decimal
        /// When `true`, the calculator rounds down to whole angels.
        public var floorResults: Bool
        /// Percentage boost applied per angel before diminishing returns.
        public var linearAngelBonus: Decimal
        /// Number of angels granted the full linear bonus before tapering.
        public var diminishingReturnThreshold: Decimal
        /// Factor that reduces the bonus per angel once past the threshold.
        public var diminishingReturnFactor: Decimal

        public init(
            activationEarnings: Decimal = 100_000,
            scalingFactor: Decimal = 5_200,
            growthExponent: Decimal = 0.623,
            floorResults: Bool = true,
            linearAngelBonus: Decimal = 0.02,
            diminishingReturnThreshold: Decimal = 500,
            diminishingReturnFactor: Decimal = 0.0015
        ) {
            self.activationEarnings = activationEarnings
            self.scalingFactor = scalingFactor
            self.growthExponent = growthExponent
            self.floorResults = floorResults
            self.linearAngelBonus = linearAngelBonus
            self.diminishingReturnThreshold = diminishingReturnThreshold
            self.diminishingReturnFactor = diminishingReturnFactor
        }
    }

    public var parameters: Parameters

    public init(parameters: Parameters = Parameters()) {
        self.parameters = parameters
    }

    /// Returns the total angels earned for the provided `lifetimeEarnings`.
    ///
    /// The formula normalises post-threshold earnings, applies a configurable
    /// exponent, and optionally rounds down to the nearest whole angel.
    public func angelsEarned(lifetimeEarnings: Decimal) -> Decimal {
        guard lifetimeEarnings >= parameters.activationEarnings else {
            return 0
        }

        let angels = max(rawAngelsEarned(lifetimeEarnings: lifetimeEarnings), 0)
        return parameters.floorResults ? floorDecimal(angels) : angels
    }

    /// Provides the fractional progress towards earning the next angel.
    ///
    /// The returned value is always in the range `[0, 1)` where `0` means the
    /// player has just earned their latest angel and `1` represents that the
    /// next angel is imminent. Earnings below the activation threshold report
    /// a progress of `0`.
    public func progressTowardsNextAngel(lifetimeEarnings: Decimal) -> Decimal {
        guard lifetimeEarnings >= parameters.activationEarnings else {
            return 0
        }

        let angels = max(rawAngelsEarned(lifetimeEarnings: lifetimeEarnings), 0)
        let whole = floorDecimal(angels)
        let progress = angels - whole
        return max(progress, 0)
    }

    /// Calculates the number of angels that would be received by resetting now
    /// given the current angel total. The value is always non-negative.
    public func angelsAvailableOnReset(lifetimeEarnings: Decimal, currentAngels: Decimal) -> Decimal {
        let total = angelsEarned(lifetimeEarnings: lifetimeEarnings)
        return max(total - currentAngels, 0)
    }

    /// Determines the production multiplier derived from a given number of angels.
    ///
    /// Up to `diminishingReturnThreshold` angels, each angel grants the full
    /// `linearAngelBonus`. Beyond that point the marginal benefit gradually
    /// decreases based on `diminishingReturnFactor` to keep late-game scaling in
    /// check. The multiplier returned is expressed as a factor (e.g. `1.20` for
    /// a 20% boost).
    public func productionMultiplier(forAngels angels: Decimal) -> Decimal {
        guard angels > 0 else { return 1 }

        let threshold = parameters.diminishingReturnThreshold
        let perAngel = parameters.linearAngelBonus

        if angels <= threshold {
            return 1 + angels * perAngel
        }

        let guaranteedBonus = threshold * perAngel
        let surplus = angels - threshold
        let diminishingBonus = diminishingBonus(forSurplus: surplus, baseBonus: perAngel)
        return 1 + guaranteedBonus + diminishingBonus
    }

    /// Computes the lifetime earnings required to reach a desired amount of
    /// angels. The method never returns a value below `activationEarnings` and
    /// gracefully handles requests lower than the current total angels.
    public func earningsRequired(forTargetAngels targetAngels: Decimal) -> Decimal {
        let clampedTarget = max(targetAngels, 0)
        guard clampedTarget > 0 else { return parameters.activationEarnings }

        let exponent = Decimal(1) / parameters.growthExponent
        let growth = powDecimal(clampedTarget + 1, exponent)
        let epsilon = Decimal(0.000_001)
        let earnings = (growth - 1 + epsilon) * parameters.scalingFactor + parameters.activationEarnings
        return max(earnings, parameters.activationEarnings)
    }

    // MARK: - Private helpers

    private func diminishingBonus(forSurplus surplus: Decimal, baseBonus: Decimal) -> Decimal {
        guard surplus > 0 else { return 0 }

        let factor = parameters.diminishingReturnFactor
        let numerator = logDecimal(1 + surplus * factor)
        return baseBonus * numerator / factor
    }

    private func rawAngelsEarned(lifetimeEarnings: Decimal) -> Decimal {
        let normalized = (lifetimeEarnings - parameters.activationEarnings) / parameters.scalingFactor + 1
        let computed = powDecimal(normalized, parameters.growthExponent) - 1
        return computed
    }

    private func powDecimal(_ value: Decimal, _ exponent: Decimal) -> Decimal {
        let base = NSDecimalNumber(decimal: value).doubleValue
        let exp = NSDecimalNumber(decimal: exponent).doubleValue
        return Decimal(pow(base, exp))
    }

    private func logDecimal(_ value: Decimal) -> Decimal {
        let base = NSDecimalNumber(decimal: value).doubleValue
        return Decimal(log(base))
    }

    private func floorDecimal(_ value: Decimal) -> Decimal {
        var mutable = value
        var rounded = Decimal()
        NSDecimalRound(&rounded, &mutable, 0, .down)
        return rounded
    }
}
