package cfar.domain

import java.time.{Instant, LocalDate}
import java.util.UUID
import io.circe.*
import io.circe.derivation.*

implicit val circeConfiguration: Configuration = Configuration.default.withSnakeCaseMemberNames

implicit val contractStatusEncoder: Encoder[ContractStatus] = Encoder.encodeString.contramap(_.name)
implicit val contractStatusDecoder: Decoder[ContractStatus] = Decoder.decodeString.emap { s =>
  ContractStatus.fromString(s).toRight(s"Invalid contract status: $s")
}

case class PartnerConfig(
  partnerId: String,
  partnerName: String,
  partialCoveragePct: BigDecimal,
  fullCoveragePct: BigDecimal,
  minCfarFeePct: BigDecimal,
  maxCfarFeePct: BigDecimal,
  cancellationWindowH: Int,
  brandColor: String,
  brandLogoUrl: Option[String],
  webhookUrl: Option[String],
  isActive: Boolean,
  supportedCurrencies: List[String]
) derives ConfiguredCodec

case class CfarContract(
  id: UUID,
  partnerId: String,
  pnr: String,
  origin: String,
  destination: String,
  departureDate: LocalDate,
  passengerCount: Int,
  fareAmount: BigDecimal,
  fareCurrency: String,
  coverageTier: String,
  coveragePct: BigDecimal,
  cfarFee: BigDecimal,
  cfarFeePct: BigDecimal,
  status: ContractStatus,
  idempotencyKey: String,
  riskScore: Option[BigDecimal],
  modelVersion: Option[String],
  travelerId: Option[String],
  createdAt: Instant,
  updatedAt: Instant,
  expiresAt: Instant,
  cancelledAt: Option[Instant],
  refundAmount: Option[BigDecimal],
  refundInitiatedAt: Option[Instant],
  refundCompletedAt: Option[Instant],
  cancellationReason: Option[String]
) derives ConfiguredCodec

case class PricingRequest(
  partnerId: String,
  origin: String,
  destination: String,
  departureDate: String,
  fareAmount: BigDecimal,
  fareCurrency: String,
  passengerCount: Int
) derives ConfiguredCodec

case class CoveragePricing(
  tier: String,
  coveragePct: BigDecimal,
  cfarFee: BigDecimal,
  cfarFeePct: BigDecimal,
  refundIfUsed: BigDecimal
) derives ConfiguredCodec

case class PricingResult(
  partialCoverage: CoveragePricing,
  fullCoverage: CoveragePricing,
  riskScore: BigDecimal,
  modelVersion: String,
  expiresInSeconds: Int = 300
) derives ConfiguredCodec

case class CreateContractBody(
  pnr: String,
  origin: String,
  destination: String,
  departureDate: String,
  fareAmount: BigDecimal,
  fareCurrency: String,
  passengerCount: Int,
  coverageTier: String,
  travelerId: Option[String] = None
) derives ConfiguredCodec

case class CancellationResult(
  contractId: UUID,
  status: ContractStatus,
  refundAmount: BigDecimal,
  refundCurrency: String,
  refundTimeline: String,
  cancelledAt: Instant,
  message: String
) derives ConfiguredCodec

case class AuditEntry(
  id: UUID,
  contractId: UUID,
  eventType: String,
  fromStatus: Option[ContractStatus],
  toStatus: Option[ContractStatus],
  metadata: Map[String, String],
  actorId: String,
  createdAt: Instant
) derives ConfiguredCodec

sealed trait AppError extends Throwable:
  def message: String
  def code: String

case class ContractNotFound(contractId: UUID) extends AppError:
  override def message: String = s"Contract with ID $contractId not found"
  override def code: String = "CONTRACT_NOT_FOUND"

case class PartnerNotFound(partnerId: String) extends AppError:
  override def message: String = s"Partner config for ID $partnerId not found"
  override def code: String = "PARTNER_NOT_FOUND"

case class WindowClosed(departureDate: LocalDate, windowHours: Int) extends AppError:
  override def message: String = s"Cancellation window closed ($windowHours hours before departure)"
  override def code: String = "WINDOW_CLOSED"

case class ContractNotActive(status: ContractStatus) extends AppError:
  override def message: String = s"Contract must be ACTIVE to be cancelled, current status: $status"
  override def code: String = "CONTRACT_NOT_ACTIVE"

case class InvalidInput(field: String, errMsg: String) extends AppError:
  override def message: String = s"Invalid input for field $field: $errMsg"
  override def code: String = "INVALID_INPUT"

case class DuplicateContract(idempotencyKey: String) extends AppError:
  override def message: String = s"Duplicate submission for key $idempotencyKey"
  override def code: String = "DUPLICATE_CONTRACT"

case class InternalServerError(errMsg: String) extends AppError:
  override def message: String = errMsg
  override def code: String = "INTERNAL_SERVER_ERROR"

case class ErrorResponse(
  code: String,
  message: String,
  details: Option[Map[String, String]] = None
) derives ConfiguredCodec
