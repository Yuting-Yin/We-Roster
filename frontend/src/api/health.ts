import { API_BASE_URL } from '../config/env';
export async function healthCheck() {
  const res = await fetch(`${API_BASE_URL}/health-check`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
