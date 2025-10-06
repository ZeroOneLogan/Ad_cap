import XCTest
@testable import AdCapCore

final class AngelInvestorCalculatorTests: XCTestCase {
    private let calculator = AngelInvestorCalculator()

    func testNoAngelsBelowActivationThreshold() {
        XCTAssertEqual(calculator.angelsEarned(lifetimeEarnings: 50_000), 0)
    }

    func testAngelsIncreaseSmoothly() {
        let first = calculator.angelsEarned(lifetimeEarnings: 250_000)
        let second = calculator.angelsEarned(lifetimeEarnings: 1_250_000)
        let third = calculator.angelsEarned(lifetimeEarnings: 6_000_000)

        XCTAssertLessThan(first, second)
        XCTAssertLessThan(second, third)
        XCTAssertEqual(first, 7)
        XCTAssertEqual(second, 27)
        XCTAssertEqual(third, 79)
    }

    func testResetCalculationNeverNegative() {
        let angels = calculator.angelsAvailableOnReset(lifetimeEarnings: 2_000_000, currentAngels: 5_000)
        XCTAssertEqual(angels, 0)
    }

    func testResetCalculationMatchesDifference() {
        let total = calculator.angelsEarned(lifetimeEarnings: 5_500_000)
        let current: Decimal = 20
        let available = calculator.angelsAvailableOnReset(lifetimeEarnings: 5_500_000, currentAngels: current)
        XCTAssertEqual(available, max(total - current, 0))
    }

    func testProductionMultiplierWithDiminishingReturns() {
        let modest = calculator.productionMultiplier(forAngels: 100)
        let large = calculator.productionMultiplier(forAngels: 2_000)

        XCTAssertGreaterThan(modest, 1)
        XCTAssertGreaterThan(large, modest)

        let incrementalEarly = calculator.productionMultiplier(forAngels: 110) - calculator.productionMultiplier(forAngels: 100)
        let incrementalLate = calculator.productionMultiplier(forAngels: 2_010) - calculator.productionMultiplier(forAngels: 2_000)
        XCTAssertGreaterThan(incrementalEarly, incrementalLate)
    }

    func testEarningsRequiredIsInverseOfAngelsEarned() {
        let targetAngels: Decimal = 120
        let required = calculator.earningsRequired(forTargetAngels: targetAngels)
        let earned = calculator.angelsEarned(lifetimeEarnings: required)
        XCTAssertGreaterThanOrEqual(earned, targetAngels)
    }

    func testProgressTowardsNextAngelMonotonicallyIncreases() {
        XCTAssertEqual(calculator.progressTowardsNextAngel(lifetimeEarnings: 50_000), 0)

        let mid = calculator.progressTowardsNextAngel(lifetimeEarnings: 250_000)
        let higher = calculator.progressTowardsNextAngel(lifetimeEarnings: 260_000)

        XCTAssertGreaterThan(mid, 0)
        XCTAssertLessThan(mid, 1)
        XCTAssertGreaterThan(higher, mid)
    }
}
