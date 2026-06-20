package cfar.service

import cfar.domain.*
import cfar.repo.{ContractRepo, AuditRepo}
import cfar.config.AppConfig
import zio.*
import java.time.Instant
import java.util.UUID

trait RefundService:
  def triggerRefundJob(contractId: UUID): Task[Unit]

object RefundService:
  val layer: ZLayer[ContractRepo & AuditRepo & AppConfig, Nothing, RefundService] =
    ZLayer.fromFunction(RefundServiceLive(_, _, _))

case class RefundServiceLive(
  repo: ContractRepo,
  audit: AuditRepo,
  config: AppConfig
) extends RefundService:

  override def triggerRefundJob(contractId: UUID): Task[Unit] =
    val delaySeconds = config.app.refundSimulationDelayS.seconds
    for {
      // 1. Wait for delay
      _ <- ZIO.sleep(delaySeconds)
      
      // 2. Transition CANCELLED -> REFUND_INITIATED
      contractOpt1 <- repo.getContract(contractId)
      _ <- contractOpt1 match {
        case Some(c) if c.status == ContractStatus.CANCELLED =>
          val now = Instant.now()
          for {
            _ <- repo.updateContractStatus(contractId, ContractStatus.REFUND_INITIATED, now)
            metadata = s"""{"amount": ${c.refundAmount.getOrElse(BigDecimal(0))}}"""
            _ <- audit.addEntry(
              contractId = contractId,
              eventType = "RefundInitiated",
              fromStatus = Some(ContractStatus.CANCELLED),
              toStatus = Some(ContractStatus.REFUND_INITIATED),
              metadataJson = metadata,
              actorId = "system"
            )
            
            // 3. Wait for another delay
            _ <- ZIO.sleep(delaySeconds)
            
            // 4. Transition REFUND_INITIATED -> REFUNDED
            contractOpt2 <- repo.getContract(contractId)
            _ <- contractOpt2 match {
              case Some(c2) if c2.status == ContractStatus.REFUND_INITIATED =>
                val completedNow = Instant.now()
                for {
                  _ <- repo.updateContractStatus(contractId, ContractStatus.REFUNDED, completedNow)
                  _ <- audit.addEntry(
                    contractId = contractId,
                    eventType = "RefundCompleted",
                    fromStatus = Some(ContractStatus.REFUND_INITIATED),
                    toStatus = Some(ContractStatus.REFUNDED),
                    metadataJson = metadata,
                    actorId = "system"
                  )
                } yield ()
              case _ => ZIO.logWarning(s"Contract $contractId status changed, skipping REFUNDED transition")
            }
          } yield ()
        case _ => ZIO.logWarning(s"Contract $contractId status is not CANCELLED, skipping REFUND_INITIATED transition")
      }
    } yield ()
