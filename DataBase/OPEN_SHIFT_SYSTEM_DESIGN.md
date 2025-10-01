# Open Shift System Design v2.0

## Overview
The open shift system has been completely redesigned to support a comprehensive workflow from open shift creation to regular shift assignment. This document outlines the new database structure and business logic.

## Database Tables

### 1. `open_shift` (Redesigned)
**Purpose**: Stores all information about open shifts, including shift details and open shift specific data.

**Key Fields**:
- `id`: Primary key (auto-increment)
- `start_ts`, `end_ts`: Shift timing (same as regular shift)
- `dept_id`, `location_id`: Department and location (same as regular shift)
- `payment_cents`: Payment amount in cents (e.g., $500 = 50000 cents)
- `status`: AVAILABLE, READY_TO_RUN, CANCELLED
- `created_at`: When this open shift was created
- `urgent_flag`: Boolean indicating if this is urgent
- `created_by`: Staff member who created this open shift

### 2. `open_shift_designation_requirements`
**Purpose**: Stores designation requirements for open shifts.

**Key Fields**:
- `open_shift_id`: Reference to open shift
- `designation_id`: Required designation (e.g., Nurse, Surgeon)
- `required_count`: How many people with this designation are needed
- If this table is empty for an open shift, anyone can apply

**Example**: An open shift needs 2 Nurses and 1 Surgeon:
```
open_shift_id=1, designation_id=5 (Nurse), required_count=2
open_shift_id=1, designation_id=3 (Surgeon), required_count=1
```

### 3. `open_shift_request`
**Purpose**: Stores staff applications for open shifts (similar to leave_request structure).

**Key Fields**:
- `open_shift_id`, `staff_id`: Application details
- `status`: PENDING, APPROVED, DECLINED, WITHDRAWN
- `message`: Optional message from applicant
- `reviewed_by`: Admin who reviewed the application
- `review_notes`: Admin's notes on the decision

### 4. `open_shift_assignment`
**Purpose**: Stores approved assignments for open shifts (temporary until shift creation).

**Key Fields**:
- `open_shift_id`, `staff_id`: Assignment details
- `assigned_by`: Admin who made this assignment
- `status`: ACTIVE, WITHDRAWN, CANCELLED
- `is_lead`: Boolean for lead role

## Business Logic Flow

### 1. Staff Application Process
1. **Staff applies** for an open shift
2. **System validates**:
   - Open shift status is not "CANCELLED"
   - Staff's designation matches requirements (if any)
   - No duplicate application exists
   - Staff is not already assigned to this open shift
3. **If valid**: Application saved to `open_shift_request` with status "PENDING"
4. **If invalid**: Application rejected with appropriate error message

### 2. Admin Review Process (Future Implementation)
1. **Admin reviews** pending applications
2. **Admin can**:
   - Approve application → Create record in `open_shift_assignment`
   - Decline application → Update status to "DECLINED"
   - Add review notes
3. **System updates** `open_shift_request` with admin decision

### 3. Open Shift to Regular Shift Conversion
When an open shift becomes "READY_TO_RUN" and admin approves:
1. **Create new record** in `shift` table with same details
2. **Move assignments** from `open_shift_assignment` to `shift_assignment`
3. **Delete** open shift and related records:
   - `open_shift`
   - `open_shift_designation_requirements`
   - `open_shift_request`
   - `open_shift_assignment`

### 4. Dynamic "Working With" Section
The open shift detail overlay shows:
- **Active assignments** from `open_shift_assignment` table
- **Real-time updates** as assignments are added/removed
- **Staff information** from related `staff` records

## Application Validation Rules

### Staff Can Apply If:
- Open shift status is "AVAILABLE"
- Staff designation matches requirements (or no requirements exist)
- No existing application for this staff/open shift combination
- Staff is not already assigned to this open shift

### Staff Cannot Apply If:
- Open shift status is "CANCELLED" or "READY_TO_RUN"
- Staff designation doesn't match requirements
- Duplicate application exists
- Staff already assigned to this open shift

## Admin Operations Interface (Future Scope)

### Required Admin Functions:
1. **Review Applications**: View pending applications with staff details
2. **Approve/Decline**: Make decisions on applications
3. **Create Assignments**: Manually assign staff to open shifts
4. **Manage Requirements**: Add/remove designation requirements
5. **Convert to Shift**: Convert approved open shift to regular shift
6. **Cancel Open Shifts**: Mark open shifts as cancelled
7. **View Analytics**: Application statistics, popular shifts, etc.

### Admin Dashboard Sections:
- Pending Applications Queue
- Open Shift Management
- Assignment Overview
- Conversion Workflow
- Reporting and Analytics

## Data Relationships

```
open_shift (1) ←→ (N) open_shift_designation_requirements
open_shift (1) ←→ (N) open_shift_request
open_shift (1) ←→ (N) open_shift_assignment
designation (1) ←→ (N) open_shift_designation_requirements
staff (1) ←→ (N) open_shift_request
staff (1) ←→ (N) open_shift_assignment
```

## Migration Notes

### From Old Schema:
- Old `open_shift` table used `shift_id` as primary key
- New design includes all shift information directly
- Old `extra_pay_cents` → New `payment_cents`
- Old `urgent_flag` (TINYINT) → New `urgent_flag` (BOOLEAN)

### Data Migration Required:
1. Migrate existing open shift data to new structure
2. Create designation requirements if needed
3. Archive or convert existing open shift assignments
4. Update application logic to use new validation rules

## Future Enhancements

1. **Notification System**: Email/SMS notifications for application status changes
2. **Auto-approval**: Automatic approval based on rules (e.g., same department)
3. **Bidding System**: Staff can bid different payment amounts
4. **Shift Templates**: Pre-defined open shift templates
5. **Analytics Dashboard**: Application trends, popular shifts, staff preferences
6. **Mobile Integration**: Push notifications for urgent shifts
7. **Integration APIs**: External system integration for admin operations
