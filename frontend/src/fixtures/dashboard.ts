import type { DashboardPayload } from "@/types/dashboard";

export const dashboardFixtures: DashboardPayload = {
  duty: [
    { id: "d1", initials: "TV", name: "Thu Vo", role: "Anaes Coordinator", theatre: "Theatre 1", site: "PMCC", time: "08:00 - 13:00", date: "Tue. 12 May" },
    { id: "d2", initials: "MJ", name: "Min Ji", role: "Anaes Coordinator", theatre: "—", site: "PMCC", time: "—", date: "Tue. 12 May", urgent: true },
  ],
  myShifts: [
    { id: "s1", date: "Wed, 14 May", time: "13:00 - 18:00", site: "PMCC", dept: "Anaes Coordinator", teammates: "Working with 3 others" },
    { id: "s2", date: "Thu, 15 May", time: "08:00 - 12:00", site: "PMCC", dept: "Anaes Coordinator", teammates: "Working with 3 others" },
  ],
  openShifts: [
    { id: "o1", date: "Fri, 16 May", time: "8:00 - 12:00", site: "PMCC", dept: "Neurosurgery", bonus: "+$500", urgent: true },
    { id: "o2", date: "Fri, 16 May", time: "8:00 - 12:00", site: "PMCC", dept: "Neurosurgery", bonus: "+$500" },
    { id: "o3", date: "Fri, 16 May", time: "8:00 - 12:00", site: "PMCC", dept: "Neurosurgery", bonus: "+$500", urgent: true },
  ],
  leaves: [], // Not used - real leave data comes from useMyLeaves hook
};

// Amplify fixtures for testing layout with more data
export function amplifyFixtures(times = 1): DashboardPayload {
  if (times <= 1) return dashboardFixtures;
  
  const duplicate = <T extends { id: string }>(arr: T[]) =>
    Array.from({ length: times }, (_, k) =>
      arr.map((x, i) => ({ ...x, id: `${x.id}-${k}-${i}` }))
    ).flat();
    
  return {
    duty: duplicate(dashboardFixtures.duty),
    myShifts: duplicate(dashboardFixtures.myShifts),
    openShifts: duplicate(dashboardFixtures.openShifts),
    leaves: [], // Always empty - real leave data comes from useMyLeaves hook
  };
}
