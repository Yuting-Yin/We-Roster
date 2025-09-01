
**Sample test document**

✅ **Sample test case for user story: "As a manager, I want to get all leave requests\"**

- **Success**
  * AC-1: return code `200` and json body
  * AC-2: return code `200` and json body of staff in that department
  * AC-3: return code `403`, operation failed
- **TestCase-1**
  * When GET `/leave`, then return code 200, json body `[{id, firstName, lastName, ...}]`
- **TestCase-2**
  * When GET `/leave?deptId=10`
  * Return code `200` for all leave requests belonging to department `id = 10`
- **TestCase-3**
  * When GET with blocked token
  * Return code `403` to block the black listed user from operation

✅ **Sample test case for as a staff I want to get a list of all staff**
- **Success**
  * AC-1: return code `200`
  * AC-2: return code `404`
  * AC-3: return code `401`
- **TestCase-1: Standard getting list of staff**
  * When GET `/staff`
  * Then return code `200`, body `[{id, firstName, lastName, deptId}]`
- **TestCase-2: User mistake**
  * When the user puts in the wrong page
  * Then return code `404`, page not found
- **TestCase-3: User not authorized**
  * When GET without correct token
  * Return code `401`

✅ **Sample test case for user story "As a software engineer I want to get current logged-in user data"**

- **Success**
  * AC-1: returns `200` with account profile 
  * AC-2: invalid token, return code `401`
  * AC-3: User blocked, return code `403`
- **TestCase-1: Good path**
  * When get `/me`
  * Code 200 and response `{id, email, roles:[___], ...}` for a user
- **TestCase-2: Unauthorized**
  * When GET `/me` without token
  * Code 401
- **TestCase-3 Blocked account**
  * User a is blocked
  * When GET `\me`, return code 403

✅ **Sample test case for user story "As a doctor I want to verify my phone number"**

- **Success**
  * AC-1: Send, valid phone and return `200`/`202` code
  * AC-2: Bad input, return code `400`
  * Ac-3: Reached frequency limit, return code `429`
- **TestCase-1: send code**
  * Receive code `200` and json body `{status:"SENT"}`
- **TestCase-2: Bad input**
  * User puts in a invalid phone number
  * Return code `400`
- **TestCase-3: Frequency limit**
  * User requests for phone verification more frequent than threshold in a period of time
  * Return code `429`