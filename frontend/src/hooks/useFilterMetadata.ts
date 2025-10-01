import { useState, useEffect } from "react";
import { getFilterMetadata } from "@/api/metadata";

export type FilterMetadata = {
  hospitals: string[];
  designations: string[];
  shiftTypes: string[];
};

export function useFilterMetadata() {
  const [metadata, setMetadata] = useState<FilterMetadata>({
    hospitals: [],
    designations: [],
    shiftTypes: ["AM", "PM", "AH", "ON_CALL"],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchMetadata = async () => {
      try {
        setLoading(true);
        const data = await getFilterMetadata();
        if (mounted) {
          setMetadata(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          console.error("Failed to fetch filter metadata:", err);
          setError("Failed to load filter options");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchMetadata();

    return () => {
      mounted = false;
    };
  }, []);

  return { metadata, loading, error };
}

