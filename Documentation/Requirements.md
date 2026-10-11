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
