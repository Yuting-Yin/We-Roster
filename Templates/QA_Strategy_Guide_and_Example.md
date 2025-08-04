# 🚀 Quality Assurance Strategy  

This document outlines the **Quality Assurance (QA) Strategy** for the **Smart Parking System** project, ensuring that testing activities are planned, executed, and documented as part of every sprint.  

---

## 🏆 **QA Guidelines in Scrum SDLC**  

Quality Assurance is **baked into every sprint** rather than being deferred to a separate testing phase. Each sprint delivers a **functional, incremental feature** to the client, which must be tested against:  
- The **Acceptance Criteria** (defined for each User Story)  
- The **Definition of Done (DoD)** (ensuring completeness)  

Testing is not ad-hoc; instead, it follows a structured approach based on **Behavior-Driven Development (BDD)** to validate functionality. Considering SWEN90016, we are mindful that you are introduced to QA Strategies in Scrum SDLC during the second half of the semester. Therefore, it is acceptable if teams start documenting the Quality Assurance Tests from Sprint 2 for the project that you are undertaking for Assignment 2.

## **Acceptance Criteria:**
Acceptance Criteria (AC) is documented when a User Story is created and refined, ideally before development starts. For SWEN90016, Sprint Planning phase could be a good fit to document the Acceptance Test Scenarios for your Sprint Deliverables.
Acceptance Criteria (AC) is primarily defined by the Product Owner, often with input from stakeholders and the Development Team. It ensures that a user story meets business needs and functional expectations.

## **Definition of Done (DoD):**
Definition of Done (DoD) is a team-wide standard agreed upon at the start of the project and reviewed periodically. It applies to all work and remains consistent across user stories and sprints.
Definition of Done (DoD) is collectively established by the Scrum Team (including Developers, Scrum Master, and Product Owner) and applies universally to ensure quality and consistency.

## **Acceptance Criteria v/s Definition of Done (DoD) : Key Differences**  

| **Aspect** | **Acceptance Criteria**                     | **Definition of Done (DoD)** | 
|------------|--------------------------------------------------|---------------------|
| Scope      | Specific to each User Story | Applies to all work items in the Sprint  |
| Who Defines it?        | Product Owner (with team input)  | Entire Scrum Team               |
| Purpose        | Ensures business and functional requirements are met     | Ensures completeness, quality, and readiness for release               |
| When Defined? | Before development starts | At the beginning of the project, refined over time |
| Example | “User can reset their password via email link” | “Code is tested, peer-reviewed, and deployed to staging” |

---

## ✅ **Test Case Documentation Format**  

All test cases follow the **BDD syntax**:  

> **Given** `[Initial condition]`, **When** `[Action performed]`, **Then** `[Expected outcome]`  

Each test case is logged using the format below:  

### 📌 **Test Case Format**  

| **Test ID** | **User Story** | **Scenario (BDD Syntax)** | **Test Result** | **Tested By** | **Test Date** | **Comments** |
|------------|---------------|--------------------------|--------------|------------|------------|------------|
| TEST-XXX | `[User Story]` | **Given** `[Condition]`, **When** `[Scenario]`, **Then** `[Expected Behavior]` | `[Pass/Fail]` | `[Tester]` | `[YYYY-MM-DD]` | `[Notes]` |

---

## 🏗️ **Example: Smart Parking System QA Documentation**  

### 📌 Acceptance Criteria for User Story: "As a user, I want to make an online parking reservation so that I can secure a parking spot in advance."  

✅ **Acceptance Criteria:**  
1. Users must be able to select a parking lot and reserve a spot.  
2. The system should prevent double booking of a reserved spot.  
3. A confirmation email should be sent after successful booking.  

### 📌 Test Case: Booking a Parking Spot  

| **Test ID** | **User Story** | **Scenario (BDD Syntax)** | **Test Result** | **Tested By** | **Test Date** | **Comments** |
|------------|---------------|--------------------------|--------------|------------|------------|------------|
| TEST-101  | Online Booking | **Given** a parking spot is available, **When** a user selects the spot and confirms the reservation, **Then** the system should successfully book the spot and send a confirmation email. | ✅ Pass | @alex | 2025-02-28 | Verified confirmation email received |
| TEST-102  | Online Booking | **Given** a parking spot is already booked, **When** another user tries to reserve the same spot, **Then** the system should prevent the booking and show an error message. | ✅ Pass | @maria | 2025-02-28 | Error message displayed correctly |
| TEST-103  | Payment Gateway | **Given** a user has entered valid payment details, **When** they complete the transaction, **Then** a payment confirmation should be recorded in the database. | 🔄 In Progress | @james | 2025-03-01 | Awaiting API integration |

---

## 📌 **Ongoing QA Tracking**  

| **Test ID** | **Feature** | **Status** | **Last Updated** |
|------------|------------|------------|----------------|
| TEST-101  | Online Booking  | ✅ Pass  | 2025-02-28 |
| TEST-102  | Online Booking  | ✅ Pass  | 2025-02-28 |
| TEST-103  | Payment Gateway | 🔄 In Progress | 2025-03-01 |

---

## 📌 **Definition of Done (DoD) for Each Sprint**  

A feature is considered **Done** only when:  
1. All test cases for the feature pass successfully.  
2. The feature meets its **Acceptance Criteria**.  
3. Bugs identified in the sprint are **fixed and retested**.  
4. The deliverable is **approved in Sprint Review**.  

By following this structured **QA Strategy**, we ensure that each sprint delivers a **fully functional and thoroughly tested feature**, adhering to Scrum best practices. ✅  
