ThisBuild / scalaVersion := "3.4.2"
ThisBuild / version      := "1.0.0"
ThisBuild / name         := "cfar-engine"

lazy val root = (project in file("."))
  .settings(
    name := "cfar-engine",
    libraryDependencies ++= Seq(
      "com.softwaremill.sttp.tapir" %% "tapir-zio-http-server"     % "1.10.8",
      "com.softwaremill.sttp.tapir" %% "tapir-json-circe"          % "1.10.8",
      "com.softwaremill.sttp.tapir" %% "tapir-swagger-ui-bundle"   % "1.10.8",
      "dev.zio"                     %% "zio"                       % "2.1.6",
      "com.typesafe"                 % "config"                    % "1.4.3",
      "dev.zio"                     %% "zio-interop-cats"          % "23.1.0.2",
      "org.tpolecat"                %% "doobie-core"               % "1.0.0-RC4",
      "org.tpolecat"                %% "doobie-postgres"           % "1.0.0-RC4",
      "org.tpolecat"                %% "doobie-hikari"             % "1.0.0-RC4",
      "io.circe"                    %% "circe-generic"             % "0.14.9",
      "io.circe"                    %% "circe-parser"              % "0.14.9",
      "org.flywaydb"                 % "flyway-core"               % "10.15.0",
      "org.flywaydb"                 % "flyway-database-postgresql" % "10.15.0",
      "dev.zio"                     %% "zio-test"                  % "2.1.6" % Test,
      "dev.zio"                     %% "zio-test-sbt"              % "2.1.6" % Test
    ),
    testFrameworks += new TestFramework("zio.test.sbt.ZTestFramework"),
    scalacOptions ++= Seq("-Xmax-inlines", "128"),
    assembly / assemblyJarName := "cfar-engine.jar",
    assembly / assemblyMergeStrategy := {
      case PathList("META-INF", "services", xs @ _*) => MergeStrategy.concat
      case PathList("META-INF", xs @ _*) =>
        xs map { _.toLowerCase } match {
          case "manifest.mf" :: Nil | "index.list" :: Nil | "dependencies" :: Nil => MergeStrategy.discard
          case ps if ps.last.endsWith(".sf") || ps.last.endsWith(".dsa") || ps.last.endsWith(".rsa") => MergeStrategy.discard
          case _ => MergeStrategy.first
        }
      case x => MergeStrategy.first
    }
  )
