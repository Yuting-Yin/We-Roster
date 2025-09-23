// src/screens/Dashboard/utils/placeholder.ts
export function placeholderArray<T>(n: number): T[] {
  return Array.from({ length: n }) as unknown as T[];
}
