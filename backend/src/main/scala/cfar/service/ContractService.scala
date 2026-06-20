package cfar.service

import cfar.domain.*
import cfar.repo.{ContractRepo, AuditRepo}
import zio.*
import java.time.{Instant, LocalDate, ZoneOffset}
import java.time.temporal.ChronoUnit
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

  override def createContract(body: CreateContractBody, partnerId: String, idempotencyKey: String): Task[CfarContract] =
    for {
      existing <- repo.getContractByIdempotencyKey(idempotencyKey)
      contract <- existing match {
        case Some(c) => ZIO.succeed(c)
        case None =>
          for {
            config <- repo.getPartnerConfig(partnerId).flatMap {
              case Some(c) => ZIO.succeed(c)
              case None => ZIO.fail(PartnerNotFound(partnerId))
            }
            pricingRequest = PricingRequest(
              partnerId = partnerId,
              origin = body.origin,
              destination = body.destination,
              departureDate = body.departureDate,
              fareAmount = body.fareAmount,
              fareCurrency = body.fareCurrency,
              passengerCount = body.passengerCount
            )
            pricing = PricingEngine.calculate(pricingRequest, config, seedRates)
            tierInfo = if (body.coverageTier.equalsIgnoreCase("full")) pricing.fullCoverage else pricing.partialCoverage

            departureDate = LocalDate.parse(body.departureDate)
            departureInstant = departureDate.atStartOfDay(ZoneOffset.UTC).toInstant
            expiresInstant = departureInstant.minus(config.cancellationWindowH, ChronoUnit.HOURS)

            id = UUID.randomUUID()
            newContract = CfarContract(
              id = id,
              partnerId = partnerId,
              pnr = body.pnr,
              origin = body.origin.toUpperCase,
              destination = body.destination.toUpperCase,
              departureDate = departureDate,
              passengerCount = body.passengerCount,
              fareAmount = body.fareAmount,
              fareCurrency = body.fareCurrency,
              coverageTier = body.coverageTier.toLowerCase,
              coveragePct = if (tierInfo.coveragePct > BigDecimal("1.0")) tierInfo.coveragePct / BigDecimal("100.0") else tierInfo.coveragePct,
              cfarFee = tierInfo.cfarFee,
              cfarFeePct = tierInfo.cfarFeePct,
              status = ContractStatus.ACTIVE,
              idempotencyKey = idempotencyKey,
              riskScore = Some(pricing.riskScore),
              modelVersion = Some(pricing.modelVersion),
              travelerId = body.travelerId,
              createdAt = Instant.now(),
              updatedAt = Instant.now(),
              expiresAt = expiresInstant,
              cancelledAt = None,
              refundAmount = None,
              refundInitiatedAt = None,
              refundCompletedAt = None,
              cancellationReason = None
            )
            saved <- repo.createOrGetContract(newContract)
            metadata = s"""{"risk_score": ${pricing.riskScore}, "model_version": "${pricing.modelVersion}", "cfar_fee": ${tierInfo.cfarFee}}"""
            _ <- audit.addEntry(
              contractId = saved.id,
              eventType = "ContractCreated",
              fromStatus = None,
              toStatus = Some(ContractStatus.ACTIVE),
              metadataJson = metadata,
              actorId = "partner_api"
            )
          } yield saved
      }
    } yield contract

  override def getContract(id: UUID): Task[CfarContract] =
    repo.getContract(id).flatMap {
      case Some(c) => ZIO.succeed(c)
      case None => ZIO.fail(ContractNotFound(id))
    }

  override def getContractByPnr(pnr: String): Task[CfarContract] =
    repo.getContractByPnr(pnr).flatMap {
      case Some(c) => ZIO.succeed(c)
      case None => ZIO.fail(ContractNotFound(UUID.randomUUID()))
    }
