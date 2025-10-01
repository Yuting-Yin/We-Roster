# Shift Type Definitions

## Overview

Shift types are determined by the **start time** of the shift, not when it ends. This allows for flexible scheduling while maintaining clear categorization.

## Shift Type Rules

### 1. AM (Morning Shifts)
- **Definition**: Shifts that START between **8:00 - 13:00**
- **Examples**:
  - 8:00 - 16:00 ✅ AM
  - 9:00 - 17:00 ✅ AM
  - 10:00 - 18:00 ✅ AM
  - 12:30 - 20:30 ✅ AM

### 2. PM (Afternoon/Evening Shifts)
- **Definition**: Shifts that START between **13:00 - 18:00**
- **Examples**:
  - 13:00 - 21:00 ✅ PM
  - 14:00 - 22:00 ✅ PM
  - 16:00 - 00:00 ✅ PM (ends midnight next day)
  - 17:30 - 01:30 ✅ PM

### 3. AH (After Hours Shifts)
- **Definition**: Shifts that START **outside** the range of 8:00 - 18:00
- **This includes**:
  - Night shifts starting after 18:00
  - Early morning shifts starting before 8:00
- **Examples**:
  - 22:00 - 06:00 ✅ AH (starts at 22:00)
  - 00:00 - 08:00 ✅ AH (starts at midnight)
  - 18:30 - 02:30 ✅ AH (starts at 18:30)
  - 06:00 - 14:00 ✅ AH (starts at 06:00)

### 4. ON_CALL (Standby Shifts)
- **Definition**: Standby shifts where staff is on-call
- **Special Notes**: 
  - Can start at any time
  - Explicitly marked as ON_CALL regardless of start time
  - Usually covers extended periods
- **Examples**:
  - 20:00 - 08:00 ✅ ON_CALL (overnight standby)
  - 18:00 - 06:00 ✅ ON_CALL
  - Any time period can be ON_CALL if designated as such

## Implementation

### Backend (DataInitializer.java)

The shift code is determined using the `determineShiftCode()` method:

```java
private String determineShiftCode(int startHour, boolean isOnCall) {
    if (isOnCall) {
        return "ON_CALL";
    } else if (startHour >= 8 && startHour < 13) {
        return "AM";
    } else if (startHour >= 13 && startHour < 18) {
        return "PM";
    } else {
        return "AH";
    }
}
```

### Current Test Data Shifts (Per Day)

Each day has 9 shifts across all departments:

#### AM Shifts (3)
- 8:00 - 16:00 (Emergency Department)
- 9:00 - 17:00 (ICU)
- 10:00 - 18:00 (Medical Ward)

#### PM Shifts (2)
- 14:00 - 22:00 (Emergency Department)
- 16:00 - 00:00 (ICU)

#### AH Shifts (3)
- 22:00 - 06:00 (Emergency Department)
- 00:00 - 08:00 (Medical Ward)
- 18:30 - 02:30 (ICU)

#### ON_CALL Shifts (1)
- 20:00 - 08:00 (Emergency Department - standby)

## Key Points

1. **Start Time Matters**: A shift starting at 16:00 and ending at midnight is classified as **PM**, not AH, because it starts within the PM range.

2. **Boundary Cases**: 
   - 13:00 start = PM (inclusive)
   - 18:00 start = AH (exclusive)
   - 8:00 start = AM (inclusive)

3. **ON_CALL Priority**: If a shift is explicitly marked as ON_CALL, it takes precedence over time-based classification.

4. **Overnight Shifts**: These are typically AH shifts as they start outside regular hours (8:00-18:00).

## Usage in Code

### Frontend (TypeScript)
```typescript
// Type definition
export type ShiftType = "AM" | "PM" | "AH" | "ON_CALL";

// The shift type is already determined by the backend
// Frontend just displays and filters based on the type
```

### Backend (Java)
```java
// Shift entity has a 'code' field that stores the shift type
Shift shift = Shift.builder()
    .startTs(date.atTime(14, 0))  // Starts at 14:00
    .endTs(date.atTime(22, 0))     // Ends at 22:00
    .code(determineShiftCode(14, false))  // Returns "PM"
    .build();
```

## Migration Notes

If you need to update existing shifts to follow the new definitions, run the data initializer to recreate all shifts with the correct classifications.

## Questions?

If you have questions about shift type classification, refer to this document or check the `determineShiftCode()` method in `DataInitializer.java`.


