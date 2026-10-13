# Tech stack

Every choice has a reason. Changing a technology requires challenging its reason first. Versions are confirmed at the start of the project before pinning them in `package.json` and image tags.

## Language and runtime

- **TypeScript on Node.js 22 LTS.** One language for backend, frontend and tests. Allows sharing contract types across services and reduces the context that agents and humans must maintain.

## Frontend

- **React + Vite + TypeScript** for the passenger and staff application. React has the largest volume of examples and code that agents handle well, which reduces generation errors. Vite gives fast builds and minimal configuration.
- **One SPA** with a staff area protected by roles, instead of two applications. Reduces duplicated components and authentication logic.

## Backend

- **NestJS** for core-api, validation-service and notification-service. Modules and dependency injection enforce explicit boundaries, which helps maintain the consistency the brief asks for. Decorators and modular structure are predictable for agents.
- **Input validation with Zod or class-validator**, aligned with the OpenAPI schema, so validation does not drift from the documentation.

## Data

- **PostgreSQL 16, one logical database per service.** Tickets, validations and simulated payments need ACID transactions and unique constraints (for example, one validation per ticket per period). A NoSQL store would push duplicate protection into application code.
- **Migrations with Prisma Migrate or node-pg-migrate.** Schema is versioned in the repository and applied by the pipeline.
- **Redis** only if a proven need for caching or rate limiting appears. Not included by default.

## Messaging and events

- **RabbitMQ 3.13.** Durable queues, manual acknowledgements, retries and dead-letter queues. Covers failure handling and redelivery without the operational complexity of Kafka, which is not justified at this project's volume.

## API contracts

- **OpenAPI 3.1, contract-first.** The contract is written before implementation and is the source of truth. It generates types for the frontend and supports contract tests (Pact) between services.

## Infrastructure and deployment

- **Docker with multi-stage builds.** Small images, no build tooling in production, non-root user.
- **Docker Compose** for local development and for both environments (dev and prod) on the VMs. It is enough for four components and is reproducible. Kubernetes was considered and rejected because its operational cost is disproportionate for the timeline.
- **Traefik v3** as reverse proxy and service discovery. Supports health checks and traffic switching, needed for blue-green.
- **Terraform** to provision the VMs and network. Each environment's configuration is versioned.
- **Blue-green per service** as the deployment strategy. Allows immediate rollback and can be implemented with Compose and Traefik without an orchestrator.

## CI/CD

- **GitHub Actions** with a self-hosted runner on the development VM. The brief requires a self-hosted runner. GitHub Actions integrates natively with the repository, pull requests and the image registry.
- **GHCR** for images. No additional infrastructure, and permissions tied to the repository.
- **Trivy** for vulnerability scanning and **Syft** for SBOM generation. They produce auditable evidence for every artifact.

## Quality and testing

- **ESLint and Semgrep** for static analysis. ESLint covers style and common errors; Semgrep covers security patterns and project-specific rules.
- **Vitest** for unit tests. Fast and compatible with TypeScript without heavy configuration.
- **Supertest and Testcontainers** for integration tests, with real Postgres and RabbitMQ. Database mocks do not validate the transactions this project must guarantee.
- **Pact** for contract tests between independently implemented services.
- **Playwright** for E2E and system tests.
- **k6** for basic load tests.
- **Stryker** for mutation testing. It measures whether tests actually detect defects, which is the most direct way to validate agent-generated code.

## Observability

- **OpenTelemetry** for metrics, logs and traces instrumentation, correlated by trace ID.
- **Prometheus** for metrics, **Loki** for logs, **Tempo** for traces and **Grafana** for dashboards. One consistent toolset with correlated data.

## Secrets and configuration

- **GitHub Secrets** for CI secrets.
- **SOPS with age** for per-environment configuration files. They live in the repository encrypted, with versioned history and no plaintext secrets.

## AI tools and agents

- **Claude Code** as the primary agent, with a `CLAUDE.md` file holding conventions, constraints and verification commands.
- **Hooks** that run relevant lint and tests after every change.
- **MCP servers** for GitHub and the development database.
- **Agent session logs** kept in the repository (without secrets), as the evidence source for the process and metrics criterion.

## Rejected options

- **Kubernetes / k3s**: high operational cost for the timeline. May be reconsidered if there is spare capacity.
- **Kafka**: unnecessary volume and complexity. RabbitMQ covers the requirements.
- **Microservices with one repository per service**: increases version coordination and makes the integration the project wants to exercise harder. A monorepo with independent packages is kept instead.
- **MongoDB**: the transactional guarantees for tickets and validations are the main reason for choosing Postgres.