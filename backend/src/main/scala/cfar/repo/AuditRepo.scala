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

trait AuditRepo:
  def addEntry(
    contractId: UUID,
    eventType: String,
    fromStatus: Option[ContractStatus],
    toStatus: Option[ContractStatus],
    metadataJson: String,
    actorId: String
  ): Task[Unit]

  def listEntries(contractId: UUID): Task[List[AuditEntry]]

object AuditRepo:
  val layer: ZLayer[Transactor[Task], Nothing, AuditRepo] =
    ZLayer.fromFunction(AuditRepoLive(_))

case class AuditEntryDb(
  id: UUID,
  contractId: UUID,
  eventType: String,
  fromStatus: Option[ContractStatus],
  toStatus: Option[ContractStatus],
  metadata: String,
  actorId: String,
  createdAt: Instant
)

case class AuditRepoLive(xa: Transactor[Task]) extends AuditRepo:
  implicit val contractStatusMeta: Meta[ContractStatus] =
    Meta[String].imap(s => ContractStatus.fromString(s).getOrElse(ContractStatus.ACTIVE))(_.name)

  override def addEntry(
    contractId: UUID,
    eventType: String,
    fromStatus: Option[ContractStatus],
    toStatus: Option[ContractStatus],
    metadataJson: String,
    actorId: String
  ): Task[Unit] =
    sql"""
      INSERT INTO audit_log (contract_id, event_type, from_status, to_status, metadata, actor_id)
      VALUES ($contractId, $eventType, $fromStatus, $toStatus, $metadataJson::jsonb, $actorId)
    """.update.run.transact(xa).unit

  override def listEntries(contractId: UUID): Task[List[AuditEntry]] =
    sql"""
      SELECT id, contract_id, event_type, from_status, to_status, metadata::text, actor_id, created_at
      FROM audit_log
      WHERE contract_id = $contractId
      ORDER BY created_at ASC
    """.query[AuditEntryDb].to[List].transact(xa).map { dbEntries =>
      dbEntries.map { d =>
        val parsedMeta = io.circe.parser.decode[Map[String, String]](d.metadata).getOrElse(Map.empty)
        AuditEntry(
          id = d.id,
          contractId = d.contractId,
          eventType = d.eventType,
          fromStatus = d.fromStatus,
          toStatus = d.toStatus,
          metadata = parsedMeta,
          actorId = d.actorId,
          createdAt = d.createdAt
        )
      }
    }
