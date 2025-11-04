import { useState, useEffect } from "react";
import { getTeamMembers, type TeamMember } from "@/api/team";

export function useTeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getTeamMembers();
      setMembers(data.members);
    } catch (err) {
      console.error("Failed to fetch team members:", err);
      setError(err instanceof Error ? err.message : "Failed to load team members");
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    members,
    loading,
    error,
    refresh: fetchData,
  };
}

