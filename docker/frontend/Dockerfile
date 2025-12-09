# stage 1: build
FROM maven:3.8.7-openjdk-18 AS build
WORKDIR /build

# copy pom first (leverage cache) and download dependencies
COPY pom.xml .
RUN mvn --batch-mode dependency:go-offline

# copy sources and package
COPY src ./src
RUN mvn --batch-mode clean package -DskipTests

# stage 2: runtime
FROM amazoncorretto:17
ARG PROFILE=dev
ARG APP_VERSION=1.0.0

WORKDIR /app

# copy the built jar (assumes maven produced one jar in target/)
COPY --from=build /build/target/*.jar /app/app.jar

EXPOSE 8030

# MySQL JDBC URL example (replace host/port/dbname as needed)
ENV DB_URL=jdbc:mysql://mysql-bsn:3306/book_social_network?useSSL=false&serverTimezone=UTC
ENV ACTIVE_PROFILE=${PROFILE}
ENV JAR_VERSION=${APP_VERSION}

CMD ["sh", "-c", "java -jar -Dspring.profiles.active=${ACTIVE_PROFILE} -Dspring.datasource.url=${DB_URL} /app/app.jar"]
