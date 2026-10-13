# Architectural principles

Declarative rules. If a change violates one, the change is wrong, or the rule must be explicitly discussed with the team before changing. Rules are never bypassed silently.

## Boundaries and data

1. Each service exclusively owns its database. No service reads or writes another service's database.
2. There is no direct database access outside the repository layer of each service.
3. Services communicate only through the REST APIs documented in OpenAPI or the events published to RabbitMQ.
4. No interface contract changes without first changing the corresponding OpenAPI file or event schema.
5. A published event is immutable. Schema changes are versioned, never edited in place.

## Consistency and failures

6. Writing to the database and publishing an event are done through the outbox pattern. An event is never published outside a transaction that also writes the state.
7. Every operation that can be repeated (ticket purchase, validation, notification sending) requires an idempotency key.
8. Every event consumer records the identifiers it has already processed and ignores duplicates.
9. A failure in one service must not make passenger-facing reads of schedules, lines or stops unavailable. Reads degrade; they never fail in cascade.
10. Synchronous calls between services have an explicit timeout, bounded exponential backoff retries and a circuit breaker. No call is made without a timeout.
11. A retry must never produce a duplicate effect. If an operation is not idempotent, it is not retried.

## Money and time

12. Monetary values are stored as integer cents. Floats are never used for money.
13. All dates and times are stored in UTC. Conversion to Portugal time happens only at presentation.
14. A ticket's validity is computed by the domain at validation time, never trusted from the client.

## Authorization and security

15. All authorization is enforced on the backend. The UI may hide actions, but it is never the security boundary.
16. Staff operations require an explicit role. A passenger can never change schedules, disruptions or ticket states.
17. Secrets never enter the repository, logs or Docker images.

## AI agents

18. An agent never merges without passing the full test and static analysis pipeline.
19. Agent-generated code is treated as untrusted until validated by tests written or reviewed by a human.
20. An agent never changes tests to make them pass without recording the change and its justification. Changing a test requires human approval.
21. Architectural decisions are recorded as ADRs before implementation. An agent does not make an architectural decision that is not documented.
22. When unsure whether something is in scope, it is not. Confirmation is requested before implementing.
23. When an agent fails the same task twice, the task goes to a human and the incident is recorded for the metrics.

## Operations

24. No manual changes on production servers. Every change goes through the pipeline.
25. A version reaches production only after passing the validation gate and only if a development deployment exists with the same SHA.
26. Every deployment has a tested rollback path.