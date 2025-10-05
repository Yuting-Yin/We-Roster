import { ShiftType, EventItem, ShiftSlot, Coworker } from "@/types/roster";
import { dayKey } from "./date";

export type ShiftAssignment = {
	id: string;
	date: string; // YYYY-MM-DD
	type: ShiftSlot;
	start: string;
	end: string;
	location: string; // e.g., "PMCC Theatre 1" or "PMCC Ward A"
	designation: string;
	teammates?: number; // excludes current user
	coworkers?: Coworker[];
	color?: string;
};

const SLOT_BLUEPRINTS: Array<{
	type: ShiftSlot;
	title: string;
	start: string;
	end: string;
}> = [
	{ type: "AM", title: "AM shift", start: "08:00", end: "13:00" },
	{ type: "PM", title: "PM shift", start: "13:00", end: "18:00" },
	{ type: "AH", title: "After-hours shift", start: "18:00", end: "21:00" },
	{ type: "ON_CALL", title: "On-call duty", start: "09:00", end: "21:00" },
];

const DEFAULT_COWORKERS: Record<ShiftSlot, Coworker[]> = {
	AM: [
		{ id: 'cw-am-1', name: 'Thu Vo', initials: 'TV' },
		{ id: 'cw-am-2', name: 'Jill C.', initials: 'JC' },
	],
	PM: [
		{ id: 'cw-pm-1', name: 'Pristine R.', initials: 'PR' },
		{ id: 'cw-pm-2', name: 'Leo W.', initials: 'LW' },
	],
	AH: [
		{ id: 'cw-ah-1', name: 'Cody H.', initials: 'CH' },
		{ id: 'cw-ah-2', name: 'Sarah B.', initials: 'SB' },
	],
	ON_CALL: [
		{ id: 'cw-oc-1', name: 'Support Team', initials: 'ST' },
	],
};

// Map campus to physical address
const CAMPUS_ADDRESS: Record<string, string> = {
	PMCC: '305 Grattan St, Melbourne VIC 3000, Australia',
	PMC: '300 Grattan St, Melbourne VIC 3000, Australia',
	"PMCC Campus": '305 Grattan St, Melbourne VIC 3000, Australia',
};

// Pool for generating placeholder coworkers so counts match teammates
const NAME_POOL: Array<{ name: string; initials: string }> = [
	{ name: 'Alex Kim', initials: 'AK' },
	{ name: 'Morgan Lee', initials: 'ML' },
	{ name: 'Sam Patel', initials: 'SP' },
	{ name: 'Riley Chen', initials: 'RC' },
	{ name: 'Taylor Nguyen', initials: 'TN' },
	{ name: 'Jordan Smith', initials: 'JS' },
	{ name: 'Casey Brown', initials: 'CB' },
	{ name: 'Jamie Park', initials: 'JP' },
	{ name: 'Drew Adams', initials: 'DA' },
	{ name: 'Quinn Davis', initials: 'QD' },
];

// Ensures coworker array matches the desired count by slicing/padding with generated placeholders
function resizeCoworkers(base: Coworker[], desired: number, slot: ShiftSlot): Coworker[] {
	if (!Number.isFinite(desired) || desired < 0) return base;
	let list = base.slice(0, Math.max(0, desired));
	if (list.length === desired) return list;
	let seed = 0;
	while (list.length < desired) {
		const pool = NAME_POOL[(seed + list.length) % NAME_POOL.length];
		list.push({
			id: `cw-${slot.toLowerCase()}-gen-${list.length + 1}`,
			name: pool.name,
			initials: pool.initials,
		});
	}
	return list;
}

// Parse a combined location string like "PMCC Theatre 1" into campus + room
function parseCampusAndRoom(location: string): { campus?: string; room?: string } {
	if (!location) return {};
	const parts = location.split(/\s+/);
	if (parts.length === 0) return {};
	const first = parts[0];
	// Heuristic: campus tokens are typically alphabetic acronyms like PMCC/PMC
	if (/^[A-Za-z]+$/.test(first) && first.length >= 3) {
		return { campus: first, room: parts.slice(1).join(' ').trim() || undefined };
	}
	// Fallback: treat everything before first number as campus word(s)
	const idx = parts.findIndex(p => /\d/.test(p));
	if (idx > 0) {
		return { campus: parts.slice(0, idx).join(' '), room: parts.slice(idx).join(' ') };
	}
	return { room: location };
}

// Build relative demo assignments for current Monday through Friday
function startOfWeekMon(d: Date): Date {
	const r = new Date(d);
	const day = r.getDay();
	const diff = day === 0 ? -6 : 1 - day;
	r.setDate(r.getDate() + diff);
	r.setHours(0, 0, 0, 0);
	return r;
}


function relativeAssignmentsToday(): ShiftAssignment[] {
	const mon = startOfWeekMon(new Date());
	const tue = new Date(mon); tue.setDate(mon.getDate() + 1);
	const wed = new Date(mon); wed.setDate(mon.getDate() + 2);
	const thu = new Date(mon); thu.setDate(mon.getDate() + 3);
	const fri = new Date(mon); fri.setDate(mon.getDate() + 4);

	return [
		// Monday: AM + PM at PMCC Theatre 2
		{ id: `shift-${dayKey(mon)}-am`, date: dayKey(mon), type: "AM", start: "08:00", end: "13:00", location: "PMCC Theatre 2", designation: "Anaes Coordinator", teammates: 3 },
		{ id: `shift-${dayKey(mon)}-pm`, date: dayKey(mon), type: "PM", start: "13:00", end: "18:00", location: "PMCC Theatre 2", designation: "Anaes Coordinator", teammates: 2 },

		// Tuesday: AM + PM at PMCC Ward A
		{ id: `shift-${dayKey(tue)}-am`, date: dayKey(tue), type: "AM", start: "08:30", end: "13:30", location: "PMCC Ward A", designation: "Anaes Lead", teammates: 4 },
		{ id: `shift-${dayKey(tue)}-pm`, date: dayKey(tue), type: "PM", start: "13:30", end: "18:00", location: "PMCC Ward A", designation: "Anaes Lead", teammates: 3 },

		// Wednesday: ON_CALL at PMCC Campus
		{ id: `shift-${dayKey(wed)}-oncall`, date: dayKey(wed), type: "ON_CALL", start: "09:00", end: "21:00", location: "PMCC Campus", designation: "On-call Anaesthetist", teammates: 5 },

		// Thursday: AM + PM at PMC Theatre 1
		{ id: `shift-${dayKey(thu)}-am`, date: dayKey(thu), type: "AM", start: "08:15", end: "13:15", location: "PMC Theatre 1", designation: "Anaes Coordinator", teammates: 2 },
		{ id: `shift-${dayKey(thu)}-pm`, date: dayKey(thu), type: "PM", start: "13:15", end: "18:15", location: "PMC Theatre 1", designation: "Anaes Coordinator", teammates: 2 },

		// Friday: AM + AH at Procedure Suite
		{ id: `shift-${dayKey(fri)}-am`, date: dayKey(fri), type: "AM", start: "08:00", end: "13:00", location: "Procedure Suite", designation: "Anaes Support", teammates: 1 },
		{ id: `shift-${dayKey(fri)}-ah`, date: dayKey(fri), type: "AH", start: "18:00", end: "21:00", location: "Procedure Suite", designation: "After-hours Cover", teammates: 3 },
	];
}


const SLOT_LABEL: Record<ShiftSlot, string> = {
	AM: "AM shift",
	PM: "PM shift",
	AH: "After-hours shift",
	ON_CALL: "On-call duty",
};

function initialsOf(fullName: string): string {
	const parts = fullName.trim().split(/\s+/);
	if (!parts.length) return "??";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function clone(assignments: ShiftAssignment[]): ShiftAssignment[] {
	return assignments.map((assignment) => ({ ...assignment }));
}

function blueprintFor(type: ShiftSlot) {
	return SLOT_BLUEPRINTS.find((slot) => slot.type === type)!;
}

function groupByDate(assignments: ShiftAssignment[]): Record<string, ShiftAssignment[]> {
	return assignments.reduce<Record<string, ShiftAssignment[]>>((acc, assignment) => {
		if (!acc[assignment.date]) acc[assignment.date] = [];
		acc[assignment.date].push(assignment);
		return acc;
	}, {});
}

function teammatesLabel(count?: number) {
	if (typeof count !== "number") return undefined;
	if (count <= 0) return "Working solo";
	const label = count === 1 ? "staff member" : "staff members";
	return `Working with ${count} ${label}`;
}

function assignmentToEvent(assignment: ShiftAssignment): EventItem {
	const blueprint = blueprintFor(assignment.type);
	const baseCoworkers = assignment.coworkers ?? DEFAULT_COWORKERS[assignment.type] ?? [];
	// Prefer explicit teammates (already excludes current user); fallback to base coworker count
	const teammateCount = typeof assignment.teammates === 'number' ? assignment.teammates : (baseCoworkers.length || undefined);
	const sizedCoworkers = typeof teammateCount === 'number' ? resizeCoworkers(baseCoworkers, teammateCount, assignment.type) : baseCoworkers;

	const { campus, room } = parseCampusAndRoom(assignment.location);
	const campusAddress = campus ? CAMPUS_ADDRESS[campus] : undefined;

	return {
		id: assignment.id,
		title: SLOT_LABEL[assignment.type],
		location: assignment.location, // legacy combined
		role: assignment.designation,
		teammates: teammatesLabel(teammateCount),
		coworkers: sizedCoworkers.map((person) => ({
			id: String(person.id),
			name: person.name,
			initials: person.initials ?? initialsOf(person.name),
		})),
		start: assignment.start ?? blueprint.start,
		end: assignment.end ?? blueprint.end,
		color: assignment.color,
		action: "arrow",
		type: assignment.type,
		campus,
		room,
		campusAddress,
		shiftName: assignment.shiftName,
	};
}

function placeholderEvent(dateKey: string, type: ShiftSlot): EventItem {
	const blueprint = blueprintFor(type);
	return {
		id: `${dateKey}-${type.toLowerCase()}-open`,
		title: `Request ${blueprint.title}`,
		location: "Unassigned",
		start: blueprint.start,
		end: blueprint.end,
		action: "plus",
		type: type,
	};
}

function buildEventsFromGroup(dateKey: string, grouped: Record<string, ShiftAssignment[]>): EventItem[] {
	const dayAssignments = grouped[dateKey] ?? [];
	if (!dayAssignments.length) {
		return ["AM", "PM"].map((type) => placeholderEvent(dateKey, type as ShiftSlot));
	}

	const hasOnCall = dayAssignments.some((item) => item.type === "ON_CALL");
	if (hasOnCall) {
		return dayAssignments
			.filter((item) => item.type === "ON_CALL")
			.sort((a, b) => a.start.localeCompare(b.start))
			.map(assignmentToEvent);
	}

	const events: EventItem[] = [];
	for (const slot of SLOT_BLUEPRINTS.filter((s) => s.type !== "ON_CALL")) {
		const assignment = dayAssignments.find((item) => item.type === slot.type);
		if (assignment) {
			events.push(assignmentToEvent(assignment));
		} else if (slot.type !== "AH") {
			events.push(placeholderEvent(dateKey, slot.type));
		}
	}

	return events.sort((a, b) => a.start.localeCompare(b.start));
}

export function makeDemoAssignments(): ShiftAssignment[] {
	return clone(relativeAssignmentsToday());
}

export function makeDemoShiftMap(assignments: ShiftAssignment[] = makeDemoAssignments()): Record<string, ShiftType> {
	const grouped = groupByDate(assignments);
	const map: Record<string, ShiftType> = {};

	for (const [date, items] of Object.entries(grouped)) {
		const types = new Set<ShiftSlot>(items.map((item) => item.type));
		let shift: ShiftType;

		if (types.has("ON_CALL")) {
			shift = "ON_CALL";
		} else if (types.has("AH")) {
			shift = "AH";
		} else if (types.has("AM") && types.has("PM")) {
			shift = "AM"; // Use AM as primary when both shifts exist
		} else if (types.has("AM")) {
			shift = "AM";
		} else if (types.has("PM")) {
			shift = "PM";
		} else {
			shift = "AM"; // Default fallback
		}

		map[date] = shift;
	}

	return map;
}

export function buildEventsFor(date: Date, assignments: ShiftAssignment[] = makeDemoAssignments()): EventItem[] {
	const grouped = groupByDate(assignments);
	return buildEventsFromGroup(dayKey(date), grouped);
}

export function buildEventsMap(assignments: ShiftAssignment[] = makeDemoAssignments()): Record<string, EventItem[]> {
	const grouped = groupByDate(assignments);
	const events: Record<string, EventItem[]> = {};

	for (const key of Object.keys(grouped)) {
		events[key] = buildEventsFromGroup(key, grouped);
	}

	return events;
}

// Mock function to resolve a user's shift for swap testing
// u001 -> PMCC Theatre 3; u003 -> PMC Theatre 1; u004 -> Procedure Suite; others unallocated
export function getMockShiftForUser(userId: string, date: Date, slot?: { start: string; end: string }): EventItem | null {
	const dateKey = dayKey(date);
	const start = slot?.start ?? "08:00";
	const end = slot?.end ?? "13:00";

	let location: string | null = null;
	let designation = "Anaes Support";

	switch (userId) {
		case "u001":
			location = "PMCC Theatre 3";
			break;
		case "u003":
			location = "PMC Theatre 1";
			designation = "Anaes Coordinator";
			break;
		case "u004":
			location = "Procedure Suite";
			designation = "After-hours Cover";
			break;
		default:
			location = null; // unallocated for this interval
	}

	if (!location) return null;

	const { campus, room } = parseCampusAndRoom(location);

	return {
		id: `user-${userId}-${dateKey}-${start}-${end}`,
		title: `${start}-${end}`,
		location,
		role: designation,
		start,
		end,
		action: "arrow",
		campus,
		room,
	};
}



