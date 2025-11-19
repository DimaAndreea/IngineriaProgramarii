# TravelQuest Backend 

## Purpose
Java + Spring Boot backend (Maven). This README describes prerequisites, how to configure and run the project, how to handle the database schema issues and useful dev options.

## Prerequisites
1. Java 21 JDK installed
2. Maven installed (`mvn`)
3. PostgreSQL installed and running (or another supported DB)
4. IntelliJ IDEA (recommended)
5. (Optional) Docker for local DB

### Project structure

Use a standard Maven layout:
- `src/main/java` — application sources
- `src/main/resources` — config, `application.yml`, Flyway migrations (`db/migration`)
- `src/test/java` — unit/integration tests
- `src/main/resources/static` — static assets
- `Database/data.sql`, `schema.sql` — optional seed/schema files

### Dependency management (Configurarea sistemului de gestionare a dependențelor)

Use Maven and define common dependencies in `pom.xml`:
- `spring-boot-starter-web`
- `spring-boot-starter-data-jpa`
- `org.postgresql:postgresql` (runtime)
- `org.flywaydb:flyway-core`
- `org.springframework.boot:spring-boot-starter-test` (test)

Example quick reminder: run `mvn clean package` to build, `mvn dependency:tree` to inspect dependencies. 
Keep dependency versions in `<properties>` and use `spring-boot-dependencies` BOM in `<dependencyManagement>`.

## Quick setup (local)
1. Clone repository:
   - `git clone <repo-url>`
   - `cd <repo-folder>`

2. Build:
   - `mvn clean package`

3. Connect to database:
   Place the files `docker-compose.yml`, `schema.sql` and `data.sql` in the project root. 
   Open a terminal (CMD) in the project folder and run:

   Start the database container:
   ```bash
   docker-compose up -d
   ```
   Create tables from schema.sql:
   ```bash
   docker exec -i travelquest-postgres psql -U travelquest -d travelquest_dev < schema.sql
   ```
   Populate the database from data.sql:
   ```bash
   docker exec -i travelquest-postgres psql -U travelquest -d travelquest_dev < data.sql
   ```
   Open an interactive psql shell in the container:
   ```bash
   docker exec -it travelquest-postgres psql -U travelquest -d travelquest_dev
   ```

4. Configure application:
   - Edit `src/main/resources/application.yml` (or set environment variables). 
   - Example snippet to use Flyway and stop Hibernate from doing DDL:
     ```yaml
     spring:
       datasource:
         url: jdbc:postgresql://localhost:5432/travelquest
         username: travelquest_user
         password: changeme
       jpa:
         hibernate:
           ddl-auto: none   # disable Hibernate auto DDL (use Flyway)
         show-sql: true
       flyway:
         enabled: true
         baseline-on-migrate: true
     ```

### Linter and formatters

Add simple formatting and linting:
- `.`editorconfig` — basic editor rules (indent, line endings)
- `checkstyle` (via `maven-checkstyle-plugin`) — enforce Java style rules using `checkstyle.xml`
- Optional: `google-java-format` plugin or IntelliJ code style settings for automatic formatting

Example files:
- `.`editorconfig` at project root`
- `checkstyle.xml` referenced by `maven-checkstyle-plugin` in `pom.xml`

Run checks: `mvn verify` (or `mvn checkstyle:check`) depending on plugin setup.

### Optional: unit/integration tests

Recommended test stack:
- JUnit 5 (`org.junit.jupiter`)
- Mockito (`org.mockito:mockito-core`) for unit tests
- Spring Boot test support (`spring-boot-starter-test`) for slice and integration tests
- Use Flyway or Testcontainers for DB-backed integration tests

Common commands:
- `mvn test` — run unit tests
- `mvn verify` — run integration tests if configured with `failsafe`

Folder layout:
- Unit tests in `src/test/java` mirroring package structure
- Integration tests (if using Failsafe) named `*IT.java` and executed during `mvn verify`

Keep tests optional but add a minimal smoke test that boots the Spring context to catch config issues early.