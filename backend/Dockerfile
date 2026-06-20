# Build stage
FROM sbtscala/scala-sbt:eclipse-temurin-jammy-21.0.2_13_1.10.0_3.4.2 AS builder
WORKDIR /app
COPY . .
RUN sbt assembly

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/scala-3.4.2/cfar-engine.jar ./cfar-engine.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "cfar-engine.jar"]
