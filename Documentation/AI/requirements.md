# MetroIsJustABus: Requirements & Design

I've made some assumptions (listed in section 1) where the brief leaves gaps. I can put this in a file (Markdown or Word) if you want to hand it in.

## 1. Stakeholders and assumptions

**Actors:** Passenger (anonymous or registered), Operational Staff (planner, dispatcher/traffic controller, ticketing manager), Validator device (on-board or at-stop), Notification channels (email/push/SMS, external), Payment provider (external).

**Assumptions:**
- Validation happens on-board or at stops via devices that submit validation events. They may retry and may be briefly offline.
- Occupancy is estimated from validations (boardings) and, optionally, from staff or sensor corrections. It is an estimate, not ground truth.
- Payment is delegated to an external provider.
- Real-time vehicle positions are out of scope. "Delay" is entered or updated by staff.
- Roles for staff (planner, dispatcher, ticket manager) are separate permissions.

## 2. Requirements

### 2.1 Functional requirements

**Network and schedules**
- FR-1: Passengers can browse lines, stops, and the ordered stop sequence of each line.
- FR-2: Passengers can view schedules per line and stop, filtered by date, including the day-of-week and calendar variants (weekday, weekend, holiday, special).
- FR-3: Passengers can view scheduled trips and the expected time at each stop.
- FR-4: Information shown to passengers is the **effective view**: scheduled data combined with active disruptions.
- FR-5: Staff can create, update, and retire lines, stops, line-stop sequences, schedules, and trips, and each change takes effect from a stated date.

**Disruptions**
- FR-6: Staff can register a disruption of type delay, cancellation, diversion, stop closure, or other.
- FR-7: A disruption has a scope (line, stop, trip, or line+stop), a validity period, and a status, and staff can update or close it.
- FR-8: Delays carry a magnitude, diversions carry an alternative stop set, and cancellations can be complete or partial.
- FR-9: Passenger-facing views reflect disruptions when they are created, updated, or ended.

**Tickets**
- FR-10: Staff manage ticket types (price, validity period, journey count, usage rules such as a transfer window, and whether it is on sale).
- FR-11: A registered passenger can buy a ticket, and the account shows their tickets with state and remaining validity or journeys.
- FR-12: Purchase is idempotent, so a retried request cannot issue two tickets.

**Validation**
- FR-13: A validation attempt is checked against ticket type, state, prior validations, and time, and the result is accepted or rejected with a reason code.
- FR-14: Accepted validations are recorded and update the ticket state (journeys remaining, activation, exhaustion).
- FR-15: Validation is idempotent per validation event, so a retry returns the original result without a second record.
- FR-16: Staff can query ticket usage and validation activity by ticket, line, trip, stop, and period.

**Occupancy and capacity**
- FR-17: Each scheduled trip has a capacity and an occupancy estimate, updated by validations.
- FR-18: Staff see numeric occupancy. Passengers see a coarse level (low, medium, high, full) where enabled.

**Accounts, subscriptions, notifications**
- FR-19: Passengers can register and authenticate.
- FR-20: A passenger can subscribe to a line, stop, or trip, optionally with filters (change types, time windows).
- FR-21: Passengers can set channel preferences, quiet hours, and pause or cancel a subscription.
- FR-22: When a disruption or schedule change occurs, the system finds affected subscribers and notifies them **at most once per event, subscription, and channel**.
- FR-23: Passengers can view their notification history.

**Staff operations and history**
- FR-24: Staff changes are authorized by role and audited (who, what, when).
- FR-25: Historical data (past schedules, trips, disruptions, validations, notifications) is retained and queryable.

### 2.2 Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-1 Availability | Read paths (network, schedules, trips, disruptions) remain available when notification, ticketing, or occupancy are down. Target ≥ 99.9% for reads. |
| NFR-2 Fault isolation | Failure of one component degrades only its own function, using timeouts, circuit breakers, and asynchronous integration. |
| NFR-3 Idempotency | Purchase, validation, and notification delivery are safe to retry. |
| NFR-4 Consistency | Ticket state and validation records are strongly consistent per ticket. Occupancy, notifications, and read models are eventually consistent. |
| NFR-5 Performance | Validation responds in p95 < 300 ms. Schedule reads in p95 < 200 ms (cached). Peak load is on validations and morning schedule reads. |
| NFR-6 Security and privacy | Role-based access control, personal data minimised, notification content free of sensitive data, GDPR-compliant retention and deletion. |
| NFR-7 Auditability | Ticket, validation, and staff changes are traceable. |
| NFR-8 Evolvability | New ticket types, notification channels, and disruption types are added without changing core logic (extension points). |
| NFR-9 Observability | Metrics, structured logs, and correlation IDs across components. |

## 3. Data model

### 3.1 Lifecycles

| Category | Entities | Treatment |
|---|---|---|
| Stable | Line, Stop, LineStop, TicketType, Vehicle type | Versioned with effective dates, rarely changed |
| Planned | ServiceCalendar, ScheduleVersion, ScheduledTrip, StopTime | Versioned and published, and trips are generated from schedules for a date range |
| Operational | Disruption, Occupancy | Time-bound, with a status lifecycle |
| Transactional | Ticket, Purchase, Validation | Append-only or immutable after completion |
| Interaction | Account, Subscription, Notification | Mutable or append-only, with preferences |

### 3.2 Entities and relationships

```
Line(id, code, name, status)
Stop(id, name, lat, lon, status)
LineVariant(id, line_id, direction, valid_from, valid_to)
LineStop(line_variant_id, stop_id, sequence)                 -- ordered

ServiceCalendar(id, days_of_week, date_ranges, exceptions)   -- weekday/weekend/holiday
Schedule(id, line_variant_id, calendar_id, version, valid_from, valid_to, status)
ScheduledTrip(id, schedule_id, service_date, departure_time, vehicle_capacity, status)
StopTime(trip_id, stop_id, sequence, planned_arrival, planned_departure)

Disruption(id, type, scope_type, description, start, end, status, created_by, version)
DisruptionTarget(disruption_id, line_id?, stop_id?, trip_id?)
DisruptionEffect(disruption_id, delay_minutes?, alt_stops?, cancelled_scope?)

TicketType(id, name, price, kind[SINGLE|MULTI|PASS|TIMED], validity_period?,
           max_journeys?, transfer_window?, on_sale, version)
Purchase(id, account_id, ticket_type_id, idempotency_key UNIQUE, amount, payment_ref, status, created_at)
Ticket(id, purchase_id, account_id, ticket_type_id, state, issued_at, activated_at?,
       expires_at?, journeys_used, version)
Validation(id, ticket_id, event_id UNIQUE, validator_id, stop_id?, trip_id?, timestamp,
           result[ACCEPTED|REJECTED], reason_code)

OccupancySnapshot(trip_id, stop_sequence?, boarded_count, estimated_load, capacity, updated_at)

Account(id, email, status, created_at)
NotificationPreference(account_id, channel, enabled, quiet_hours)
Subscription(id, account_id, target_type, target_id, filters, status)
Notification(id, subscription_id, source_event_id, channel, payload, status,
             created_at, sent_at, dedup_key UNIQUE(source_event_id, subscription_id, channel))

StaffUser(id, role) ; AuditLog(id, actor, action, entity, before, after, at)
```

Key relationships: Line 1..* LineVariant, LineVariant *..* Stop (via LineStop), Schedule 1..* ScheduledTrip 1..* StopTime, Disruption *..* {Line, Stop, Trip}, Ticket 1..* Validation, Trip 1..1 OccupancySnapshot.

### 3.3 Modelling decisions
- **Schedules are versioned**, and trips are materialised per service date. Disruptions attach to trips, stops, or lines and are never written into schedule rows. The effective view is computed at read time (or in a projection), and history is preserved.
- **Validations are append-only.** The ticket's counters are a projection updated in the same transaction as the validation.
- **Unique constraints** on `Purchase.idempotency_key`, `Validation.event_id`, and `Notification.dedup_key` are the DB-level backstop for idempotency.
- **Ticket types are versioned**, and the Ticket stores which version it was bought under, so price or rule changes do not alter tickets already sold.

## 4. Component architecture

**Style:** a modular, service-oriented architecture with an event bus. Each module owns its data, reads are served from cached read models, and cross-module effects are asynchronous. It can be deployed as a modular monolith first and split later.

```
 Passenger app / Web      Staff back-office        Validator devices
        │                       │                        │
        └───────────── API Gateway (authN/Z, rate limit, routing) ─────────────┐
   ┌────────┬───────────┬───────────┬───────────┬────────────┬───────────┐     │
 Identity  Network &   Disruption  Ticketing  Validation   Occupancy   Subscription &
 & Account Schedule    Service     Service    Service      Service     Notification
 Service   Service                                                     Service
   │         │            │           │           │           │            │
   └─────────┴────────────┴─── Event Bus (durable, at-least-once) ─────────┘
                   │                                            │
        Passenger Information (read model)                  Audit / History
        = schedule ⊕ disruptions ⊕ occupancy (cache)         (append-only store)
                                                      Notification channels (external)
                                                      Payment provider (external)
```

| Component | Responsibility | Owns data | Depends on |
|---|---|---|---|
| **Identity & Account** | Registration, login, roles, preferences | Account, StaffUser | none |
| **Network & Schedule** | Lines, stops, schedules, trip generation, publishing | Line, Stop, Schedule, Trip | none (publishes events) |
| **Disruption** | Disruption lifecycle | Disruption* | Network (to validate targets, soft dependency) |
| **Passenger Information** | Effective view (schedule + disruption + occupancy level), heavily cached | read models only | events from the three above |
| **Ticketing** | Ticket types, purchase, wallet | TicketType, Purchase, Ticket | Payment provider |
| **Validation** | Rule evaluation, recording, atomic ticket update | Validation | Ticketing data (same transactional boundary or a well-defined API) |
| **Occupancy** | Consume validation events, estimate load | OccupancySnapshot | events only |
| **Subscription & Notification** | Subscriptions, matching, dedup, delivery, retries | Subscription, Notification | events; channel providers |
| **Audit/History** | Immutable log of changes and events | AuditLog, archives | events |

**Placement decisions**
- **Validation and Ticketing share a strong-consistency boundary** (a ticket must not be validated twice concurrently). Either one deployable, or Validation calls a Ticketing "consume journey" operation that uses optimistic locking on `Ticket.version`.
- **Occupancy is fed asynchronously** by `ValidationAccepted` events, so an occupancy failure never blocks boarding.
- **Notification consumes events** and never sits in the call path of staff or passenger operations. If it is down, events accumulate on the bus and are processed on recovery.
- **The transactional outbox pattern** in each producer guarantees "state change + event" atomicity.
- **Fault isolation:** the gateway uses timeouts and circuit breakers per downstream. The Passenger Information service serves last-known-good cache if the disruption feed is stale, and marks the data as "possibly outdated".

## 5. Interfaces

### 5.1 REST (representative)

**Passenger information (public)**
```
GET /lines                     GET /lines/{id}/stops
GET /stops/{id}/departures?date=&from=&limit=     -- effective view
GET /lines/{id}/schedule?date=
GET /trips/{id}                -- stop times, status, occupancy level
GET /disruptions?line=&stop=&active=true
```

**Account and subscriptions**
```
POST /accounts   POST /auth/login
GET/PUT /me/notification-preferences
POST /me/subscriptions {targetType, targetId, filters}   DELETE /me/subscriptions/{id}
GET /me/notifications
```

**Tickets**
```
GET /ticket-types
POST /me/tickets    Header: Idempotency-Key   body {ticketTypeId, paymentToken}
GET /me/tickets     GET /me/tickets/{id}
```

**Validation (device to system)**
```
POST /validations   {eventId, ticketId|token, validatorId, stopId, tripId?, timestamp}
→ 200 {result: ACCEPTED|REJECTED, reason, remaining}
```
`eventId` is generated by the device. A retry with the same `eventId` returns the stored result.

**Staff**
```
CRUD /admin/lines | stops | schedules | trips ; POST /admin/schedules/{id}/publish
POST /admin/disruptions ; PATCH /admin/disruptions/{id} ; POST /admin/disruptions/{id}/close
CRUD /admin/ticket-types
GET  /admin/validations?ticketId=&line=&from=&to=      GET /admin/tickets/{id}/history
GET  /admin/trips/{id}/occupancy
```

### 5.2 Event catalogue

| Event | Producer | Consumers |
|---|---|---|
| `ScheduleChanged / TripsGenerated` | Network | Passenger Info, Notification, Audit |
| `DisruptionCreated / Updated / Closed` | Disruption | Passenger Info, Notification, Audit |
| `TicketPurchased`, `TicketStateChanged` | Ticketing | Audit, (Notification: optional) |
| `ValidationAccepted / Rejected` | Validation | Occupancy, Audit, analytics |
| `OccupancyChanged` (thresholds) | Occupancy | Passenger Info, Notification (optional) |

Every event carries `eventId`, `type`, `occurredAt`, `entityId`, `version`, and a schema version, and consumers deduplicate on `eventId`.

## 6. Behavioural models

### 6.1 Ticket lifecycle (state machine)

```
            purchase ok
   [PURCHASED/ISSUED] ──first valid use──▶ [ACTIVE] ──period ends──▶ [EXPIRED]
          │                                   │  └─journeys used up─▶ [EXHAUSTED]
          │ unused period ends                │
          ├──────────────────────────────▶ [EXPIRED]
          └── refund/cancel (staff, before use) ▶ [CANCELLED]
   ACTIVE ──blocked by staff/fraud──▶ [SUSPENDED] ──restored──▶ [ACTIVE]
```

### 6.2 Validation rules (evaluated in order)

1. Duplicate `eventId`? Return the stored result.
2. The ticket exists and its state is ISSUED or ACTIVE, otherwise reject with `INVALID_STATE`.
3. The current time is within `[valid_from, expires_at]`, otherwise `EXPIRED` or `NOT_YET_VALID`.
4. By kind:
   - **SINGLE:** no accepted validation exists, or the transfer window still covers this one.
   - **MULTI:** `journeys_used < max_journeys`, and a re-validation within the transfer window does not consume a journey.
   - **PASS/TIMED:** the period is valid. Reject `REPEAT_TOO_SOON` for a second validation within a short anti-passback interval.
5. Accept: in one transaction, insert the Validation, update `journeys_used` and `state` (using optimistic locking on `version`), and write the outbox event.

New ticket kinds are implemented as strategy objects behind a `ValidityRule` interface (NFR-8).

### 6.3 Validation sequence

```
Validator → Gateway → Validation: POST /validations(eventId)
Validation → DB: BEGIN; lookup eventId (dup? return)
                 load Ticket(version v); evaluate rules
                 INSERT Validation; UPDATE Ticket WHERE version=v; INSERT outbox; COMMIT
Validation → Validator: ACCEPTED
Outbox relay → Bus: ValidationAccepted → Occupancy (async), Audit
```
If the response is lost, the device retries with the same `eventId` and gets the same result. A version conflict is retried once internally.

### 6.4 Disruption to notification flow

```
Staff → Disruption: create disruption(scope, period)
Disruption: persist + outbox → DisruptionCreated
  ├─▶ Passenger Info: update effective view / invalidate cache
  └─▶ Notification:
        1. resolve targets (line / stop / trip) → affected lines, stops, trips
        2. find subscriptions matching targets and filters, status ACTIVE
        3. for each (subscription, channel): dedup_key=(eventId, subId, channel)
           INSERT ... ON CONFLICT DO NOTHING → if inserted, enqueue delivery
        4. respect preferences and quiet hours (defer or suppress)
        5. deliver with retry and backoff; mark SENT/FAILED; DLQ after N tries
```
Updates and closures generate their own events, so passengers are told when a disruption changes or ends. Notifications are also driven by schedule changes that touch a subscribed line, stop, or trip.

### 6.5 Disruption lifecycle

`DRAFT → ACTIVE → (UPDATED)* → CLOSED`, with `SCHEDULED` if the start is in the future and `EXPIRED` when the end time passes automatically. A **cancelled trip** stays in history and is shown as cancelled, never deleted.

### 6.6 Effective trip computation

For a trip and stop: start from planned times, then apply active disruptions in precedence order (cancellation > diversion/closure > delay). Delays for the same target take the most recent version. Output: status (ON_TIME, DELAYED(n), CANCELLED, DIVERTED), adjusted times, and an occupancy level.

### 6.7 Degraded modes

| Failure | Effect |
|---|---|
| Notification down | Events queue on the bus, and consulting and validation continue. Delivery resumes on recovery. |
| Occupancy down | Validation continues, and occupancy is rebuilt by replaying events. |
| Disruption feed stale | The last-known effective view is served and flagged as possibly outdated. |
| Payment provider down | Purchase fails cleanly with a retryable error, and no ticket is issued without confirmed payment. |
| Bus or relay down | The outbox retains events, with none lost. |

## 7. Idempotency summary

| Operation | Mechanism |
|---|---|
| Purchase | Client `Idempotency-Key` with a unique constraint. A retry returns the original ticket. |
| Validation | Device `eventId` with a unique constraint. A retry returns the original result. |
| Notification | `dedup_key = (source_event_id, subscription_id, channel)`. Consumer dedup by `eventId`, and providers receive the notification id as their idempotency key. |
| Event handling | Consumers record processed `eventId`s or use idempotent upserts. |

## 8. Design decisions and trade-offs

- **Event-driven decoupling vs. immediacy:** notifications and occupancy are eventually consistent, in exchange for isolation from failures.
- **Strong consistency only where money or entitlement is at stake:** tickets and validations.
- **Computed effective view vs. mutated schedules:** this keeps history clean and makes disruptions reversible, at the cost of read-time composition. This is mitigated with a cached read model.
- **Occupancy is an estimate:** alighting is not observed, so load is estimated from boardings and typical trip length. Staff correction is allowed.
- **Modular monolith first:** it lowers operational cost while keeping module boundaries and events ready for splitting.

## 9. Open questions to confirm with stakeholders

1. Are validators connected in real time, or can they work offline (which needs offline rules and later reconciliation)?
2. Is validation per boarding only, or also on exit or transfer?
3. Precise transfer-window and anti-passback rules per ticket type?
4. Is refund or ticket transfer in scope?
5. Which notification channels, and how quickly must they arrive (seconds or minutes)?
6. Data retention periods for validations and personal data?
7. Does occupancy need per-segment (between stops) granularity or only per trip?

## 10. Using LLMs and AI agents to validate this design

- **Traceability check:** ask the model to map each sentence of the brief to FR/NFR IDs and list uncovered sentences. For example, "Historical information may be relevant" maps to FR-25, and "communication failures" maps to NFR-3.
- **Scenario walk-throughs:** have the model simulate failure cases against the sequences in section 6, such as lost validation response, duplicate purchase, simultaneous validation of the same ticket from two devices, and a disruption closed while a notification is in flight.
- **Consistency review:** cross-check the data model against the interfaces (every endpoint's fields exist as attributes, every event has a producer and consumer).
- **Adversarial review:** prompt the model to find single points of failure and race conditions in the component diagram.
- **Human review remains necessary** for the assumptions in section 1 and the open questions in section 9.

I can also expand any part, for example full PlantUML/Mermaid diagrams, an OpenAPI spec, SQL DDL for the data model, or a requirements traceability matrix.
