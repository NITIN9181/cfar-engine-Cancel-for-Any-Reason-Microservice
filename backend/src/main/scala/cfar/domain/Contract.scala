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
