# MetroIsJustABus Requirements Specification

## 1. Purpose and traceability convention

MetroIsJustABus supports a public bus network and passenger-related services. This specification distinguishes requirements stated in *Automated Software Engineering — Course Project 2026/2027*, version 1.0 (29 September 2026), from team assumptions and design decisions.

Source references use the following map from the requirements review:

- **B1 — Technical Description**, pp. 7–8.
- **B2 — Application and Architecture**, p. 8.
- **B3 — Communication and Integration**, p. 9.
- **B4 — Testing and Verification**, p. 9; project phases, p. 3.
- **B5 — CI/CDE/CD**, p. 9; milestone requirements, pp. 4–5.
- **B6 — Deployment and Infrastructure**, pp. 9–10; project phases, p. 3.
- **B7 — AI-Assisted and Agentic Engineering**, p. 10; objectives/phases, pp. 1–3; final report, pp. 4–5.
- **B8 — Course organization and deliverables**, pp. 1–6.

Every FR and NFR identifies its source. Additional detail or an implementation choice is marked **[Assumption/Design Decision]**, and is not attributed to the brief.

## 2. Actors and system boundary

- **Passenger:** consults network/service information, acquires and views tickets, and may create an account, subscribe to changes and validate tickets. (B1, pp. 7–8)
- **Operational staff:** maintains network, schedule and ticket information; manages disruptions; consults ticket-use and occupancy information. (B1, p. 8)
- **Validator client:** submits ticket-validation requests. A physical device and its location are not specified. **[Assumption/Design Decision]**
- **Notification provider/channel:** integration boundary selected by the team; the brief specifies notification capability, not a particular channel or provider. **[Assumption/Design Decision]**

## 3. Functional requirements

### 3.1 Network, schedules and trips

| ID | Requirement | Origin |
|---|---|---|
| FR-01 | Passengers shall be able to consult the network, lines and stops. | Brief: Technical Description, p. 7 (B1). |
| FR-02 | Each line shall be defined as an ordered sequence of stops. | Brief: Technical Description, p. 7 (B1). |
| FR-03 | Passengers shall be able to consult schedules and planned trips, including expected times at stops. | Brief: Technical Description, p. 7 (B1). |
| FR-04 | Schedules shall represent variation by day of week or other operating conditions. Exact calendar categories and date-filter behavior are a team decision. | Brief: Technical Description, p. 7 (B1); **[Assumption/Design Decision]** calendar representation. |
| FR-05 | Operational staff shall be able to maintain network and schedule information. | Brief: Technical Description, p. 8 (B1). |
| FR-06 | Passenger-facing information shall reflect known disruptions and operating changes relevant to the affected line, stop or trip. | Brief: Technical Description, pp. 7–8 (B1). |

### 3.2 Disruptions

| ID | Requirement | Origin |
|---|---|---|
| FR-07 | Operational staff shall be able to register and manage disruptions, including delays, cancellations and diversions. | Brief: Technical Description, pp. 7–8 (B1). |
| FR-08 | A disruption shall be associated with its affected service scope and period. Exact scope model, lifecycle states and overlap precedence shall be defined by the team. | Brief: Technical Description, p. 7 (B1); **[Assumption/Design Decision]** data model and precedence. |
| FR-09 | Changes to disruptions shall be reflected in relevant passenger information. | Brief: Technical Description, p. 7 (B1). |
| FR-10 | Stop closure, partial cancellation, delay magnitude and alternative-stop representation are candidate details whose semantics must be confirmed before implementation. | **[Assumption/Design Decision]**; disruption types are supported by B1, p. 7, but these detailed semantics are unspecified. |

### 3.3 Tickets and validation

| ID | Requirement | Origin |
|---|---|---|
| FR-11 | Passengers shall be able to acquire different ticket types and consult tickets associated with their account. | Brief: Technical Description, p. 8 (B1). |
| FR-12 | Ticket types may vary in price, validity period, conditions of use and permitted journey count. | Brief: Technical Description, p. 8 (B1). |
| FR-13 | Operational staff shall be able to manage ticket-related information. | Brief: Technical Description, p. 8 (B1). |
| FR-14 | Tickets shall be validated before use. Validity shall be determined using ticket type, current status, previous validations and the attempted validation timestamp. | Brief: Technical Description, p. 8 (B1). |
| FR-15 | The system shall process and permanently record each successfully completed ticket validation. | Brief: Technical Description, p. 8 (B1). |
| FR-16 | A retry after communication failure shall not issue the same ticket more than once. The idempotency key and persistence mechanism are team choices. | Outcome: Brief, Technical Description, p. 8 (B1); mechanism: **[Assumption/Design Decision]**. |
| FR-17 | A retry after communication failure shall not create duplicate successful validation records. Stable event IDs and replaying the original result are team choices. | Outcome: Brief, Technical Description, p. 8 (B1); mechanism: **[Assumption/Design Decision]**. |
| FR-18 | Operational staff shall be able to obtain information about ticket usage and validation activity. Specific query filters and retention periods are team decisions. | Brief: Technical Description, p. 8 (B1); **[Assumption/Design Decision]** detail. |
| FR-19 | Successful validation records shall be distinguished from rejected attempts. Whether rejected attempts are retained, and for how long, remains a team decision. | Brief: Technical Description, p. 8 (B1); **[Assumption/Design Decision]** record policy. |

### 3.4 Occupancy and capacity

| ID | Requirement | Origin |
|---|---|---|
| FR-20 | The system shall calculate and update trip occupancy and available capacity in real time based on passenger activity, specifically recorded ticket validations. | Brief: Technical Description, p. 8 (B1). |
| FR-21 | Operational staff shall be able to consult trip capacity and occupancy. Passengers shall be able to access occupancy/available-capacity information where appropriate. | Brief: Technical Description, p. 8 (B1). |
| FR-22 | Occupancy derived from validations is an estimate, not a ground-truth passenger count. Manual corrections and sensor integration are optional extensions, not baseline scope. | **[Assumption/Design Decision]**; B1, p. 8 does not specify accuracy or correction sources. |
| FR-23 | Occupancy granularity, capacity source and passenger display categories shall be defined by the team before implementation. | **[Assumption/Design Decision]**; B1, p. 8 requires the information but does not prescribe these details. |

### 3.5 Accounts, subscriptions and notifications

| ID | Requirement | Origin |
|---|---|---|
| FR-24 | Passengers shall be able to create accounts. Authentication and authorization details shall be documented by the team. | Account creation: Brief, Technical Description, p. 8 (B1); details: **[Assumption/Design Decision]**. |
| FR-25 | Passengers shall be able to subscribe to relevant lines, stops or trips and manage notification preferences. | Brief: Technical Description, p. 8 (B1). |
| FR-26 | When relevant service information changes, the system shall identify affected subscribers and notify them. Communication failures shall not cause duplicate notifications. | Brief: Technical Description, p. 8 (B1). |
| FR-27 | Notification channels, delivery timing, quiet hours, subscription filters and a passenger-visible notification history are scope decisions; the brief does not prescribe them. | **[Assumption/Design Decision]**; B1, p. 8 establishes notifications and preferences only. |

### 3.6 Staff access and history

| ID | Requirement | Origin |
|---|---|---|
| FR-28 | Operational staff shall be able to maintain network/schedule information, manage ticket information, register/manage disruptions, and consult ticket-use and occupancy information. | Brief: Technical Description, p. 8 (B1). |
| FR-29 | Staff subroles, authorization granularity, audit fields and historical retention/deletion rules shall be documented as team decisions. | **[Assumption/Design Decision]**; B1, p. 8 does not specify these policies. |
| FR-30 | The system shall retain relevant historical information needed to understand previous activity and operation. Exact records and retention periods shall be decided and documented. | Outcome: Brief, Technical Description, p. 8 (B1); scope/period: **[Assumption/Design Decision]**. |

## 4. Non-functional requirements

| ID | Requirement | Origin |
|---|---|---|
| NFR-01 | The system shall be distributed and multi-component. The core backend, passenger web application and notification service shall be independently deployable units from the start. Notification capability shall cross an independent application boundary; a single backend REST application is insufficient. | Distributed architecture and web/notification boundaries: Brief, Application and Architecture, p. 8 (B2); explicit three-unit deployment decomposition: **[Assumption/Design Decision]** to meet that constraint. |
| NFR-02 | Temporary failure of one component shall not unnecessarily make the whole system unavailable; unrelated capabilities should remain usable where dependencies permit. | Brief: Technical Description, p. 8 (B1). |
| NFR-03 | Components shall handle communication failures, timeouts, temporary unavailability, retries and duplicate operations/messages without unintended effects, including duplicate ticket issuance, validation records or notifications. | Brief: Technical Description, p. 8 (B1); Communication and Integration, p. 9 (B3). |
| NFR-04 | Ticket state and validation decisions shall remain consistent with current state and prior successful validations. The consistency mechanism is a team design choice. | Required decision inputs: Brief, Technical Description, p. 8 (B1); mechanism: **[Assumption/Design Decision]**. |
| NFR-05 | Quantitative availability, latency, throughput and load targets shall not be attributed to the brief unless explicitly specified there. | **[Assumption/Design Decision]** documentation rule; no numeric targets are specified in B1–B8. |

## 5. System and Engineering Constraints

| ID | Constraint | Origin |
|---|---|---|
| SYS-ARCH-01 | Implement a distributed multi-component system with a core information system and independently deployable supporting components. Core backend, passenger web app and notification service shall each be independently deployable from project start. Notification capability shall cross an independent application boundary. | Brief: Application and Architecture, p. 8 (B2); explicit three-unit boundary: **[Assumption/Design Decision]**. |
| SYS-COMM-01 | Use synchronous APIs and asynchronous/event-based communication where appropriate; do not make all interactions synchronous REST calls. | Brief: Communication and Integration, p. 9 (B3). |
| SYS-COMM-02 | Define component interfaces and exchanged data, including schemas, ownership and compatibility/versioning rules; justify protocols and data formats. | Brief: Application and Architecture, p. 8 (B2); Communication and Integration, p. 9 (B3). Schema/version conventions: **[Assumption/Design Decision]**. |
| SYS-COMM-03 | Specify and verify behavior for timeouts, unavailable components, retries, duplicate messages/operations and cross-component consistency. | Brief: Technical Description, p. 8 (B1); Communication and Integration, p. 9 (B3). |
| SYS-TEST-01 | Automate unit, integration, system/end-to-end and relevant acceptance testing. | Brief: Testing and Verification, p. 9 (B4); project phases, p. 3. |
| SYS-TEST-02 | Verify interfaces and interactions between independently deployed components; test relevant failure/recovery scenarios and include automated quality checks and static analysis. Define release-gating checks. | Brief: Testing and Verification, p. 9 (B4); gate configuration: **[Assumption/Design Decision]**. |
| SYS-CI-01 | Build the repository automatically, run automated tests and basic quality checks, produce a deployable version on success and deploy it to development. | Brief: Milestone 2, p. 4 (B8). |
| SYS-CI-02 | Create versioned deployable artifacts, validate integrated/system behavior, deploy automatically to development and production, use production gates, and trace source revision to artifact to deployed version. | Brief: CI/CDE/CD, p. 9 (B5). |
| SYS-DEP-01 | Maintain separate development and production environments. Development shall include a self-hosted CI/CD runner and support integration/system tests; production shall host the deployed system. | Brief: Deployment and Infrastructure, pp. 9–10 (B6). |
| SYS-DEP-02 | Containerize application components/supporting services and keep infrastructure/deployment configuration reproducible and version controlled. | Brief: Deployment and Infrastructure, pp. 9–10 (B6). |
| SYS-DEP-03 | Manage configuration, secrets, persistent data, networks and service dependencies; validate deployments and recover from unsuccessful deployments. | Brief: Deployment and Infrastructure, p. 10 (B6). |
| SYS-OPS-01 | Monitor and validate deployed behavior, with observability sufficient to detect and diagnose failures. | Brief: Project Phases, p. 3; Deployment and Infrastructure, pp. 9–10 (B6). Specific tools: **[Assumption/Design Decision]**. |
| SYS-AI-01 | Use LLMs/agents across appropriate lifecycle activities, including requirements, design, implementation, testing, integration and deployment. | Brief: AI-Assisted and Agentic Engineering, p. 10 (B7); objectives/phases, pp. 1–3. |
| SYS-AI-02 | Provide agents with context and constraints, independently validate outputs, and define when human intervention is required. | Brief: AI-Assisted and Agentic Engineering, p. 10 (B7); objectives/phases, pp. 1–3. Workflow: **[Assumption/Design Decision]**. |
| SYS-MEAS-01 | Collect evidence about delegated tasks, agent autonomy, human intervention, validation results, failures, defects, rework, effort and pipeline behavior for analysis/reporting. | Brief: AI-assisted engineering and phases, pp. 1–3 (B7); final report, pp. 4–5 (B8). |
| SYS-TRACE-01 | Maintain traceability among requirements, assumptions/design decisions, tasks, verification evidence, source revisions, built artifacts and deployed versions. | Brief: Milestone 1/final report, pp. 4–5 (B8); CI/CDE/CD, p. 9 (B5). |
| SYS-REPORT-01 | The final report shall cover problem analysis, requirements/assumptions, models, architecture/interfaces/trade-offs, traceability, AI tools/agent evolution, testing, CI/CD, deployment/operations, evidence/metrics/critical analysis, and member tasks/effort. | Brief: Final report requirements, pp. 4–5 (B8). |
| SYS-DEMO-01 | Prepare a ten-minute demonstration of passenger functionality and cross-component interactions, including relevant normal/failure scenarios, and identify the deployed version demonstrated. | Brief: Final demo, p. 5 (B8); scenario selection: **[Assumption/Design Decision]**. |
| SYS-DELIVERY-01 | Submit source code and scripts, configuration, models, documentation and artifacts needed to build/test/deploy/operate; provide required production deployment and process evidence/metrics. | Brief: Final delivery, pp. 4–5 (B8). |
| SYS-COURSE-01 | Plan for five-student team and course obligations, including milestone deliverables, evaluation attendance, peer/self-evaluation, defense booking and individual defenses. These are project obligations, not runtime behavior. | Brief: Course organization and milestones, pp. 2–6 (B8). |

## 6. Assumptions and Design Decisions

The following are not confirmed business rules from the brief. They are proposed defaults or decisions that must remain visible in project records and be confirmed where needed.

| ID | Assumption or decision | Status / implication |
|---|---|---|
| A-01 | Public network/schedule information can be browsed without an account. Accounts are required for account-specific tickets, subscriptions and preferences unless stakeholders decide otherwise. | Proposed assumption; confirm if purchasing always requires login. |
| A-02 | A validator client submits events with a stable event ID and may retry the same event after timeout/lost response. New validations are not accepted offline unless offline rules are agreed. | Recommended baseline; device form/location remains undecided. |
| A-03 | Accepted validations feed estimated occupancy, not ground-truth counts. Manual corrections and sensor integration are optional extensions, not baseline scope. | Confirm formula, capacity source and trip/segment granularity. |
| A-04 | No live vehicle-position/AVL/GPS integration is assumed because no source/interface is specified. Operational staff enter/update disruption or delay information in the baseline. | Proposed scope boundary, not an explicit brief exclusion. |
| A-05 | Ticket acquisition is in scope; real external payment is not assumed. Use a simulated payment adapter unless a real provider is required. An actual-payment design must not issue a ticket after failed/uncertain payment. | Proposed assumption; confirm payment scope and settlement behavior. |
| A-06 | Select notification channels/providers explicitly. Provider abstraction may be used; multiple real channels are not assumed. | Decide channels, timing, retry policy and duplicate-delivery guarantee. Exactly-once passenger receipt depends on provider support. |
| A-07 | Ticket activation, validity boundaries, journey counting, transfer windows, anti-passback intervals, cancellation, refunds, suspension and ticket categories remain unresolved. | Implement only rules approved by stakeholders/teacher. The brief specifies varying ticket properties and validation factors, not these policies. |
| A-08 | Define disruption scope, validity, lifecycle and conflict precedence. | Precedence, partial cancellation and diversion encoding are team decisions. |
| A-09 | Define a minimum staff authorization and audit policy. Separate planner/dispatcher/ticket-manager roles and detailed before/after snapshots are not assumed unless needed. | Proposed security/design decision. |
| A-10 | No quantitative availability, latency or load target is derived from the brief. | Any chosen numeric target belongs only under **Proposed Team Targets**, with measurement method and workload. |
| A-11 | Retain history for operational needs and applicable policy; exact retention/deletion periods remain undecided. | Reconcile history/audit needs with privacy and deletion rules. |
| A-12 | Core backend, passenger web application and notification service are separate deployable units from the beginning. | Architecture decision implementing B2. Internal modularity does not change these deployment boundaries. |
| A-13 | REST paths, event names/payloads, broker, outbox, consumer deduplication, cache/read model and consistency mechanisms are team design choices. | Record rationale and verify through interface/failure testing; do not attribute mechanisms to the brief. |

### 6.1 Proposed Team Targets

No quantitative team targets are currently adopted. If targets are selected later, record each here with owner, measurement window, workload, test method and rationale. They are team proposals and shall not be cited as requirements from the course brief.

## 7. Open decisions

1. Can validators accept new validations offline, and how would conflicts be reconciled?
2. Is validation per boarding only, or also on exit/transfer? What constitutes a journey?
3. What are ticket-specific validity, activation, transfer, anti-passback, cancellation, refund and suspension rules?
4. Are accounts required to purchase tickets? Is a real payment provider required?
5. Which notification channels/event types are in scope, and what delivery guarantee applies?
6. What occupancy granularity, capacity source and correction mechanism are expected?
7. What is the source of delay/disruption updates, and how are overlapping disruptions resolved?
8. Are rejected validation attempts retained? What are history and personal-data retention periods?
9. Which staff roles, permissions and audit details are required?
10. Which service calendar, time zone and holiday/special-day source should be used?
11. What measured performance/availability targets, if any, will the team propose?
12. Are the three independently deployable units in SYS-ARCH-01 sufficient, or is another supporting service expected?

## 8. Milestone 1 evidence checklist

- Each FR/NFR cites a brief page/section or carries the explicit **[Assumption/Design Decision]** label.
- Architecture decomposition and deployment boundaries are recorded under SYS-ARCH-01.
- Assumptions, unresolved rules and open questions remain separate from confirmed requirements.
- As work proceeds, link each requirement to its design element, implementation task and verification evidence (SYS-TRACE-01).
- Record AI/agent tasks, supplied context, human review/intervention, validation results, failures and rework (SYS-AI-01, SYS-AI-02, SYS-MEAS-01).
