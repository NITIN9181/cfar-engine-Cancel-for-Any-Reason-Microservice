package cfar.api

import sttp.tapir.ztapir.ZServerEndpoint
import sttp.tapir.swagger.bundle.SwaggerInterpreter
import zio.*

object SwaggerRoutes:
  val endpoints: List[ZServerEndpoint[Any, Any]] =
    SwaggerInterpreter().fromEndpoints[Task](
      List(
        ContractRoutes.pricingEndpoint,
        ContractRoutes.createContractEndpoint,
        ContractRoutes.getContractEndpoint,
        ContractRoutes.cancelContractEndpoint,
        ContractRoutes.getAuditLogEndpoint,
        AdminRoutes.getPartnerConfigEndpoint,
        AdminRoutes.updatePartnerConfigEndpoint
      ),
      "CFAR Engine API",
      "1.0.0"
    ).map(_.asInstanceOf[ZServerEndpoint[Any, Any]])
