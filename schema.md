# Support Ticket CSV Schema

## Required Fields
- `ticket_id`: Unique identifier for the ticket
- `created_date`: When the ticket was created (ISO 8601 format)
- `assigned_to`: Team member assigned to the ticket
- `priority`: Priority level (Low, Medium, High, Critical)
- `status`: Current status (Open, In Progress, Resolved, Closed)
- `first_response_date`: When first response was sent (ISO 8601 format)
- `resolution_date`: When ticket was resolved (ISO 8601 format, null if not resolved)
- `category`: Type of support request (Bug, Feature Request, Question, etc.)
- `team`: Team handling the ticket (Technical, Billing, General, etc.)

## Optional Fields
- `customer_tier`: Customer tier (Free, Pro, Enterprise)
- `escalated`: Boolean indicating if ticket was escalated
- `escalation_date`: When ticket was escalated (ISO 8601 format)
- `satisfaction_score`: Customer satisfaction rating (1-5)

## Example CSV Row
```
ticket_id,created_date,assigned_to,priority,status,first_response_date,resolution_date,category,team,customer_tier,escalated,escalation_date,satisfaction_score
T-2024-001,2024-01-15T09:30:00Z,john.doe@company.com,High,Resolved,2024-01-15T10:15:00Z,2024-01-16T14:30:00Z,Bug,Technical,Enterprise,false,,4
```