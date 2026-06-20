package cfar.api

import sttp.tapir.ztapir.*
import sttp.tapir.json.circe.*
import sttp.tapir.generic.auto.*
import sttp.model.StatusCode
import io.circe.generic.auto.*
import cfar.domain.*
import cfar.repo.ContractRepo
import zio.*

object AdminRoutes:

  private val baseEndpoint = endpoint
    .errorOut(
      oneOf[ErrorResponse](
        oneOfVariant(StatusCode.NotFound, jsonBody[ErrorResponse]),
        oneOfVariant(StatusCode.InternalServerError, jsonBody[ErrorResponse])
      )
    )

  val getPartnerConfigEndpoint = baseEndpoint.get
    .in("api" / "v1" / "admin" / "partner-config")
    .in(query[String]("partnerId"))
    .out(jsonBody[PartnerConfig])

  val updatePartnerConfigEndpoint = baseEndpoint.put
    .in("api" / "v1" / "admin" / "partner-config")
    .in(jsonBody[PartnerConfig])
    .out(jsonBody[PartnerConfig])

  def toErrorResponse(e: Throwable): ErrorResponse = e match {
    case err: AppError => ErrorResponse(err.code, err.message)
    case _             => ErrorResponse("INTERNAL_SERVER_ERROR", e.getMessage)
  }

  def routes(repo: ContractRepo): List[ZServerEndpoint[Any, Any]] = List(
    getPartnerConfigEndpoint.zServerLogic { partnerId =>
      repo.getPartnerConfig(partnerId).flatMap {
        case Some(c) => ZIO.succeed(c)
        case None    => ZIO.fail(PartnerNotFound(partnerId))
      }.mapError(toErrorResponse)
    },
    updatePartnerConfigEndpoint.zServerLogic { config =>
      repo.updatePartnerConfig(config).mapError(toErrorResponse)
    }
  )
