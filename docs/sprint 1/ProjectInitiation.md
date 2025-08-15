# Project Initiation — Option 2 (Mobile Refresh + Open Shifts)

## Project Overview
We will refresh the existing staff-facing mobile app and add **Open Shifts** capabilities. Staff will be able to (1) view unfilled shifts, (2) apply for them, (3) set their availability, (4) receive push notifications about outcomes, and (5) search/filter by date, type, location, etc. We will retain compatibility with the current backend and existing features (e.g., My Roster, Leave).

---

## Project Constraints

### 1. Time Constraints
- **Constraint:** The MVP (refreshed UI + open shift functionalities) must be delivered within 3 sprints.  
- **Justification:** Ensures core functionalities (view/apply for open shifts, set availability, push notifications, search & filter) are ready for early stakeholder review and testing before further enhancements.

### 2. Resource Constraints
- **Constraint:** Development team consists of limited members with split responsibilities (frontend, backend, QA).  
- **Justification:** Requires prioritisation of must-have features to avoid scope creep and ensure quality.

### 3. Technical Constraints
- **Constraint:** Must integrate with the existing mobile app architecture and backend systems without breaking current functionality.  
- **Justification:** Large-scale code refactoring could exceed time limits; maintaining backwards compatibility reduces risk.

### 4. Budget Constraints
- **Constraint:** No additional budget for new paid third-party services unless approved by stakeholders.  
- **Justification:** Encourages use of existing tools, APIs, and frameworks; avoids recurring costs for push notifications or filtering logic.

### 5. Regulatory Constraints
- **Constraint:** All user data handling (availability, shift preferences) must comply with applicable privacy laws and employment regulations.  
- **Justification:** Avoids legal risks and ensures staff trust in the platform.

### 6. Design & UX Constraints
- **Constraint:** Must follow the client’s branding and keep UX consistent across iOS and Android.  
- **Justification:** Prevents user confusion, supports brand consistency, and eases adoption by current staff.

### 7. Deployment Constraints
- **Constraint:** Store submissions (Google Play / App Store) must be scheduled, accounting for review/approval delays.  
- **Justification:** Store review times can delay release; planning prevents missed MVP deadlines.

### 8. Testing Constraints
- **Constraint:** Use anonymised/test data during development and QA.  
- **Justification:** Meets privacy requirements and prevents accidental data exposure.

### 9. Integration Constraints
- **Constraint:** Push notifications must operate within existing service limits (e.g., FCM quotas).  
- **Justification:** Avoids delivery failures and performance issues.

### 10. Stakeholder Availability Constraints
- **Constraint:** Client decision-makers may only review at sprint boundaries.  
- **Justification:** Requires well-prepared demos and clear documentation to avoid feedback bottlenecks.

---

## Project Assumptions

1. **Timely Stakeholder Feedback**  
   Stakeholders will review UI/UX prototypes and sprint deliverables within **2 business days**, enabling fast iteration.

2. **Accurate & Current API Documentation**  
   Backend API docs are complete and up to date, reducing rework during integration.

3. **Functional Push Notification Service**  
   Firebase Cloud Messaging (or equivalent) is already configured and tested in the current app.

4. **Predefined Staff Role Permissions**  
   Existing RBAC (staff/manager/admin) remains valid and does not require redesign.

5. **Stable Build & Deployment Pipelines**  
   CI/CD for Android and iOS is reliable and supports frequent releases during sprints.

6. **Device & OS Compatibility**  
   The refreshed UI/features will support all devices and OS versions currently supported by the app.

7. **Backend Performance Capacity**  
   Existing infrastructure can handle added open-shift search/filter traffic and notification volume without degradation.

8. **No Major Policy Changes**  
   Employment/rostering policies (e.g., eligibility to apply for open shifts) will not change during the project timeline.

---

## Traceability
- **Owner:** Dev Environment Lead (Quan Yu)
- **Last updated:** _<16/08/2025>_
