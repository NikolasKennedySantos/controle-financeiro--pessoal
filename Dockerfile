# Passo 1: Construir a aplicação usando Maven
FROM maven:3.8.8-jakartaee-10 AS build
COPY . .
RUN mvn clean package -DskipTests

# Passo 2: Rodar a aplicação usando Java
FROM openjdk:17-jdk-slim
COPY --from=build /target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]