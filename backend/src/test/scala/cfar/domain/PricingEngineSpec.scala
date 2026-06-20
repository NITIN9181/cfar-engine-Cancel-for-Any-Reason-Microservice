package cfar.domain

import zio.*
import zio.test.*
import zio.test.Assertion.*
import java.time.LocalDate

object PricingEngineSpec extends ZIOSpecDefault:

  private val mockPartnerConfig = PartnerConfig(
    partnerId = "aerodemo_airlines",
    partnerName = "AeroDemo Airlines",
    partialCoveragePct = BigDecimal("0.80"),
    fullCoveragePct = BigDecimal("1.00"),
    minCfarFeePct = BigDecimal("0.06"),
    maxCfarFeePct = BigDecimal("0.30"),
    cancellationWindowH = 24,
    supportedCurrencies = List("INR", "SGD"),
    brandColor = "#1A56DB",
    brandLogoUrl = None,
    webhookUrl = None,
    isActive = true
  )

  private val mockSeedRates = Map(
    ("DEL", "SIN") -> BigDecimal("0.094"),
    ("SIN", "SYD") -> BigDecimal("0.082")
  )

  override def spec = suite("PricingEngineSpec")(
    test("calculates pricing correctly for standard route (DEL -> SIN)") {
      val req = PricingRequest(
        partnerId = "aerodemo_airlines",
        origin = "DEL",
        destination = "SIN",
        departureDate = "2026-08-15", // 10 days from today (2026-08-05)
        fareAmount = BigDecimal("14500.00"),
        fareCurrency = "INR",
        passengerCount = 2
      )

      val result = PricingEngine.calculate(
        request = req,
        config = mockPartnerConfig,
        seedRates = mockSeedRates,
        today = LocalDate.parse("2026-08-05")
      )

      // base_rate = 0.094
      // dtd_mult = 1.80 (10 days is <= 14 days)
      // pax_mult = 1.08 (2 passengers)
      // raw_risk = 0.094 * 1.80 * 1.08 = 0.182736
      // risk_score = 0.1827 (rounded to 4 decimal places for result output, but unrounded in fee calculations)
      // partialFee% = 0.182736 * 0.85 = 0.1553256
      // fullFee% = 0.182736
      // partialFee = 14500 * 0.1553256 = 2252.22
      // fullFee = 14500 * 0.182736 = 2649.67

      assertTrue(
        result.riskScore == BigDecimal("0.1827"),
        result.partialCoverage.coveragePct == BigDecimal("80.0"),
        result.fullCoverage.coveragePct == BigDecimal("100.0"),
        result.partialCoverage.cfarFee == BigDecimal("2252.22"),
        result.fullCoverage.cfarFee == BigDecimal("2649.67")
      )
    },

    test("clamps risk score between 0.05 and 0.95") {
      val reqHighRisk = PricingRequest(
        partnerId = "aerodemo_airlines",
        origin = "DEL",
        destination = "SIN",
        departureDate = "2026-08-06", // 1 day to departure (<=7 days => 2.2x mult)
        fareAmount = BigDecimal("1000.00"),
        fareCurrency = "INR",
        passengerCount = 10 // high pax count
      )

      val highRates = Map(("DEL", "SIN") -> BigDecimal("0.85")) // very high base rate
      val result = PricingEngine.calculate(reqHighRisk, mockPartnerConfig, highRates, LocalDate.parse("2026-08-05"))

      // raw risk: 0.85 * 2.2 * 1.15 = 2.15 (clamped to 0.95)
      assertTrue(result.riskScore == BigDecimal("0.9500"))
    },

    test("applies min and max fee percentage constraints from partner config") {
      val reqLow = PricingRequest(
        partnerId = "aerodemo_airlines",
        origin = "DEL",
        destination = "SIN",
        departureDate = "2026-09-01", // > 60 days => 0.9x mult
        fareAmount = BigDecimal("1000.00"),
        fareCurrency = "INR",
        passengerCount = 1
      )

      val lowRates = Map(("DEL", "SIN") -> BigDecimal("0.02")) // low cancellation rate
      val result = PricingEngine.calculate(reqLow, mockPartnerConfig, lowRates, LocalDate.parse("2026-06-01"))

      // raw risk: 0.02 * 0.9 * 1.0 = 0.018 (clamped to 0.05 min risk)
      // full fee pct: 0.05 -> clamped to minCfarFeePct 0.06
      assertTrue(
        result.riskScore == BigDecimal("0.0500"),
        result.fullCoverage.cfarFeePct == BigDecimal("0.06")
      )
    }
  )
