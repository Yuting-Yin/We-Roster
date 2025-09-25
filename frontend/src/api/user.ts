// src/api/user.ts
import { API_BASE_URL } from '../config/env';

export type ApiUser = {
  id: string;
  displayName: string;
  title?: string;
  avatarUrl?: string;
};

const USE_MOCK = false; // now connected to backend
const BASE_URL = API_BASE_URL;

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${txt || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/** get avaliable users */
export async function getAvailableUsers(): Promise<ApiUser[]> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300));
    return [
      { id: "u001", displayName: "Alice Johnson", title: "RN" },
      { id: "u002", displayName: "Bob Smith", title: "EN" },
      { id: "u003", displayName: "Carol Lee", title: "Surgeon" },
      { id: "u004", displayName: "David Chen", title: "AN" },
      { id: "u005", displayName: "Emily Wang", title: "RN" },
    ];
  }
  // backend example - TODO: implement actual endpoint
  return fetchJSON<ApiUser[]>("/users/available");
}
