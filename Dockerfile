# ---------- Build stage ----------
FROM gradle:8.7-jdk21 AS build
WORKDIR /workspace

COPY backend/ .

RUN gradle bootJar --no-daemon

# ---------- Run stage ----------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /workspace/build/libs/*SNAPSHOT*.jar app.jar
ENV JAVA_OPTS="-Xms256m -Xmx512m"
EXPOSE 8080
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar app.jar"]
