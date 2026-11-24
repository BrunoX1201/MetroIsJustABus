# Tech stack

Every choice has a reason. Changing a technology requires challenging its reason first. Versions are pinned in `package.json`, `.nvmrc`, Dockerfiles and `compose.yaml`; this file must be updated in the same change whenever one of them changes.

Each item has a status:

- **In use**: present in the repository and exercised by the pipeline.
- **Planned**: decided, but not yet in the repository. An agent must not assume it exists. Introducing it is an explicit task.

> Revision 1.1 (2026-11-24): aligned with the code produced for Milestone 2 (Express 5, `node:test`, Node.js 24, PostgreSQL 17, RabbitMQ 4). NestJS and Vitest were replaced by the technologies actually in use. The reasons are recorded below.

## Language and runtime

- **TypeScript on Node.js 24** — *In use* (`.nvmrc`, `node:24-alpine` images, `engines` ≥ 22.12). One language for backend, frontend and tests. Allows sharing contract types across services and reduces the context that agents and humans must maintain. Node 24 was chosen during Milestone 2 because it is the LTS line at the time the images were built.

## Frontend

- **React 19 + Vite + TypeScript** — *In use* — for the passenger and staff application. React has the largest volume of examples and code that agents handle well, which reduces generation errors. Vite gives fast builds and minimal configuration.
- **One SPA** with a staff area protected by roles, instead of two applications. Reduces duplicated components and authentication logic.
- **Nginx** — *In use* — serves the built SPA and proxies `/api/` to core-api inside the container network.

## Backend

- **Express 5** — *In use* — for core-api, validation-service and notification-service. Small, explicit and well known by agents; Milestone 2 needed three independently deployable services quickly. Module boundaries that NestJS would give through dependency injection are enforced instead by the folder conventions in `conventions.md` (controller → service → repository) and by code review.
- **Input validation with Zod** — *Planned* — aligned with the OpenAPI schema, so validation does not drift from the documentation.

## Data

- **PostgreSQL 17, one logical database per service** — *In use* (`compose.yaml`, `backend/infra/postgres/init.sql`; services do not connect yet). Tickets, validations and simulated payments need ACID transactions and unique constraints (for example, one purchase per idempotency key). A NoSQL store would push duplicate protection into application code.
- **Migrations with node-pg-migrate** — *Planned*. Schema is versioned in the repository and applied by the pipeline. Chosen over Prisma Migrate to keep SQL constraints explicit and avoid a code generator.
- **Redis** only if a proven need for caching or rate limiting appears. Not included.

## Messaging and events

- **RabbitMQ 4** — *In use as infrastructure* (`rabbitmq:4-management`; no producers or consumers yet). Durable queues, manual acknowledgements, retries and dead-letter queues. Covers failure handling and redelivery without the operational complexity of Kafka, which is not justified at this project's volume.

## API contracts

- **OpenAPI 3.1, contract-first** — *Planned* (no contract exists yet). For every new endpoint the contract is written before the implementation and is the source of truth. It supports contract tests between services.

## Infrastructure and deployment

- **Docker with multi-stage builds** — *In use*. Small images, no build tooling in production, non-root user for the backends.
- **Docker Compose** — *In use* — for local development, CI smoke tests and the development VM. It is enough for four components and is reproducible. Kubernetes was considered and rejected because its operational cost is disproportionate for the timeline.
- **Traefik v3** — *Planned* — as reverse proxy and traffic switching, needed for blue-green.
- **Terraform** — *Planned* — to provision the VMs and network, if the DEI VMs allow it. Otherwise the VM setup is documented as a versioned script.
- **Blue-green per service** — *Planned* — as the production deployment strategy. Allows immediate rollback and can be implemented with Compose and Traefik without an orchestrator. The development environment currently uses redeploy + automatic restore of the last verified tag (`scripts/deploy-development.sh`).

## CI/CD

- **GitHub Actions** — *In use*. PR checks and image publication run on GitHub-hosted runners; `deploy-development` runs on a self-hosted runner on the development VM (labels `self-hosted, linux, metro-dev`), enabled by the repository variable `DEV_RUNNER_READY`. The brief requires a self-hosted runner.
- **GHCR** — *In use* — for images, tagged `sha-<commit>`. No additional infrastructure, and permissions tied to the repository.
- **Trivy** for vulnerability scanning and **Syft** for SBOM generation — *Planned*. They produce auditable evidence for every artifact.

## Quality and testing

- **ESLint (typescript-eslint)** — *In use*. **Semgrep** — *Planned* — for security patterns and project-specific rules.
- **`node:test` run with `tsx`** — *In use* — for unit and HTTP tests. Built into Node, no extra dependency, TypeScript through `tsx`. Replaces Vitest, which was not adopted.
- **Supertest-style HTTP tests over a real `listen(0)` server** — *In use* (`src/app.test.ts`).
- **Testcontainers** — *Planned* — for integration tests with real Postgres and RabbitMQ. Database mocks do not validate the transactions this project must guarantee.
- **Pact** (contract tests), **Playwright** (E2E), **k6** (load), **Stryker** (mutation) — *Planned*.

## Observability

- **OpenTelemetry, Prometheus, Loki, Tempo, Grafana** — *Planned*. One consistent toolset with correlated data by trace ID.

## Secrets and configuration

- **GitHub Secrets / `GITHUB_TOKEN`** — *In use* for CI and GHCR.
- **SOPS with age** — *Planned* — for per-environment configuration files.
- Development-only credentials in `compose.yaml` and `init.sql` are local defaults, never used in production.

## AI tools and agents

- **Claude Code / Codex** as agents — *In use* (see `Documentation/Requirements.md` §10). A `CLAUDE.md` (or `AGENTS.md`) holding conventions, constraints and verification commands — *Planned*.
- **Hooks** that run lint and tests after every change — *Planned*.
- **Agent session logs and metrics** kept in the repository (without secrets) under `Documentation/evidence/` — *Planned*; required for the "Measurement & Critical Analysis" criterion.

## Rejected options

- **Kubernetes / k3s**: high operational cost for the timeline. May be reconsidered if there is spare capacity.
- **Kafka**: unnecessary volume and complexity. RabbitMQ covers the requirements.
- **Microservices with one repository per service**: increases version coordination and makes the integration the project wants to exercise harder. A monorepo with independent workspaces is kept instead.
- **MongoDB**: the transactional guarantees for tickets and validations are the main reason for choosing Postgres.
- **NestJS** (initially chosen): replaced by Express 5 in Milestone 2; see Backend.
- **Vitest** (initially chosen): replaced by `node:test`; see Quality and testing.
