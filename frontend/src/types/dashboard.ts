// =============================================
// src/types/dashboard.ts
// Shared types used across Dashboard screen and API responses
// =============================================


export type DutyItem = {
id: string;
initials: string;
name: string;
role: string;
theatre: string;
site: string;
time: string;
date: string; // e.g., "Tue. 12 May"
urgent?: boolean;
};


export type ShiftItem = {
id: string;
date: string; // e.g., "Wed, 14 May"
time: string; // "13:00 - 18:00"
site: string;
dept: string;
teammates?: string; // "Working with 3 others"
bonus?: string; // "+$500"
urgent?: boolean;
};


export type LeaveItem = {
id: string;
date: string;
type: "Half-day" | "Full-day";
category: string;
state: "Approved" | "Awaiting" | "Declined";
};


export type DashboardPayload = {
duty: DutyItem[];
myShifts: ShiftItem[];
openShifts: ShiftItem[];
leaves: LeaveItem[];
};