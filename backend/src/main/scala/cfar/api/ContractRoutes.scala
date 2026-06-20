package cfar.api

import sttp.tapir.ztapir.*
import sttp.tapir.json.circe.*
import sttp.tapir.generic.auto.*
import sttp.model.StatusCode
import io.circe.generic.auto.*
import cfar.domain.*
import cfar.service.ContractService
import zio.*

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

  def toErrorResponse(e: Throwable): ErrorResponse = e match {
    case err: AppError => ErrorResponse(err.code, err.message)
    case _             => ErrorResponse("INTERNAL_SERVER_ERROR", e.getMessage)
  }

  def routes(service: ContractService): List[ZServerEndpoint[Any, Any]] = List(
    pricingEndpoint.zServerLogic { case (partnerId, origin, dest, depDate, fare, currency, pax) =>
      val req = PricingRequest(partnerId, origin, dest, depDate, fare, currency, pax)
      service.calculatePricing(req).mapError(toErrorResponse)
    }
  )
