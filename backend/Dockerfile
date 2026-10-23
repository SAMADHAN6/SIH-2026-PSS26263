# Spring Boot 3 Backend Dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/apaar-verify-backend-1.0.0.jar app.jar
EXPOSE 8085
ENTRYPOINT ["java", "-jar", "app.jar"]
