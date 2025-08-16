- **Risk Statement:** Description of the risk, structured as:  
  **Action → Consequence → Impact**  
- **Probability:** Likelihood of occurrence (0-99.9%). It it sufficient for teams to assess the Probability of the risk in multiples of 10 for each risk identified for brevity. (Ex: 10%, 20% etc)  
- **Impact:** Severity if the risk materializes (scale of 0-10)  
- **Exposure:** Probability × Impact  
- **Response Strategy:** Approach to handle the risk (Accept / Ignore / Mitigate / Avoid).

Should the Risk Reponse Strategy is "Accept", document a contingency plan for the risk. Else a risk that you choose to "Accept" is no different from "Ignoring" this risk

---

### 📌 Risk ID: 001

**Risk Statement:** _[Ambiguous functional requirements - not enough detail covered in project - Project delivery delayed]_  
- **Probability:** 70.0%  
- **Impact:**  9 (0-10 scale)  
- **Exposure:** 6.3
- **Mitigation Strategy:** [Mitigate]  
- **Mitigation Plan:** _[Book session with client for clarification. Document assumptions and search up similar products.]_  

---

### 📌 Risk ID: 002

**Risk Statement:** _[Group members not familiar with technical stacks used - Encountering difficulties with technologies - slower progress - not enough detail covered in project - Project delivery delayed]_  
- **Probability:** 40.0%  
- **Impact:**  10 (0-10 scale)  
- **Exposure:** 4
- **Mitigation Strategy:** [Mitigate]  
- **Mitigation Plan:** _[Learn unfamiliar technologies early. Change to simpler technology if possible, or study the core of technology]_  

---

### 📌 Risk ID: 003

**Risk Statement:** _[Difficulties in planning without a clear deadline - Workload not distributed evenly throughout the semester - possible delay of product delivery]_  
- **Probability:** 40.0%  
- **Impact:**  4 (0-10 scale)  
- **Exposure:** 1.6
- **Mitigation Strategy:** [Avoid]  
- **Mitigation Plan:** _[Set internal checkpoints. Immediately begin setting checkpoints or deliver prototype that meets basic requirements]_  

---

### 📌 Risk ID: 004

**Risk Statement:** _[Sudden illness of team member - Missing member to take workload - Disorganization in workload distribution]_  
- **Probability:** 10.0%  
- **Impact:**  3 (0-10 scale)  
- **Exposure:** 0.3
- **Mitigation Strategy:** [Accept]  
- **Mitigation Plan:** _[Document tasks assigned to specific member. Communicate and split the task within the team.]_  

---

### 📌 Risk ID: 005

**Risk Statement:** _[Unexpected bug that affects the sprint deliverable - Spending too much time fixing the bug - Delayed project delivery]_  
- **Probability:** 10.0%  
- **Impact:**  2 (0-10 scale)  
- **Exposure:** 0.2
- **Mitigation Strategy:** [Ignore]  
- **Mitigation Plan:** _[Run frequent and generalized tests. Use the previous commit.]_  

---



## 🏗️ **Example: Smart Parking System Risk Documentation**  

### 📌 Risk ID: 101  

**Risk Statement:**  
_"Delayed API key approval from the payment provider → Payment integration cannot be tested on time → Project delivery is delayed."_  

- **Probability:** 70.0%  
- **Impact:** 8  
- **Exposure:** 70.0% × 8 = **5.6**  
- **Mitigation Strategy:** **Mitigate**  
- **Mitigation Plan:**  
  - Follow up with the provider at the beginning of Sprint 1.  
  - Use a mock API for early testing to ensure system compatibility.  
  - Escalate the issue if API keys are not received within a week.  


## 📌 **Ongoing Risk Tracking**  

| **Risk ID** | **Risk Statement (Summary)**                     | **Probability (%)** | **Impact (0-10)** | **Exposure** | **Mitigation Strategy** |
|------------|--------------------------------------------------|---------------------|------------------|-------------|---------------------|
| 001        | Ambiguouys Functional Requirements | 70.0%               | 9                | 6.3         | Mitigate 🟡         |
| 002        | Delay due to unfamilar technical stacks  | 40.0%               | 10                | 4        | Mitigate 🟡         |
| 003        | Difficulties in planning without a clear deadline    | 40.0%               | 4                | 1.6         | Avoid 🔴             |
| 004        | Sudden illness of team member | 10.0%               | 3                | 0.3         | Accept 🟢    |
| 005        | Unexpected bug that affects the sprint deliverable  | 10.0%              | 2                | 0.2        | Ignore 🔵       |
---

## 📌 **Legend for Mitigation Strategies**  

- **Accept** 🟢 → Acknowledge the risk but take no preventive action.  
- **Ignore** 🔵 → Considered low priority with minimal impact.  
- **Mitigate** 🟡 → Take action to reduce probability or impact.  
- **Avoid** 🔴 → Change project approach to eliminate the risk.  