# ---------- Build stage ----------
FROM gradle:8.7-jdk21 AS build
WORKDIR /workspace
COPY backend/ .
RUN set -eux; \
    if [ -f "./gradlew" ]; then \
      chmod +x ./gradlew && ./gradlew --no-daemon --stacktrace --info clean bootJar; \
    else \
      gradle --no-daemon --stacktrace --info clean bootJar; \
    fi

# ---------- Run stage ----------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /workspace/build/libs/*.jar /app/app.jar
ENV JAVA_OPTS="-Xms256m -Xmx512m"
EXPOSE 8080
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]

