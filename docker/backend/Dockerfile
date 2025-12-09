# Build stage
FROM maven:3.8.7-openjdk-18 AS build
WORKDIR /build

# Copy only pom first to use layer caching for dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy sources and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# Runtime stage
FROM amazoncorretto:17
ARG PROFILE=dev
ARG APP_VERSION=1.0.0

WORKDIR /app

# Copy the built jar (use wildcard and rename to stable name)
COPY --from=build /build/target/*.jar /app/app.jar

EXPOSE 8030

ENV DB_URL=jdbc:mysql://mysql:3306/book_social_network
ENV DB_USER=root
ENV DB_PASSWORD=root
ENV ACTIVE_PROFILE=${PROFILE}
ENV JAR_VERSION=${APP_VERSION}

CMD ["sh", "-c", "java -jar -Dspring.profiles.active=${ACTIVE_PROFILE} -Dspring.datasource.url=${DB_URL} -Dspring.datasource.username=${DB_USER} -Dspring.datasource.password=${DB_PASSWORD} /app/app.jar"]
