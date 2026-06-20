package cfar.domain

import zio.*
import zio.test.*
import zio.test.Assertion.*
import java.time.{Instant, LocalDate}
import java.util.UUID

object EligibilityValidatorSpec extends ZIOSpecDefault:

  private val baseContract = CfarContract(
    id = UUID.randomUUID(),
    partnerId = "aerodemo_airlines",
    pnr = "ABC123",
    origin = "DEL",
    destination = "SIN",
    departureDate = LocalDate.parse("2026-08-15"),
    passengerCount = 2,
    fareAmount = BigDecimal("14500.00"),
    fareCurrency = "INR",
    coverageTier = "full",
    coveragePct = BigDecimal("100.00"),
    cfarFee = BigDecimal("2647.70"),
    cfarFeePct = BigDecimal("0.18"),
    status = ContractStatus.ACTIVE,
    idempotencyKey = "key-123",
    riskScore = None,
    modelVersion = None,
    travelerId = None,
    createdAt = Instant.parse("2026-06-20T10:00:00Z"),
    updatedAt = Instant.parse("2026-06-20T10:00:00Z"),
    expiresAt = Instant.parse("2026-08-14T00:00:00Z"), // 24 hours before departure
    cancelledAt = None,
    refundAmount = None,
    refundInitiatedAt = None,
    refundCompletedAt = None,
    cancellationReason = None
  )

  override def spec = suite("EligibilityValidatorSpec")(
    test("allows cancellation when contract is active and before deadline") {
      val now = Instant.parse("2026-08-10T12:00:00Z")
      val result = EligibilityValidator.validateCancellation(baseContract, now, 24)
      assertTrue(result.isRight)
    },

    test("fails cancellation when contract is not ACTIVE") {
      val inactiveContract = baseContract.copy(status = ContractStatus.CANCELLED)
      val now = Instant.parse("2026-08-10T12:00:00Z")
      val result = EligibilityValidator.validateCancellation(inactiveContract, now, 24)
      
      result match {
        case Left(ContractNotActive(status)) => assertTrue(status == ContractStatus.CANCELLED)
        case _ => assert(result)(isLeft)
      }
    },

    test("fails cancellation when now is past the cancellation window deadline") {
      val now = Instant.parse("2026-08-14T01:00:00Z") // 1 hour past deadline
      val result = EligibilityValidator.validateCancellation(baseContract, now, 24)
      
      result match {
        case Left(WindowClosed(depDate, windowHours)) => 
          assertTrue(depDate == LocalDate.parse("2026-08-15") && windowHours == 24)
        case _ => assert(result)(isLeft)
      }
    }
  )
