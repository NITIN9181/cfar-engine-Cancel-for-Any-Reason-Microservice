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
