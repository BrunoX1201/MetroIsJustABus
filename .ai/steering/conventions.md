# Conventions

Patterns that go beyond the linter. When a convention does not cover a case, follow the closest existing example in the codebase and record the decision in an ADR.

> Revision 1.1 (2026-11-24): repository layout and framework-specific rules aligned with the code that exists after Milestone 2 (npm workspaces, Express 5, `node:test`). Folders marked *(planned)* do not exist yet and are created by the first task that needs them.

## Monorepo structure

```
.ai/
  steering/             # product, tech-stack, conventions, principles (PL5)
  sdd/specs/<feature>/  # requirements, design, tasks, review, validation (PL6/PL7)
frontend/               # React SPA (passengers and staff), served by Nginx
backend/
  core-api/             # main domain (network, tickets, validation decision)
  validation-service/   # entry point for validators, calls core-api
  notification-service/ # subscriptions, preferences, delivery
  contracts/            # (planned) OpenAPI and event schemas, source of truth
  infra/postgres/       # local database bootstrap
scripts/                # dev runner, smoke test, release manifest, deploy
.github/workflows/      # CI/CD pipeline
Documentation/
  Requirements.md       # project-wide requirements (source of FR/NFR/A/Q/D IDs)
  adr/                  # (planned) architectural decisions
  evidence/             # AI session log, session records, CI run exports
```

Each backend is an npm workspace with the same internal structure. Existing code (`src/app.ts`, `src/index.ts`) is the composition root; domain code goes into modules:

```
src/
  app.ts                # builds the Express app, mounts module routers
  index.ts              # reads configuration, starts the server
  modules/<domain>/
    <domain>.routes.ts       # Express router: input validation, auth, response mapping
    <domain>.service.ts      # domain rules
    <domain>.repository.ts   # only place that talks to the database
    <domain>.schemas.ts      # request/response schemas
  infra/                # database pool, RabbitMQ, HTTP clients
  *.test.ts             # unit tests next to the code
test/
  integration/          # (planned) real Postgres/RabbitMQ
```

## HTTP routes

- Versioned prefix is mandatory: `/api/v1/...` as seen by clients. The Nginx (`frontend/nginx.conf`) and Vite proxies strip `/api`, so each backend mounts its routers under `/v1/...` (for example, core-api serves `POST /v1/ticket-purchases`, reached by the browser as `POST /api/v1/ticket-purchases`). Operational endpoints (`/health`) are not versioned.
- Resources are plural, lowercase, hyphenated: `/api/v1/bus-lines/{lineId}/stops`.
- HTTP verbs carry their semantic meaning. Actions that do not fit CRUD use a sub-resource with a verb at the end: `POST /api/v1/tickets/{ticketId}/cancel`.
- Idempotent operations that create resources (ticket purchase, validation) require the `Idempotency-Key` header. Without it, the request is rejected with `400`.
- Pagination is cursor-based: `?cursor=...&limit=...`. Never offset on lists that change.
- Dates are ISO 8601 with `Z`. Monetary values are integer cents with an explicit `currency` field.
- Identifiers are UUID v7.

## Routes, services and repositories

- The route handler only validates input, checks authorization, calls the service and maps the response. It contains no business rules.
- The service contains domain rules and orchestrates repositories and event publishing.
- The repository is the only place that talks to the database.
- No route handler directly imports another module's repository. Cross-module communication goes through the exported service.

## Errors

All error responses follow Problem Details (RFC 9457):

```json
{
  "type": "https://metroisjustabus.example/problems/ticket-already-validated",
  "title": "Ticket already validated",
  "status": 409,
  "detail": "Ticket 0190... was already validated at this stop for the current period.",
  "instance": "/api/v1/validations",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736"
}
```

- Domain errors extend a base `DomainError` class with a stable code. The HTTP layer maps the code to a status.
- Infrastructure errors (database, broker) never reach the client with details. The full error is logged with the `traceId` and a generic `500` is returned.
- Stack traces, table names, SQL queries or internal service names are never returned in responses.
- Status codes: `400` invalid input, `401` unauthenticated, `403` forbidden, `404` not found, `409` state conflict or duplicate, `422` business rule violated, `503` dependency temporarily unavailable (with `Retry-After`).

## Authentication and authorization

- JWT issued by core-api, short validity (15 min), rotating refresh tokens.
- The token is validated at each service boundary by a shared Express middleware (location to be decided when authentication is implemented; see Q-09 in `Documentation/Requirements.md`). No service implements its own token validation logic.
- Roles: `passenger` and `staff` (with sub-roles `operator` and `admin`). Roles are checked with an explicit middleware on each router: `requireRole('staff')`. Routes without an explicit role or an explicit `public()` marker are rejected by default, not accepted. Sub-roles `operator`/`admin` are a proposal pending Q-09.
- Internal services (validation-service and notification-service) accept calls from core-api using a service token, distinct from user tokens.
- User identifiers from the request body are never trusted. `userId` is always extracted from the token.

## Events

- Named `<aggregate>.<past-fact>`: `disruption.registered`, `ticket.validated`, `trip.occupancy_changed`.
- Common envelope: `eventId`, `eventType`, `schemaVersion`, `occurredAt`, `producer`, `correlationId`, `payload`.
- Consumers handle events using their idempotency key (`eventId`) and record them in the processed table before acknowledging.
- Schema changes are backward compatible by default. An incompatible change creates a new `schemaVersion`.

## Database

- Table names are plural snake_case: `tickets`, `ticket_validations`.
- Every table has `id` (UUID v7), `created_at` and `updated_at` in UTC.
- Soft deletion only where history is a requirement (disruptions, validations). Elsewhere, rows are deleted.
- Migrations are never edited after being applied to a shared environment. Corrections are a new migration.
- Uniqueness constraints and foreign keys are declared in the database, not only in the application.

## Tests

- Test names are sentences in the form `should <behavior> when <condition>`.
- One integration test per critical ticket and validation flow, using real Postgres and RabbitMQ.
- Every fixed bug gets a test that fails before the fix.
- Failure tests: dependency timeout, duplicate message, retry of an identical request, unavailable service.
- Tests do not use fixed `sleep`. They wait for a condition with an explicit timeout.

## Commits and branches

- Conventional Commits: `feat(core-api): ...`, `fix(validation): ...`, `chore(infra): ...`.
- Agent-generated commits include an `Agent-Session: <id>` trailer for traceability. Human commits with relevant AI help include `AI-Assisted: <tool>`.
- Every AI session is logged in `Documentation/evidence/ai-sessions.csv` in the same pull request (see `Documentation/evidence/README.md`).
- Branches are named `feature/<issue>-<description>` from `main`. Merges happen only through pull requests with a green pipeline.
- Pull request descriptions link the requirement or issue and state the relevant decision taken.

## Logs

- Structured JSON logs with `level`, `service`, `traceId` and `msg`.
- Tokens, passwords, full personal data (name, contact) and secrets are never logged. Ticket identifiers are sufficient.
- An error log includes the domain code, not only the message.

## Language

- Code, variable names, commits and ADRs are in English.
- User interface and error messages shown to passengers are in European Portuguese.
- Project documentation and the final report are in Portuguese.