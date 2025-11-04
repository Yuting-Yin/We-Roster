import { fetchJson } from "@/lib/api";

export type FilterMetadataResponse = {
  hospitals: string[];
  designations: string[];
  shiftTypes: string[];
};

/**
 * Get filter metadata (hospitals, designations, shift types)
 */
export async function getFilterMetadata(): Promise<FilterMetadataResponse> {
  return await fetchJson<FilterMetadataResponse>(`/api/v1/metadata/filters`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}

