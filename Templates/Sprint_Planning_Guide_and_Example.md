# 🚀 Sprint Planning

## Overview
Sprint Planning is a key Scrum ceremony where the team selects and commits to user stories for the upcoming sprint. The team collaboratively defines the Sprint Goal, estimates effort using story points, and creates a Sprint Backlog.

## Steps in Sprint Planning
1. **Review the Product Backlog**: The Product Owner presents prioritized user stories.
2. **Define Sprint Goal**: The team sets a clear, achievable objective.
3. **Select User Stories**: The team pulls stories from the backlog that align with the Sprint Goal.
4. **Estimate Effort**: The team assigns story points using the Fibonacci sequence (1, 2, 3, 5, 8, 13, etc.). Teams also use other popular estimation techniques such as T-Shirt Sizing, Planning Pocker, or the Bucket System.
5. **Break Down Stories into Tasks**: Identify subtasks and assign responsibilities.
6. **Finalize Sprint Backlog**: The team commits to completing selected stories.

### Controlled Scrum Execution in SWEN90016

In SWEN90016, Scrum is executed as a **Controlled Process**, ensuring that all teams focus on understanding and implementing Scrum SDLC processes effectively. As part of this structured approach, predefined Sprint outcomes are established at the beginning of the project. Consequently, all teams work toward delivering the same set of user stories for each Sprint.
Due to this controlled nature, certain typical Sprint Planning activities such as "Reviewing the Product Backlog," "Defining the Sprint Goal," and "Selecting the User Stories" may not be applicable in the actual sense. However, teams will still be responsible for essential Sprint Planning tasks such as **effort estimation** and **breaking down user stories into tasks**.

## Estimation Guidelines for New Teams
- **Consensus-Based Estimation**: Use techniques like Planning Poker to encourage team discussion.
- **Compare with Similar Stories**: If a similar story was previously completed, use it as a benchmark.
- **Account for Complexity, Risk, and Uncertainty**: Higher risk or unknowns mean higher story points.
- **Recalibrate Over Time**: Track team velocity and refine estimates in future sprints.
- **Avoid Overcommitment**: Teams new to Scrum often overestimate capacity; start conservatively.
- **Use Relative Estimation:** Compare the complexity of the new story to a well-understood baseline story.
- **Fibonacci Sequence for Estimation:** Use values like **1, 2, 3, 5, 8, 13, 21**. Note that larger gaps between the values reflect increasing uncertainty in complexity.
-  **Consider Different Complexity Factors:**
   - Technical difficulty (e.g., integrations, security requirements).
   - Amount of new learning required.
   - Dependencies on other components.
   - Expected testing effort.
 - **Ensure Team Consensus:** Estimation is a team activity—discuss each story and agree collectively on the assigned points.
 - **Adjust Over Time:** As the team gains experience, estimation accuracy will improve. Regular retrospectives at the end of each Sprint will help teams refine this process.

### User Story Estimation: Establishing a Baseline

Since student teams do not have user stories from past iterations to serve as a benchmark (and also considering the short duration of the assignment project), they can establish a **baseline user story** to guide their estimation process. A baseline user story is a simple, well-understood task that the team collectively agrees upon in terms of complexity and effort. Once established, this baseline helps in comparing and estimating the effort required for other user stories.

### Baseline User Story Example

**User Story:** As a registered user, I want to log into the system using my email and password so that I can access my dashboard.

- **Estimated Story Points:** 5 (Fibonacci sequence)
- **Rationale:** This task involves authentication logic, form validation, and a database lookup, making it moderately complex.

### Estimating Another User Story Using the Baseline

**User Story:** As a security-conscious user, I want to enable two-factor authentication (2FA) so that my account remains protected from unauthorized access.

- **Relative Complexity Comparison:**
  - This task involves an additional layer of security, including sending and verifying a one-time password (OTP) via email or SMS.
  - More backend logic is required compared to simple login.
  - The UI will need modifications to allow users to configure 2FA settings.
  - Additional API integration is required for OTP services.

- **Estimated Story Points:** 8 (Fibonacci sequence)
- **Rationale:** This story is more complex than a basic login because it requires additional security mechanisms, API interactions, and user experience considerations. Given that our baseline login story was estimated at **5 story points**, this story is estimated at **8 story points**, indicating higher complexity but still achievable within a Sprint.

# Example: Sprint Planning for "Smart Parking System"

## Sprint Goal
Implement user authentication and basic parking slot booking functionality.

## Selected User Story
### User Story: Login and Registration (Authentication)
**As a** new user, **I want to** register and log in securely, **so that** I can access the parking system.

### Acceptance Criteria:
- Users can sign up with email and password.
- Users receive a verification email before activating their account.
- Registered users can log in securely using encrypted credentials.

### Estimation using Fibonacci Sequence
| Factor              | Consideration |
|---------------------|--------------|
| Complexity         | Moderate - Need email verification and encryption. |
| Uncertainty        | Low - Authentication is a common feature. |
| Dependencies      | Medium - Relies on an email service API. |
| Risk              | Medium - Security considerations. |
| Estimated Story Points | **5** (based on team discussion) |

## Sprint Backlog Tasks
| Task | Assigned To | Estimated Hours |
|------|------------|----------------|
| Design authentication database schema | Dev A | 4 |
| Implement user registration & validation | Dev B | 6 |
| Integrate email verification system | Dev C | 5 |
| Develop login functionality | Dev D | 6 |
| Write unit tests for authentication | Dev E | 4 |

## Commitment
The team commits to completing the authentication feature by the end of the sprint.

Once the estimates are finalized and the user stories are broken down into tasks, the team transfers them to the actual Sprint Backlog. This ensures that all planned work for the sprint is well-documented and ready for execution. The Sprint Backlog will include detailed task breakdowns, assigned owners, and estimated effort, as demonstrated in the **Sprint_Backlog_Guide_and_Example.md**.
