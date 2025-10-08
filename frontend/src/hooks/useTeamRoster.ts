import { useState, useEffect, useCallback } from "react";
import { getTeamRoster, getTeamRosterFilterOptions, type TeamRosterResponse, type TeamRosterFilterOptions } from "@/api/teamroster";

type Options = {
  mock?: boolean;
  delayMs?: number;
};

export function useTeamRosterData(date: Date, opts: Options = {}) {
  const envMock = process.env.EXPO_PUBLIC_MOCK_ROSTER === "1";
  const useMock = opts.mock ?? envMock;
  const delayMs = opts.delayMs ?? 300;

  const [data, setData] = useState<TeamRosterResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastLoadedDate, setLastLoadedDate] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const dateString = date.toISOString().split('T')[0];
    
    // Skip loading if we already have data for this date
    if (lastLoadedDate === dateString && data) {
      return;
    }
    
    if (useMock) {
      setLoading(true);
      setError(null);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
      // Mock data - replace with actual data loading
      const mockData: TeamRosterResponse = {
        date: date.toISOString().split('T')[0],
        tables: [
          {
            hospital: "PMCC",
            rooms: ["On Call", "Theatre 1", "Theatre 2", "Theatre 3"],
            cells: [
              // On Call row
              {
                room: "On Call",
                shiftType: "ON_CALL",
                shifts: [
                  {
                    id: "1",
                    shiftName: "[OC]Cardiac Call",
                    startTime: "08:00",
                    endTime: "18:00",
                    assignedStaff: [{ id: "1", name: "P Pillai", initials: "PP", designation: "Cardiologist" }]
                  },
                  {
                    id: "2",
                    shiftName: "[OC]Cardiac-Liver PFY",
                    startTime: "08:00",
                    endTime: "18:00",
                    assignedStaff: [{ id: "2", name: "A Jothin", initials: "AJ", designation: "Fellow" }]
                  },
                  {
                    id: "3",
                    shiftName: "[OC]Duty PFY",
                    startTime: "08:00",
                    endTime: "18:00",
                    assignedStaff: [{ id: "3", name: "N Luey", initials: "NL", designation: "Fellow" }]
                  }
                ]
              },
              // Theatre 1 - AM
              {
                room: "Theatre 1",
                shiftType: "AM",
                shifts: [{
                  id: "4",
                  shiftName: "Emergency PFY",
                  startTime: "08:00",
                  endTime: "13:00",
                  assignedStaff: [
                    { id: "4", name: "G Davis", initials: "GD", designation: "Surgeon" },
                    { id: "5", name: "J Graham", initials: "JG", designation: "Anesthetist" },
                    { id: "6", name: "A Hughes", initials: "AH", designation: "Nurse" }
                  ]
                }]
              },
              // Theatre 1 - PM
              {
                room: "Theatre 1",
                shiftType: "PM",
                shifts: [{
                  id: "5",
                  shiftName: "Emergency PFY",
                  startTime: "13:00",
                  endTime: "18:00",
                  assignedStaff: [
                    { id: "7", name: "C Gonzalvo", initials: "CG", designation: "Surgeon" },
                    { id: "5", name: "J Graham", initials: "JG", designation: "Anesthetist" },
                    { id: "8", name: "J Graham", initials: "JG", designation: "Nurse" }
                  ]
                }]
              },
              // Theatre 1 - AH
              {
                room: "Theatre 1",
                shiftType: "AH",
                shifts: [{
                  id: "6",
                  shiftName: "Emergency PFY",
                  startTime: "18:00",
                  endTime: "08:00",
                  assignedStaff: [{ id: "5", name: "J Graham", initials: "JG", designation: "Anesthetist" }]
                }]
              },
              // Theatre 2 - AM
              {
                room: "Theatre 2",
                shiftType: "AM",
                shifts: [{
                  id: "7",
                  shiftName: "Emergency PFY",
                  startTime: "08:00",
                  endTime: "13:00",
                  assignedStaff: [{ id: "5", name: "J Graham", initials: "JG", designation: "Anesthetist" }]
                }]
              },
              // Theatre 2 - PM
              {
                room: "Theatre 2",
                shiftType: "PM",
                shifts: [{
                  id: "8",
                  shiftName: "Emergency PFY",
                  startTime: "13:00",
                  endTime: "18:00",
                  assignedStaff: [
                    { id: "7", name: "C Gonzalvo", initials: "CG", designation: "Surgeon" },
                    { id: "5", name: "J Graham", initials: "JG", designation: "Anesthetist" },
                    { id: "8", name: "J Graham", initials: "JG", designation: "Nurse" }
                  ]
                }]
              },
              // Theatre 2 - AH
              {
                room: "Theatre 2",
                shiftType: "AH",
                shifts: [{
                  id: "9",
                  shiftName: "Emergency PFY",
                  startTime: "18:00",
                  endTime: "08:00",
                  assignedStaff: [{ id: "5", name: "J Graham", initials: "JG", designation: "Anesthetist" }]
                }]
              },
              // Theatre 3 - AM
              {
                room: "Theatre 3",
                shiftType: "AM",
                shifts: [{
                  id: "10",
                  shiftName: "Emergency PFY",
                  startTime: "08:00",
                  endTime: "13:00",
                  assignedStaff: [
                    { id: "4", name: "G Davis", initials: "GD", designation: "Surgeon" },
                    { id: "5", name: "J Graham", initials: "JG", designation: "Anesthetist" },
                    { id: "6", name: "A Hughes", initials: "AH", designation: "Nurse" }
                  ]
                }]
              },
              // Theatre 3 - PM
              {
                room: "Theatre 3",
                shiftType: "PM",
                shifts: [{
                  id: "11",
                  shiftName: "Emergency PFY",
                  startTime: "13:00",
                  endTime: "18:00",
                  assignedStaff: [
                    { id: "7", name: "C Gonzalvo", initials: "CG", designation: "Surgeon" },
                    { id: "5", name: "J Graham", initials: "JG", designation: "Anesthetist" },
                    { id: "8", name: "J Graham", initials: "JG", designation: "Nurse" }
                  ]
                }]
              },
              // Theatre 3 - AH
              {
                room: "Theatre 3",
                shiftType: "AH",
                shifts: [{
                  id: "12",
                  shiftName: "Emergency PFY",
                  startTime: "18:00",
                  endTime: "08:00",
                  assignedStaff: [{ id: "5", name: "J Graham", initials: "JG", designation: "Anesthetist" }]
                }]
              }
            ]
          }
        ]
      };
      
      setData(mockData);
      setLastLoadedDate(dateString);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await getTeamRoster(dateString);
      setData(response);
      setLastLoadedDate(dateString);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load team roster data");
    } finally {
      setLoading(false);
    }
  }, [date, useMock, delayMs, lastLoadedDate, data]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refresh,
    loadData,
  };
}

export function useTeamRosterFilterOptions() {
  const [options, setOptions] = useState<TeamRosterFilterOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTeamRosterFilterOptions();
      setOptions(response);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load filter options");
      // Fallback to default options
      setOptions({
        shiftTypes: ["AM", "PM", "AH", "ON_CALL"],
        designations: ["Surgeon", "Anesthetist", "Nurse", "Fellow", "Cardiologist", "Resident", "Consultant"]
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  return {
    options,
    loading,
    error,
    refresh: loadOptions,
  };
}
