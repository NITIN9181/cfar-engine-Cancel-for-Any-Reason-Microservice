package cfar.domain

import java.time.LocalDate
import java.time.temporal.ChronoUnit
import scala.math.BigDecimal.RoundingMode

object PricingEngine:
  def calculate(
    request: PricingRequest,
    config: PartnerConfig,
    seedRates: Map[(String, String), BigDecimal],
    today: LocalDate = LocalDate.now()
  ): PricingResult =
    val departureDate = LocalDate.parse(request.departureDate)
    val daysToDeparture = ChronoUnit.DAYS.between(today, departureDate).max(0)

    val dtdMultiplier =
      if (daysToDeparture <= 7) BigDecimal("2.20")
      else if (daysToDeparture <= 14) BigDecimal("1.80")
      else if (daysToDeparture <= 30) BigDecimal("1.40")
      else if (daysToDeparture <= 60) BigDecimal("1.10")
      else BigDecimal("0.90")

    val paxMultiplier =
      if (request.passengerCount == 1) BigDecimal("1.00")
      else if (request.passengerCount == 2) BigDecimal("1.08")
      else BigDecimal("1.15")

    val baseRate = seedRates.getOrElse(
      (request.origin.toUpperCase, request.destination.toUpperCase),
      BigDecimal("0.095")
    )

    val rawRisk = baseRate * dtdMultiplier * paxMultiplier
    val riskScore = rawRisk.max(BigDecimal("0.05")).min(BigDecimal("0.95"))

    // Ensure we handle config coverage percentage whether stored as fraction or percentage
    val partialCoverageFraction =
      if (config.partialCoveragePct > BigDecimal("1.0")) config.partialCoveragePct / BigDecimal("100.0")
      else config.partialCoveragePct

    val fullCoverageFraction =
      if (config.fullCoveragePct > BigDecimal("1.0")) config.fullCoveragePct / BigDecimal("100.0")
      else config.fullCoveragePct

    val partialFeePct = (riskScore * BigDecimal("0.85"))
      .max(config.minCfarFeePct)
      .min(config.maxCfarFeePct)

    val fullFeePct = (riskScore * BigDecimal("1.00"))
      .max(config.minCfarFeePct)
      .min(config.maxCfarFeePct)

    val partialFee = (request.fareAmount * partialFeePct)
      .setScale(2, RoundingMode.HALF_UP)

    val fullFee = (request.fareAmount * fullFeePct)
      .setScale(2, RoundingMode.HALF_UP)

    val partialRefund = (request.fareAmount * partialCoverageFraction)
      .setScale(2, RoundingMode.HALF_UP)

    val fullRefund = (request.fareAmount * fullCoverageFraction)
      .setScale(2, RoundingMode.HALF_UP)

    PricingResult(
      partialCoverage = CoveragePricing(
        tier = "partial",
        coveragePct = partialCoverageFraction * BigDecimal("100.0"),
        cfarFee = partialFee,
        cfarFeePct = partialFeePct,
        refundIfUsed = partialRefund
      ),
      fullCoverage = CoveragePricing(
        tier = "full",
        coveragePct = fullCoverageFraction * BigDecimal("100.0"),
        cfarFee = fullFee,
        cfarFeePct = fullFeePct,
        refundIfUsed = fullRefund
      ),
      riskScore = riskScore.setScale(4, RoundingMode.HALF_UP),
      modelVersion = "v1.2-csv-seed"
    )
