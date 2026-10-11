# Context and objectives
MetroIsJustABus is software designed to support a public bus network and all services related to its passengers.

# Functional
Passenger
Must be able to consult the network, lines, stops, schedules, and planned trips.
Acquisition of different types of tickets.
It must be possible to view all tickets associated with their account.
It must be possible to access information regarding the occupancy/available capacity of trips.
Create accounts.

Staff
Must be able to obtain information about ticket usage and validation activity.   
Must have access to information regarding trip capacity and occupancy.  
The system must provide mechanisms to maintain network and schedule information.   
Must be able to manage information related to tickets.  
The system must allow registering and managing network disruptions. 

System
Responsible for processing and permanently recording all successfully completed ticket validations.
Must calculate and update trip occupancy and available capacity information in real-time, based on passenger activity (specifically recorded ticket validations)

Lines
Must be defined as an ordered sequence of stops.

Tickets
Price, validity period, specific conditions of use, or the number of trips they allow vary depending on the ticket.
Validation is mandatory. The decision of whether a ticket is valid for a specific use depends on multiple factors: the ticket type, its current status, the history of previous validations, and the timestamp when validation is attempted.

# Non-Funcional

System Architecture and Design
The system must be implemented as a distributed, multi-component system.   
It must include a passenger-facing web application.   
The notification capability must be implemented across an independent application boundary. 

Fault Tolerance, Resilience, and Consistency
Temporary failures of individual parts of the system must not unnecessarily make the entire system unavailable.
The system must handle communication failures, timeouts, etc.
Communication failures must be handled without causing unintended effects, such as issuing the same ticket or recording the same validation

# Identification of Ambiguities and Inconsistencies

Ticket Management and Validation
The document states that tickets may differ in price, validity, conditions of use, or number of permitted journeys, and that validation depends on the current state and previous validations. However, it does not specify how the system handles physical validation failures (a passenger trying to validate an expired or depleted ticket on a transport vehicle without physical turnstiles, or how integration with physical reader devices is handled).

Notification System and Subscriptions
It is mentioned that passengers can subscribe to lines, stops, or trips, and that the system should notify affected passengers when something relevant changes. However, it does not specify the delivery channels for notifications (browser push notifications, email, SMS) nor the level of urgency/frequency with which they are sent.