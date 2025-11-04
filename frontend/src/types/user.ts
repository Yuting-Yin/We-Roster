// src/types/user.ts
export type User = {
  id: string;
  email: string;
  staffId?: number;  // Staff ID for matching with team members

  // Common name fields
  firstName?: string;
  lastName?: string;
  name?: string;         // full name
  given_name?: string;   // OIDC / Google style
  family_name?: string;  // OIDC / Google style

  avatarUrl?: string;

  // Business fields (may be returned with different names from backend)
  designation?: string;      // Job title / position
  title?: string;            // Some backends use title to represent job title
  accreditation?: string;    // Accreditation name
  accreditationName?: string;

  // Contact information (compatible with multiple naming conventions)
  phone?: string;
  mobile?: string;
  phoneNumber?: string;

  // iCal subscription URL (compatible with multiple naming conventions)
  ical?: string;
  icalUrl?: string;
  calendarIcsUrl?: string;

  // Other possible extension fields
  [k: string]: any;
};
