package cfar.config

import com.typesafe.config.ConfigFactory
import zio.*

case class DbConfig(
  host: String,
  port: Int,
  name: String,
  user: String,
  password: String,
  poolSize: Int
)

case class AppSettings(
  port: Int,
  env: String,
  defaultCancellationWindowH: Int,
  defaultCancellationRate: Double,
  refundSimulationDelayS: Int
)

case class AppConfig(
  db: DbConfig,
  app: AppSettings
)

object AppConfig:
  val layer: ZLayer[Any, Throwable, AppConfig] = ZLayer.fromZIO(ZIO.attempt {
    val config = ConfigFactory.load()
    val db = DbConfig(
      host = config.getString("db.host"),
      port = config.getInt("db.port"),
      name = config.getString("db.name"),
      user = config.getString("db.user"),
      password = config.getString("db.password"),
      poolSize = config.getInt("db.poolSize")
    )
    val app = AppSettings(
      port = config.getInt("app.port"),
      env = config.getString("app.env"),
      defaultCancellationWindowH = config.getInt("app.defaultCancellationWindowH"),
      defaultCancellationRate = config.getDouble("app.defaultCancellationRate"),
      refundSimulationDelayS = config.getInt("app.refundSimulationDelayS")
    )
    AppConfig(db, app)
  })
