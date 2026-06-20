package cfar

import cfar.config.AppConfig
import cfar.api.*
import cfar.repo.*
import cfar.service.*
import doobie.hikari.HikariTransactor
import doobie.util.transactor.Transactor
import org.flywaydb.core.Flyway
import sttp.tapir.server.interceptor.cors.CORSInterceptor
import sttp.tapir.server.ziohttp.ZioHttpServerOptions
import sttp.tapir.server.ziohttp.ZioHttpInterpreter
import zio.*
import zio.http.Server
import zio.interop.catz.*
import zio.interop.catz.implicits.*

object Main extends ZIOAppDefault:

  private def runFlyway(config: cfar.config.DbConfig): Task[Unit] = ZIO.attempt {
    val url = s"jdbc:postgresql://${config.host}:${config.port}/${config.name}"
    val flyway = Flyway.configure()
      .dataSource(url, config.user, config.password)
      .cleanDisabled(false)
      .load()
    flyway.migrate()
  }.unit

  private def makeTransactor(config: cfar.config.DbConfig): ZIO[Scope, Throwable, Transactor[Task]] = {
    val url = s"jdbc:postgresql://${config.host}:${config.port}/${config.name}"
    for {
      connectEC <- ZIO.executor.map(_.asExecutionContext)
      xa <- HikariTransactor.newHikariTransactor[Task](
        driverClassName = "org.postgresql.Driver",
        url = url,
        user = config.user,
        pass = config.password,
        connectEC = connectEC
      ).toScopedZIO
    } yield xa
  }

  override def run: ZIO[Any, Any, Any] =
    val program: ZIO[AppConfig & ContractRepo & AuditRepo & ContractService & Server, Throwable, Unit] = for {
      appConfig <- ZIO.service[AppConfig]
      _ <- runFlyway(appConfig.db)
      _ <- ZIO.logInfo(s"Database migrated successfully via Flyway.")
      
      contractRepo <- ZIO.service[ContractRepo]
      auditRepo <- ZIO.service[AuditRepo]
      contractService <- ZIO.service[ContractService]
      
      options: ZioHttpServerOptions[Any] = ZioHttpServerOptions.customiseInterceptors
        .corsInterceptor(CORSInterceptor.default)
        .options
        
      allEndpoints: List[sttp.tapir.ztapir.ZServerEndpoint[Any, Any]] =
                     ContractRoutes.routes(contractService, auditRepo) ++
                     AdminRoutes.routes(contractRepo) ++
                     SwaggerRoutes.endpoints
                     
      httpApp = ZioHttpInterpreter[Any](options).toHttp(allEndpoints)
      
      _ <- ZIO.logInfo(s"Starting HTTP Server on port ${appConfig.app.port}...")
      _ <- Server.serve(httpApp)
    } yield ()

    program.provide(
      AppConfig.layer,
      ZLayer.scoped {
        for {
          config <- ZIO.service[AppConfig]
          xa <- makeTransactor(config.db)
        } yield xa
      },
      ContractRepo.layer,
      AuditRepo.layer,
      RefundService.layer,
      ContractService.layer,
      ZLayer.fromZIO(ZIO.service[AppConfig].map(c => Server.Config.default.port(c.app.port))),
      Server.live
    )
