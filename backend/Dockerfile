# Stage 1: Build Java Application
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
COPY src ./src
# Install maven if needed or copy pre-built jar
RUN if [ -f ./mvnw ]; then ./mvnw clean package -DskipTests; fi

# Stage 2: Production Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/attendance-1.0.0.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
