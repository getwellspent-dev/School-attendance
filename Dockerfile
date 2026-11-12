FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /workspace

COPY backend/pom.xml backend/
COPY backend/src backend/src

RUN mvn -f backend/pom.xml clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /workspace/backend/target/attendance-1.0.0.jar app.jar

# Render sets PORT env var at runtime (defaults to 10000)
ENV PORT=10000
EXPOSE 10000

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
