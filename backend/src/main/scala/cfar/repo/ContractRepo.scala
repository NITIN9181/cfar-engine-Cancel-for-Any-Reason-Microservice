package cfar.repo

import cfar.domain.*
import doobie.*
import doobie.implicits.*
import doobie.postgres.implicits.*
import zio.*
import zio.interop.catz.*
import zio.interop.catz.implicits.*
import java.util.UUID
import java.time.Instant

trait ContractRepo:
  def getContract(id: UUID): Task[Option[CfarContract]]
  def getContractByPnr(pnr: String): Task[Option[CfarContract]]
  def getContractByIdempotencyKey(key: String): Task[Option[CfarContract]]
  def createOrGetContract(contract: CfarContract): Task[CfarContract]
  def updateContractStatus(id: UUID, status: ContractStatus, now: Instant): Task[Unit]
  def cancelContract(
    id: UUID,
    cancelledAt: Instant,
    refundAmount: BigDecimal,
    reason: Option[String],
    nextStatus: ContractStatus
  ): Task[Unit]
  def getPartnerConfig(partnerId: String): Task[Option[PartnerConfig]]
  def updatePartnerConfig(config: PartnerConfig): Task[PartnerConfig]
  def listPartnerConfigs: Task[List[PartnerConfig]]

object ContractRepo:
  val layer: ZLayer[Transactor[Task], Nothing, ContractRepo] =
    ZLayer.fromFunction(ContractRepoLive(_))

case class ContractRepoLive(xa: Transactor[Task]) extends ContractRepo:
  implicit val contractStatusMeta: Meta[ContractStatus] =
    Meta[String].imap(s => ContractStatus.fromString(s).getOrElse(ContractStatus.ACTIVE))(_.name)

  override def getContract(id: UUID): Task[Option[CfarContract]] =
    sql"""
      SELECT id, partner_id, pnr, origin, destination, departure_date, passenger_count,
             fare_amount, fare_currency, coverage_tier, coverage_pct, cfar_fee, cfar_fee_pct,
             status, idempotency_key, risk_score, model_version, traveler_id, created_at,
             updated_at, expires_at, cancelled_at, refund_amount, refund_initiated_at,
             refund_completed_at, cancellation_reason
      FROM contracts WHERE id = $id
    """.query[CfarContract].option.transact(xa)

  override def getContractByPnr(pnr: String): Task[Option[CfarContract]] =
    sql"""
      SELECT id, partner_id, pnr, origin, destination, departure_date, passenger_count,
             fare_amount, fare_currency, coverage_tier, coverage_pct, cfar_fee, cfar_fee_pct,
             status, idempotency_key, risk_score, model_version, traveler_id, created_at,
             updated_at, expires_at, cancelled_at, refund_amount, refund_initiated_at,
             refund_completed_at, cancellation_reason
      FROM contracts WHERE pnr = $pnr
    """.query[CfarContract].option.transact(xa)

  override def getContractByIdempotencyKey(key: String): Task[Option[CfarContract]] =
    sql"""
      SELECT id, partner_id, pnr, origin, destination, departure_date, passenger_count,
             fare_amount, fare_currency, coverage_tier, coverage_pct, cfar_fee, cfar_fee_pct,
             status, idempotency_key, risk_score, model_version, traveler_id, created_at,
             updated_at, expires_at, cancelled_at, refund_amount, refund_initiated_at,
             refund_completed_at, cancellation_reason
      FROM contracts WHERE idempotency_key = $key
    """.query[CfarContract].option.transact(xa)

  override def createOrGetContract(contract: CfarContract): Task[CfarContract] =
    sql"""
      INSERT INTO contracts (
        id, partner_id, pnr, origin, destination, departure_date, passenger_count,
        fare_amount, fare_currency, coverage_tier, coverage_pct, cfar_fee, cfar_fee_pct,
        status, idempotency_key, risk_score, model_version, traveler_id, expires_at
      ) VALUES (
        ${contract.id}, ${contract.partnerId}, ${contract.pnr}, ${contract.origin}, ${contract.destination},
        ${contract.departureDate}, ${contract.passengerCount}, ${contract.fareAmount}, ${contract.fareCurrency},
        ${contract.coverageTier}, ${contract.coveragePct}, ${contract.cfarFee}, ${contract.cfarFeePct},
        ${contract.status}, ${contract.idempotencyKey}, ${contract.riskScore}, ${contract.modelVersion},
        ${contract.travelerId}, ${contract.expiresAt}
      ) ON CONFLICT (idempotency_key) DO UPDATE SET updated_at = now()
      RETURNING id, partner_id, pnr, origin, destination, departure_date, passenger_count,
                fare_amount, fare_currency, coverage_tier, coverage_pct, cfar_fee, cfar_fee_pct,
                status, idempotency_key, risk_score, model_version, traveler_id, created_at,
                updated_at, expires_at, cancelled_at, refund_amount, refund_initiated_at,
                refund_completed_at, cancellation_reason
    """.query[CfarContract].unique.transact(xa)

  override def updateContractStatus(id: UUID, status: ContractStatus, now: Instant): Task[Unit] =
    val query = if (status == ContractStatus.REFUND_INITIATED) {
      sql"UPDATE contracts SET status = $status, refund_initiated_at = $now, updated_at = $now WHERE id = $id"
    } else if (status == ContractStatus.REFUNDED) {
      sql"UPDATE contracts SET status = $status, refund_completed_at = $now, updated_at = $now WHERE id = $id"
    } else {
      sql"UPDATE contracts SET status = $status, updated_at = $now WHERE id = $id"
    }
    query.update.run.transact(xa).unit

  override def cancelContract(
    id: UUID,
    cancelledAt: Instant,
    refundAmount: BigDecimal,
    reason: Option[String],
    nextStatus: ContractStatus
  ): Task[Unit] =
    sql"""
      UPDATE contracts
      SET status = $nextStatus,
          cancelled_at = $cancelledAt,
          refund_amount = $refundAmount,
          cancellation_reason = $reason,
          updated_at = $cancelledAt
      WHERE id = $id
    """.update.run.transact(xa).unit

  override def getPartnerConfig(partnerId: String): Task[Option[PartnerConfig]] =
    sql"""
      SELECT partner_id, partner_name, partial_coverage_pct, full_coverage_pct,
             min_cfar_fee_pct, max_cfar_fee_pct, cancellation_window_h, brand_color,
             brand_logo_url, webhook_url, is_active, supported_currencies
      FROM partner_configs WHERE partner_id = $partnerId
    """.query[PartnerConfig].option.transact(xa)

  override def updatePartnerConfig(config: PartnerConfig): Task[PartnerConfig] =
    sql"""
      INSERT INTO partner_configs (
        partner_id, partner_name, partial_coverage_pct, full_coverage_pct,
        min_cfar_fee_pct, max_cfar_fee_pct, cancellation_window_h, brand_color,
        brand_logo_url, webhook_url, is_active, supported_currencies
      ) VALUES (
        ${config.partnerId}, ${config.partnerName}, ${config.partialCoveragePct}, ${config.fullCoveragePct},
        ${config.minCfarFeePct}, ${config.maxCfarFeePct}, ${config.cancellationWindowH}, ${config.brandColor},
        ${config.brandLogoUrl}, ${config.webhookUrl}, ${config.isActive}, ${config.supportedCurrencies}
      ) ON CONFLICT (partner_id) DO UPDATE SET
        partner_name = EXCLUDED.partner_name,
        partial_coverage_pct = EXCLUDED.partial_coverage_pct,
        full_coverage_pct = EXCLUDED.full_coverage_pct,
        min_cfar_fee_pct = EXCLUDED.min_cfar_fee_pct,
        max_cfar_fee_pct = EXCLUDED.max_cfar_fee_pct,
        cancellation_window_h = EXCLUDED.cancellation_window_h,
        brand_color = EXCLUDED.brand_color,
        brand_logo_url = EXCLUDED.brand_logo_url,
        webhook_url = EXCLUDED.webhook_url,
        is_active = EXCLUDED.is_active,
        supported_currencies = EXCLUDED.supported_currencies,
        updated_at = now()
      RETURNING partner_id, partner_name, partial_coverage_pct, full_coverage_pct,
                min_cfar_fee_pct, max_cfar_fee_pct, cancellation_window_h, brand_color,
                brand_logo_url, webhook_url, is_active, supported_currencies
    """.query[PartnerConfig].unique.transact(xa)

  override def listPartnerConfigs: Task[List[PartnerConfig]] =
    sql"""
      SELECT partner_id, partner_name, partial_coverage_pct, full_coverage_pct,
             min_cfar_fee_pct, max_cfar_fee_pct, cancellation_window_h, brand_color,
             brand_logo_url, webhook_url, is_active, supported_currencies
      FROM partner_configs
    """.query[PartnerConfig].to[List].transact(xa)
