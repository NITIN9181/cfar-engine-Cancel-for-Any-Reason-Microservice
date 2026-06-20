package cfar.service

import cfar.domain.*
import cfar.repo.{ContractRepo, AuditRepo}
import zio.*
import java.util.UUID
import scala.io.Source

trait ContractService:
  def calculatePricing(request: PricingRequest): Task[PricingResult]
  def createContract(body: CreateContractBody, partnerId: String, idempotencyKey: String): Task[CfarContract]
  def getContract(id: UUID): Task[CfarContract]
  def getContractByPnr(pnr: String): Task[CfarContract]
  def cancelContract(id: UUID, reason: Option[String], actorId: String = "traveler"): Task[CancellationResult]

object ContractService:
  val layer: ZLayer[ContractRepo & AuditRepo & RefundService, Throwable, ContractService] =
    ZLayer.fromZIO {
      for {
        repo <- ZIO.service[ContractRepo]
        audit <- ZIO.service[AuditRepo]
        refund <- ZIO.service[RefundService]
        rates <- loadRatesFromCsv.orElse(ZIO.succeed(Map.empty))
      } yield ContractServiceLive(repo, audit, refund, rates)
    }

  private def loadRatesFromCsv: Task[Map[(String, String), BigDecimal]] = ZIO.attempt {
    val stream = getClass.getResourceAsStream("/seed/cancellation_rates.csv")
    if (stream == null) {
      Map.empty[(String, String), BigDecimal]
    } else {
      val source = Source.fromInputStream(stream)
      try {
        source.getLines().drop(1).flatMap { line =>
          val parts = line.split(",")
          if (parts.length >= 3) {
            val origin = parts(0).trim.toUpperCase
            val dest = parts(1).trim.toUpperCase
            val rate = BigDecimal(parts(2).trim)
            Some((origin, dest) -> rate)
          } else {
            None
          }
        }.toMap
      } finally {
        source.close()
      }
    }
  }

case class ContractServiceLive(
  repo: ContractRepo,
  audit: AuditRepo,
  refundService: RefundService,
  seedRates: Map[(String, String), BigDecimal]
) extends ContractService:

  override def calculatePricing(request: PricingRequest): Task[PricingResult] =
    for {
      config <- repo.getPartnerConfig(request.partnerId).flatMap {
        case Some(c) => ZIO.succeed(c)
        case None => ZIO.fail(PartnerNotFound(request.partnerId))
      }
      result = PricingEngine.calculate(request, config, seedRates)
    } yield result
