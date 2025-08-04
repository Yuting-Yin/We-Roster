# 🚀 Risk Management and Risk Register

This document identifies potential risks associated with the **Smart Parking System** project, along with mitigation strategies to ensure smooth project execution. Each risk is assessed based on **probability**, **impact**, and **exposure**.
You will document this section and checklist based on the Risk Management Strategies discussed previously in your tutorials.

---

## 🏆 **Risk Assessment Framework**  

Each identified risk includes the following details:  

- **Risk Statement:** Description of the risk, structured as:  
  **Action → Consequence → Impact**  
- **Probability:** Likelihood of occurrence (0-99.9%). It it sufficient for teams to assess the Probability of the risk in multiples of 10 for each risk identified for brevity. (Ex: 10%, 20% etc)  
- **Impact:** Severity if the risk materializes (scale of 0-10)  
- **Exposure:** Probability × Impact  
- **Response Strategy:** Approach to handle the risk (Accept / Ignore / Mitigate / Avoid).

Should the Risk Reponse Strategy is "Accept", document a contingency plan for the risk. Else a risk that you choose to "Accept" is no different from "Ignoring" this risk

---

## ✅ **Risk Log Template**  

Use the following format to document project risks:

### 📌 Risk ID: XXX  

**Risk Statement:** _[Action → Consequence → Impact]_  
- **Probability:** XX.X%  
- **Impact:** X (0-10 scale)  
- **Exposure:** Probability × Impact  
- **Mitigation Strategy:** [Accept / Ignore / Mitigate / Avoid]  
- **Mitigation Plan:** _[Detailed approach]_  

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

---

## 📌 **Ongoing Risk Tracking**  

| **Risk ID** | **Risk Statement (Summary)**                     | **Probability (%)** | **Impact (0-10)** | **Exposure** | **Mitigation Strategy** |
|------------|--------------------------------------------------|---------------------|------------------|-------------|---------------------|
| 101        | Delayed API key approval impacts payment testing | 70.0%               | 8                | 5.6         | Mitigate 🟡         |
| 102        | IoT sensors may not be compatible with the app  | 50.0%               | 7                | 3.5         | Accept 🟢            |
| 103        | Hosting server downtime affects deployments     | 40.0%               | 6                | 2.4         | Avoid 🔴             |

---

## 📌 **Legend for Mitigation Strategies**  

- **Accept** 🟢 → Acknowledge the risk but take no preventive action.  
- **Ignore** 🔵 → Considered low priority with minimal impact.  
- **Mitigate** 🟡 → Take action to reduce probability or impact.  
- **Avoid** 🔴 → Change project approach to eliminate the risk.  
