# Product: MetroIsJustABus

## What it is

MetroIsJustABus is a distributed system that operates an urban bus network. It has two main audiences:

- **Passengers**: they consult the network, lines, stops, schedules and trips; they buy and view tickets; they see trip occupancy; they subscribe to lines, stops or trips and receive notifications.
- **Operational staff**: they maintain the network and schedules, manage tickets, register disruptions, and review validations and occupancy.

This is an academic project. Its main goal is the engineering process (AI-assisted SDLC, CI/CD, deployment, observability), not commercial functionality. The system must still work for real and be demonstrable.

## Domain

- **Network**: a set of lines. A line is an ordered sequence of stops.
- **Schedules**: define the trips planned per line and the expected times at each stop. They vary by day of the week and operational conditions.
- **Trip**: a concrete execution of a schedule. Has a state (scheduled, delayed, cancelled, diverted), occupancy and capacity.
- **Disruption**: affects a line, stop, trip or period. Reflected in passenger-facing information.
- **Ticket**: has a type, price, validity period, conditions of use and number of permitted journeys. Has its own state (active, used up, expired).
- **Validation**: a record of a ticket being used. Only accepted if the ticket is valid for that use at the time it is made.
- **Subscription and notification**: a passenger subscribes to relevant entities; when something changes, the system determines who is affected and notifies them.

## Users and priorities

In priority order:

1. Passenger consultation of network, lines, stops and schedules. This must always be available.
2. Ticket purchase and validation, with guarantees against duplicates and invalid validations.
3. Disruption and occupancy information, consistent with operational state.
4. Subscriptions and notifications.
5. Staff management tools.

When performance and correctness conflict for tickets and validations, correctness wins.

## What this product deliberately does NOT do

- **No real payments.** Ticket purchase records the transaction but does not integrate with payment gateways (Stripe, SIBS, MB Way, etc.). Any payment field is simulated.
- **No native app.** Only the responsive web application. No iOS, Android, offline PWA or native push.
- **No integration with real ticketing systems or turnstiles.** Validation happens through the API or a simulated validator interface.
- **No real-time GPS tracking.** Occupancy is derived from validations and staff-registered load, not from vehicle location.
- **No multi-operator, multi-city or multi-language support.** One network, one operator. Interface in Portuguese.
- **No social features** (comments, line ratings, sharing).
- **No multimodal route planning** (combining with train, metro, bicycle). Only line and trip consultation.
- **No fleet management, vehicle maintenance or driver rostering.**
- **No tax compliance or invoicing.** No invoices are issued and no VAT is calculated.
- **No real passenger data.** Demo data is fictitious; no personal data beyond what the project requires is collected.

## Consequences for development

- Whenever a feature seems to ask for "more" (real payments, mobile app, GPS), the default answer is no, unless the project brief explicitly requires it.
- Operational simplicity is worth more than functional sophistication. A simple, reliable flow beats a fragile extra feature.