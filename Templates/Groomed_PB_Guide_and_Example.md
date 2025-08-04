# 🚀 Groomed Product Backlog

## Overview  
A **Groomed Product Backlog** ensures that user stories are well-defined, prioritized, and structured for effective sprint planning. Each backlog item should contain sufficient details to facilitate development and testing. 

For SWEN90016 since we conduct the project in a "controlled manner", the user story to be delivered across each sprint by all the teams has been "prioritized in advance" by the teaching team. Each team will take the same user story and complete the Representation of the Product Backlog as shown below. 
The actual grooming and prioritization of the Product Backlog will be done in the "Semester Long" and "Year Long" project subjects in your degree program.

### **Key Elements of a Groomed Product Backlog**
- **Use Case (Requirement):** A high-level feature description.
- **User Story:** A short, structured statement using *As a [user], I want [feature], so that [benefit]* format.
- **Acceptance Criteria (Given-When-Then):** Conditions that must be met for the story to be considered complete.
- **Priority:** Assigned using MoSCoW prioritization (*Must-have, Should-have, Could-have, Won’t-have*).
- **Estimation (Story Points):** Approximate effort required to complete the user story.
- **User Story Description:** Additional context, including background information and external references.
- **Dependencies:** Other features, technical constraints, or third-party services affecting the story.
- **Notes:** Design considerations, stakeholder feedback, or any other relevant information.

---

## **Example: Groomed Product Backlog for Smart Parking System**

| Use Case | User Story | Acceptance Criteria | Priority | Estimation (SP) | User Story Description | Dependencies | Notes |
|----------|-----------|---------------------|----------|-----------------|------------------------|--------------|-------|
| Book Parking Spot | As a driver, I want to search for and book a parking spot in advance, so that I can be assured of a space before I arrive. | **Given** I am a registered user with the app, **When** I search for available parking near my destination, **Then** I should see a list of available spots with details like distance, pricing, and availability. | Must-have | 5 | Users should be able to input location, date, and time for booking. The system should display real-time availability. | Requires integration with real-time parking availability APIs. | Ensure UI supports filtering by location, price, and accessibility. |
| Book Parking Spot | (Continuation of previous user story) | **Given** I select a parking spot from the list, **When** I confirm my booking, **Then** the system should reserve the spot and provide a confirmation with a unique booking ID. | Must-have | 3 | Once a user books a spot, it should be locked for that user for a limited time. | Payment service integration required for pre-paid bookings. | Booking details should be accessible in the user’s account dashboard. |

---

## **Definition of Done (DoD)**
A user story is considered **"Done"** when:  
- The feature is fully developed and passes peer code review.  
- Acceptance criteria (**Given-When-Then**) are met and validated through testing.  
- The functionality is demonstrated and approved in Sprint Review.  
- Unit, integration, and system tests have been successfully executed.  
- There are no critical or high-priority bugs remaining.  
- Code is merged into the main branch with appropriate version control.  
- Documentation (API details, UI design updates, and deployment guides) is updated.  

---

## **Additional Notes**
- If a **user story has multiple acceptance criteria**, list them in separate rows under the "Acceptance Criteria" column while keeping all other details in a single row.
- Keep track of historical changes using version control.

---
