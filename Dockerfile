FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

RUN apk add --no-cache curl ca-certificates bash

# Download BungeeCord build 1893 (stable for proxy bridging)
RUN curl -fSL -o BungeeCord.jar "https://ci.md-5.net/job/BungeeCord/1893/artifact/bootstrap/target/BungeeCord.jar"

# Copy your configuration files and plugins folder
COPY config.yml .
COPY plugins/ ./plugins/

EXPOSE 8080

CMD ["java", "-Xms128M", "-Xmx384M", "-XX:+UseContainerSupport", "-jar", "BungeeCord.jar"]
