package cfar.api

import sttp.tapir.ztapir.*
import sttp.tapir.json.circe.*
import sttp.tapir.generic.auto.*
import sttp.model.StatusCode
import io.circe.generic.auto.*
import cfar.domain.*
import cfar.repo.AuditRepo
import cfar.service.ContractService
import zio.*
import java.util.UUID

object ContractRoutes:

  private val baseEndpoint = endpoint
    .errorOut(
      oneOf[ErrorResponse](
        oneOfVariant(StatusCode.NotFound, jsonBody[ErrorResponse]),
        oneOfVariant(StatusCode.BadRequest, jsonBody[ErrorResponse]),
        oneOfVariant(StatusCode.Conflict, jsonBody[ErrorResponse]),
        oneOfVariant(StatusCode.UnprocessableEntity, jsonBody[ErrorResponse]),
        oneOfVariant(StatusCode.InternalServerError, jsonBody[ErrorResponse])
      )
    )

  val pricingEndpoint = baseEndpoint.get
    .in("api" / "v1" / "pricing")
    .in(query[String]("partner_id"))
    .in(query[String]("origin"))
    .in(query[String]("destination"))
    .in(query[String]("departure_date"))
    .in(query[BigDecimal]("fare_amount"))
    .in(query[String]("fare_currency"))
    .in(query[Int]("passenger_count"))
    .out(jsonBody[PricingResult])

  val createContractEndpoint = baseEndpoint.post
    .in("api" / "v1" / "contracts")
    .in(header[String]("X-Idempotency-Key"))
    .in(header[String]("X-Partner-Id"))
    .in(jsonBody[CreateContractBody])
    .out(jsonBody[CfarContract])

  val getContractEndpoint = baseEndpoint.get
    .in("api" / "v1" / "contracts" / path[UUID]("id"))
    .out(jsonBody[CfarContract])

  case class CancelBody(reason: Option[String])
  import io.circe.derivation.*
  implicit val cancelBodyCodec: io.circe.Codec[CancelBody] = ConfiguredCodec.derived

  val cancelContractEndpoint = baseEndpoint.post
    .in("api" / "v1" / "contracts" / path[UUID]("id") / "cancel")
    .in(jsonBody[CancelBody])
    .out(jsonBody[CancellationResult])

  case class AuditLogResponse(contractId: UUID, entries: List[AuditEntry])
  implicit val auditLogResponseCodec: io.circe.Codec[AuditLogResponse] = ConfiguredCodec.derived

  val getAuditLogEndpoint = baseEndpoint.get
    .in("api" / "v1" / "contracts" / path[UUID]("id") / "audit")
    .out(jsonBody[AuditLogResponse])

  def toErrorResponse(e: Throwable): ErrorResponse = e match {
    case err: AppError => ErrorResponse(err.code, err.message)
    case _             => ErrorResponse("INTERNAL_SERVER_ERROR", e.getMessage)
  }

  def routes(service: ContractService, auditRepo: AuditRepo): List[ZServerEndpoint[Any, Any]] = List(
    pricingEndpoint.zServerLogic { case (partnerId, origin, dest, depDate, fare, currency, pax) =>
      val req = PricingRequest(partnerId, origin, dest, depDate, fare, currency, pax)
      service.calculatePricing(req).mapError(toErrorResponse)
    },
    createContractEndpoint.zServerLogic { case (idempotencyKey, partnerId, body) =>
      service.createContract(body, partnerId, idempotencyKey).mapError(toErrorResponse)
    },
    getContractEndpoint.zServerLogic { id =>
      service.getContract(id).mapError(toErrorResponse)
    },
    cancelContractEndpoint.zServerLogic { case (id, body) =>
      service.cancelContract(id, body.reason).mapError(toErrorResponse)
    },
    getAuditLogEndpoint.zServerLogic { id =>
      auditRepo.listEntries(id)
        .map(entries => AuditLogResponse(id, entries))
        .mapError(toErrorResponse)
    }
  )
