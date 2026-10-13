# MetroIsJustABus Requirements Specification

## 1. Purpose and scope

MetroIsJustABus is a software system supporting a public bus network and passenger-related services. This specification separates requirements stated by the course project brief from assumptions and design decisions made by the team.

### 1.1 Evidence and traceability convention

The source is *Automated Software Engineering — Course Project 2026/2027*, version 1.0, dated 29 September 2026. Page references below refer to that PDF. The audit's source map is used to identify the relevant brief sections:

- **B1 — Technical Description**, pp. 7–8.
- **B2 — Application and Architecture**, p. 8.
- **B3 — Communication and Integration**, p. 9.
- **B4 — Testing and Verification**, p. 9; project phases, p. 3.
- **B5 — CI/CDE/CD**, p. 9; milestone requirements, pp. 4–5.
- **B6 — Deployment and Infrastructure**, pp. 9–10; project phases, p. 3.
- **B7 — AI-Assisted and Agentic Engineering**, p. 10; project objectives and phases, pp. 1–3; final report, pp. 4–5.
- **B8 — Course organization and deliverables**, pp. 1–6.

Each FR/NFR has an explicit source. Requirements paraphrasing the brief cite its page and section. Additional detail or a chosen mechanism is marked **[Assumption/Design Decision]** and is not represented as a brief-mandated rule. A requirement may cite both where it combines a required outcome with a proposed refinement.

## 2. Actors and system boundary

- **Passenger:** consults network and service information, acquires and views tickets, validates a ticket, and may create an account and subscribe to relevant changes. (B1, pp. 7–8)
- **Operational staff:** maintains network/schedule and ticket information, manages disruptions, and consults ticket-usage and occupancy information. (B1, p. 8)
- **Validator client:** submits a ticket validation request. The existence and physical form/location of a validator device are not specified by the brief. **[Assumption/Design Decision]**
- **External notification channel/provider:** delivery integration boundary selected by the team. The brief requires notification capability, but does not name a channel or provider. **[Assumption/Design Decision]**

## 3. Functional requirements

### 3.1 Network, schedules and trips

| ID | Requirement | Origin |
|---|---|---|
| FR-01 | The system shall allow passengers to consult the bus network, lines and stops. | Brief: Technical Description, p. 7 (B1). |
| FR-02 | Each line shall be represented as an ordered sequence of stops. | Brief: Technical Description, p. 7 (B1). |
| FR-03 | The system shall allow passengers to consult schedules and planned trips, including expected times at stops. | Brief: Technical Description, p. 7 (B1). |
| FR-04 | The system shall represent schedule variation by day of week or other operating conditions. Exact calendar categories and date-filter behavior are implementation decisions. | Brief: Technical Description, p. 7 (B1); **[Assumption/Design Decision]** calendar representation. |
| FR-05 | Operational staff shall be able to maintain network and schedule information. | Brief: Technical Description, p. 8 (B1). |
| FR-06 | Passenger-facing service information shall reflect known disruptions and operating changes relevant to the affected line, stop or trip. | Brief: Technical Description, pp. 7–8 (B1). |

### 3.2 Disruptions

| ID | Requirement | Origin |
|---|---|---|
| FR-07 | The system shall allow operational staff to register and manage service disruptions, including delays, cancellations and diversions. | Brief: Technical Description, pp. 7–8 (B1). |
| FR-08 | The system shall associate a disruption with its affected service scope and period. The exact scope model, lifecycle states and handling of overlapping disruptions shall be defined by the team. | Brief: Technical Description, p. 7 (B1); **[Assumption/Design Decision]** data model and precedence rules. |
| FR-09 | Changes to disruptions shall be reflected in relevant passenger information. | Brief: Technical Description, p. 7 (B1). |
| FR-10 | Stop closure, partial cancellation, alternative-stop representation and delay magnitude are candidate disruption details; their semantics shall be confirmed and documented before implementation. | **[Assumption/Design Decision]**; disruption types are supported by B1, p. 7, but these detailed semantics are not specified. |

### 3.3 Tickets and validation

| ID | Requirement | Origin |
|---|---|---|
| FR-11 | Passengers shall be able to acquire tickets of different types and consult tickets associated with their account. | Brief: Technical Description, p. 8 (B1). |
| FR-12 | The system shall support ticket types whose price, validity period, conditions of use or permitted journey count may differ. | Brief: Technical Description, p. 8 (B1). |
| FR-13 | Operational staff shall be able to manage ticket-related information. | Brief: Technical Description, p. 8 (B1). |
| FR-14 | A ticket shall be validated before use. The validity decision shall take account of ticket type, current ticket state, previous validations and the attempted validation timestamp. | Brief: Technical Description, p. 8 (B1). |
| FR-15 | The system shall process and permanently record each successfully completed ticket validation. | Brief: Technical Description, p. 8 (B1). |
| FR-16 | Retrying a ticket-acquisition operation after a communication failure shall not issue the same ticket more than once. | Brief: Technical Description, p. 8 (B1). The idempotency key and persistence mechanism are **[Assumption/Design Decision]**. |
| FR-17 | Retrying a validation after a communication failure shall not create duplicate successful validation records. | Brief: Technical Description, p. 8 (B1). Stable event identifiers and replaying the original result are **[Assumption/Design Decision]**. |
| FR-18 | Operational staff shall be able to obtain information about ticket usage and validation activity. | Brief: Technical Description, p. 8 (B1). Specific query filters and retention periods are **[Assumption/Design Decision]**. |
| FR-19 | The system shall distinguish successful validation records from rejected attempts. Whether rejected attempts are persisted, and for how long, remains a team/stakeholder decision. | Brief: Technical Description, p. 8 (B1); **[Assumption/Design Decision]** record classification and retention. |

### 3.4 Occupancy and capacity

| ID | Requirement | Origin |
|---|---|---|
| FR-20 | The system shall calculate and update trip occupancy and available capacity in real time based on passenger activity, specifically recorded ticket validations. | Brief: Technical Description, p. 8 (B1). |
| FR-21 | Operational staff shall be able to consult trip capacity and occupancy information. Passengers shall be able to access occupancy/available-capacity information where appropriate. | Brief: Technical Description, p. 8 (B1). |
| FR-22 | Occupancy derived from validations shall be treated as an estimate, not a ground-truth passenger count. Manual corrections and sensor integration are excluded from baseline scope unless separately agreed. | **[Assumption/Design Decision]**; B1, p. 8 supports occupancy and validation inputs but does not define measurement accuracy or correction sources. |
| FR-23 | Occupancy granularity (whole trip or stop-to-stop segment), capacity source, and passenger display categories shall be defined by the team before implementation. | **[Assumption/Design Decision]**; B1, p. 8 requires the information but does not prescribe these details. |

### 3.5 Accounts, subscriptions and notifications

| ID | Requirement | Origin |
|---|---|---|
| FR-24 | Passengers shall be able to create accounts. Account authentication and authorization details shall be selected and documented by the team. | Brief: Technical Description, p. 8 (B1); **[Assumption/Design Decision]** authentication approach. |
| FR-25 | Passengers shall be able to subscribe to relevant lines, stops or trips and manage notification preferences. | Brief: Technical Description, p. 8 (B1). |
| FR-26 | When relevant service information changes, the system shall identify affected subscribers and notify them. Duplicate notifications caused by communication failures shall be prevented. | Brief: Technical Description, p. 8 (B1). |
| FR-27 | Notification channels, delivery timing, quiet hours, subscription filters and passenger-visible notification history shall be selected as project scope decisions; the brief does not prescribe them. | **[Assumption/Design Decision]**; B1, p. 8 establishes notifications and preferences only. |

### 3.6 Staff access and history

| ID | Requirement | Origin |
|---|---|---|
| FR-28 | Operational staff shall be able to maintain network/schedule information, manage ticket-related information, register/manage disruptions, and consult ticket usage and occupancy information. | Brief: Technical Description, p. 8 (B1). |
| FR-29 | Staff subroles, authorization granularity, change audit fields and historical retention/deletion rules shall be documented as team decisions. | **[Assumption/Design Decision]**; B1, p. 8 names operational staff and historical information but does not define these policies. |
| FR-30 | The system shall retain relevant historical information needed to understand previous system activity and operation. The exact records and retention period shall be decided and documented. | Brief: Technical Description, p. 8 (B1); **[Assumption/Design Decision]** record scope and retention. |

## 4. Non-functional requirements

| ID | Requirement | Origin |
|---|---|---|
| NFR-01 | The system shall be a distributed, multi-component system. It shall include a core backend, a passenger-facing web application and a notification service as independently deployable units from the start. The notification service shall cross an independent application boundary; a single backend REST application is insufficient. | Brief: Application and Architecture, p. 8 (B2). The explicit three-unit decomposition is the team's compliant architecture decision. |
| NFR-02 | Temporary failure of one component shall not unnecessarily make the whole system unavailable; unrelated capabilities should remain usable where their dependencies permit. | Brief: Technical Description, p. 8 (B1). |
| NFR-03 | Components shall handle communication failures, timeouts, temporary unavailability, retries and duplicate operations/messages without unintended effects, including duplicate ticket issuance, validation records or notifications. | Brief: Technical Description, p. 8 (B1); Communication and Integration, p. 9 (B3). |
| NFR-04 | Ticket state and validation decisions shall remain consistent with current ticket state and prior successful validations. The consistency mechanism is an implementation decision. | Brief: Technical Description, p. 8 (B1); **[Assumption/Design Decision]** consistency mechanism. |
| NFR-05 | The team shall not claim quantitative availability, latency, throughput or peak-load requirements unless they are specified by the brief or explicitly recorded separately as proposed team targets. | **[Assumption/Design Decision]** documentation constraint; no numeric service target is specified in B1–B8. |

## 5. System and Engineering Constraints

These constraints are requirements of the system and its engineering process, not passenger-domain functions. They are retained as explicit milestone traceability items.

| ID | Constraint | Origin |
|---|---|---|
| SYS-ARCH-01 | Implement a distributed multi-component architecture with a core information system and independently deployable supporting components. The passenger web application, core backend and notification service shall each be independently deployable from project start. Notification capability shall cross an independent application boundary. | Brief: Application and Architecture, p. 8 (B2); three deployable boundaries are the team's explicit architecture decision. |
| SYS-COMM-01 | Use synchronous APIs and asynchronous/event-based communication where appropriate; the system shall not rely exclusively on synchronous REST calls. | Brief: Communication and Integration, p. 9 (B3). |
| SYS-COMM-02 | Define interfaces and exchanged data, including schemas, ownership and compatibility/versioning rules; justify chosen protocols and data formats. | Brief: Application and Architecture, p. 8 (B2); Communication and Integration, p. 9 (B3). Schema/versioning conventions are **[Assumption/Design Decision]**. |
| SYS-COMM-03 | Specify and verify behavior for timeouts, unavailable components, retries, duplicate messages/operations and cross-component consistency. | Brief: Technical Description, p. 8 (B1); Communication and Integration, p. 9 (B3). |
| SYS-TEST-01 | Automate unit, integration, system/end-to-end and relevant acceptance testing. | Brief: Testing and Verification, p. 9 (B4); project phases, p. 3. |
| SYS-TEST-02 | Verify interfaces and interactions between independently deployed components; test relevant failure/recovery scenarios and include automated quality checks and static analysis. Define which checks gate releases. | Brief: Testing and Verification, p. 9 (B4). Release-gate configuration is **[Assumption/Design Decision]**. |
| SYS-CI-01 | The milestone pipeline shall build the repository, run automated tests and basic quality checks, produce a deployable version on success, and deploy it to development. | Brief: Milestone 2, p. 4 (B8). |
| SYS-CI-02 | The CI/CDE/CD process shall create versioned deployable artifacts, validate integrated/system behavior, deploy automatically to development and production, apply production gates, and trace source revision to artifact to deployed version. | Brief: CI/CDE/CD, p. 9 (B5). |
| SYS-DEP-01 | Maintain separate development and production environments. Development shall include a self-hosted CI/CD runner and support integration/system tests; production shall host the deployed system. | Brief: Deployment and Infrastructure, pp. 9–10 (B6). |
| SYS-DEP-02 | Containerize application components/supporting services and keep infrastructure/deployment configuration reproducible and version controlled. | Brief: Deployment and Infrastructure, pp. 9–10 (B6). |
| SYS-DEP-03 | Manage configuration, secrets, persistent data, networks and service dependencies; validate deployments and provide recovery from unsuccessful deployments. | Brief: Deployment and Infrastructure, p. 10 (B6). |
| SYS-OPS-01 | Monitor and validate deployed-system behavior, with observability sufficient to detect and diagnose failures. | Brief: project phases, p. 3; Deployment and Infrastructure, pp. 9–10 (B6). Specific tools are **[Assumption/Design Decision]**. |
| SYS-AI-01 | Use LLMs/agents across appropriate lifecycle activities, including requirements, design, implementation, testing, integration and deployment. | Brief: AI-Assisted and Agentic Engineering, p. 10 (B7); objectives/phases, pp. 1–3. |
| SYS-AI-02 | Provide agents with relevant context and constraints, independently validate their outputs, and define when human intervention is required. | Brief: AI-Assisted and Agentic Engineering, p. 10 (B7); objectives/phases, pp. 1–3. The validation workflow is **[Assumption/Design Decision]**. |
| SYS-MEAS-01 | Collect evidence about delegated tasks, agent autonomy, human intervention, validation results, failures, defects, rework, effort and pipeline behavior for analysis/reporting. | Brief: AI-assisted engineering and project phases, pp. 1–3 (B7); final report, pp. 4–5 (B8). |
| SYS-TRACE-01 | Maintain traceability among requirements, assumptions/design decisions, tasks, verification evidence, source revisions, built artifacts and deployed versions. | Brief: Milestone 1 and final report, pp. 4–5 (B8); CI/CDE/CD, p. 9 (B5). |
| SYS-REPORT-01 | The final report shall cover problem analysis, requirements/assumptions, models, architecture/interfaces/trade-offs, traceability, AI tools and agent evolution, testing, CI/CD, deployment/operations, evidence/metrics/critical analysis, and each member's tasks and effort. | Brief: final report requirements, pp. 4–5 (B8). |
| SYS-DEMO-01 | Prepare a ten-minute demonstration of passenger functionality and cross-component interactions, including relevant normal/failure scenarios, and identify the deployed version demonstrated. | Brief: final demo, p. 5 (B8). Scenario selection is **[Assumption/Design Decision]**. |
| SYS-DELIVERY-01 | Submit source code and the scripts, configuration, models, documentation and artifacts needed to build, test, deploy and operate the system; provide the required production deployment and process evidence/metrics. | Brief: final delivery, pp. 4–5 (B8). |
| SYS-COURSE-01 | Plan for team/course obligations: five-student team, milestone deliverables, evaluation attendance, peer/self-evaluation, defense booking and individual defenses. These are project obligations, not runtime product behavior. | Brief: course organization and milestones, pp. 2–6 (B8). |

## 6. Assumptions and Design Decisions

The following items are not confirmed business rules from the brief. They are proposed defaults or decisions that must remain visible in design and implementation records and be confirmed by the team/stakeholders where needed.

| ID | Assumption or decision | Status / implication |
|---|---|---|
| A-01 | Public network and schedule information can be browsed without an account. Accounts are required for account-specific tickets, subscriptions and preferences unless stakeholders decide otherwise. | Proposed assumption; confirm whether purchase always requires login. |
| A-02 | A validator client submits validation events with a stable event ID and may retry the same event after timeout/lost response. New validations are not accepted offline unless offline rules are explicitly agreed. | Recommended baseline; avoids conflicting decisions against authoritative ticket state. Physical device form/location is undecided. |
| A-03 | Accepted validations are an input to estimated occupancy, not a ground-truth count. Manual corrections and sensors are optional extensions, not baseline scope. | Confirm occupancy formula, capacity source and trip/segment granularity. |
| A-04 | No live vehicle-position/AVL/GPS integration is assumed because no source/interface is specified. Operational staff enter/update disruption or delay information in the baseline. | Proposed scope boundary; not an explicit exclusion in the brief. |
| A-05 | Ticket acquisition is in scope, but real external payment is not assumed. Use a simulated payment adapter unless a real provider is required. A ticket must not be issued after a failed or uncertain payment result in any actual-payment design. | Proposed assumption; confirm payment scope and settlement behavior. |
| A-06 | Notification channels/providers will be selected explicitly. Provider abstraction may be used; multiple real channels are not assumed. | Decide channel, timing, retry behavior and the precise duplicate-delivery guarantee. Exactly-once receipt cannot be promised absent provider support. |
| A-07 | Ticket activation, validity boundaries, journey counting, transfer windows, anti-passback intervals, cancellation, refunds, suspension and ticket categories remain unresolved. | Implement only rules approved by stakeholders/teacher. The brief establishes variable ticket properties and validation factors, not these detailed rules. |
| A-08 | Disruption scope, validity, lifecycle and conflict precedence will be defined by the team. | Any precedence order, partial cancellation or diversion encoding is a design decision, not a brief rule. |
| A-09 | Begin with a documented minimum staff authorization and audit policy. Separate planner/dispatcher/ticket-manager roles and detailed before/after snapshots are not assumed unless required. | Proposed security/design decision. |
| A-10 | No quantitative availability, latency or load target is derived from the brief. | Any team-selected numeric target belongs only in “Proposed Team Targets,” with a measurement method and workload. |
| A-11 | Historical records are retained for operational needs and applicable policy; exact retention/deletion periods remain undecided. | Reconcile history/audit needs with privacy and deletion rules before implementation. |
| A-12 | The core backend, passenger web application and notification service are separate deployable units from the beginning. | Architecture decision implementing B2. Internal modularity within a deployable unit does not change these boundaries. |
| A-13 | REST paths, event names, payload fields, broker, outbox, consumer deduplication, cache/read model, and consistency mechanisms are team design choices. | Document rationale and verify with interface and failure tests; do not attribute these mechanisms to the brief. |

### 6.1 Proposed Team Targets

No quantitative team targets are currently adopted. If targets are later selected (for example, availability or response-time objectives), record them in this subsection with owner, measurement window, workload, test method and rationale. They are team proposals and shall not be cited as requirements from the course brief.

## 7. Open decisions

1. May validators accept new validations offline, and if so, how are conflicts reconciled?
2. Is validation per boarding only, or also on exit/transfer? What counts as a journey?
3. What are ticket-specific validity, activation, transfer, anti-passback, cancellation, refund and suspension rules?
4. Must accounts be used to purchase tickets? Is a real payment provider required?
5. Which notification channels and event types are in scope, and what delivery guarantee is required?
6. What occupancy granularity, capacity source and correction mechanism are expected?
7. What is the delay/disruption data source, and how are overlapping disruptions resolved?
8. Are rejected validation attempts retained? What are history and personal-data retention periods?
9. Which staff roles, permissions and audit details are required?
10. Which service calendar, time zone and holiday/special-day source should be used?
11. What measured performance/availability targets, if any, will the team propose and validate?
12. Are the three independently deployable units specified in SYS-ARCH-01 sufficient for course acceptance, or is an additional supporting service expected?

## 8. Milestone 1 traceability and evidence checklist

- Every FR and NFR above has a source page/section or the explicit **[Assumption/Design Decision]** label.
- Architecture decomposition and component boundaries are documented in SYS-ARCH-01.
- Assumptions, unresolved business rules and open questions are recorded separately from confirmed requirements.
- Maintain links from each requirement to its design element, implementation task and verification evidence as the project proceeds (SYS-TRACE-01).
- Record AI/agent tasks, context supplied, human review/intervention, validation results, failures and rework as evidence for the required process analysis (SYS-AI-01, SYS-AI-02, SYS-MEAS-01).
