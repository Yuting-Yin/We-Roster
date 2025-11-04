// src/hooks/useCurrentUser.ts
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchJson } from "@/lib/api";
import type { User } from "@/types/user";
import { useAuth } from "@/contexts/AuthContext";

type Options = {
  mock?: boolean;   // Offline testing during development
  delayMs?: number; // Artificial delay
};

export function useCurrentUser(opts: Options = {}) {
  const envMock = process.env.EXPO_PUBLIC_MOCK_DASHBOARD === "1";
  const useMock = opts.mock ?? envMock;
  const delayMs = opts.delayMs ?? 200;
  const { token, isAuthenticated } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    if (useMock) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setUser({
          id: "u_mock",
          email: "sarah.johnson@weroster.com",
          firstName: "Sarah",
          lastName: "Johnson",
          name: "Sarah Johnson",
          designation: "Registered Nurse",
          accreditation: "RN Certification",
          phone: "555-0101",
          ical: "https://example.com/calendar.ics",
        });
        setLoading(false);
      }, delayMs);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (!token) {
        setError("No authentication token available");
        setLoading(false);
        return;
      }

      // Get current user from backend
      const data = await fetchJson<User>("/api/v1/auth/me", {
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setUser(data as User);
    } catch (e: any) {
      // If API call fails and we're not using mock, show error
      // If we're using mock, the mock data will be loaded in the mock section
      if (!useMock) {
        setError(e?.message ?? "Failed to load current user");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (useMock) {
      load(); // Load mock data
    } else if (isAuthenticated && token) {
      load(); // Load real data when authenticated
    } else {
      setUser(null);
      setLoading(false);
      setError("Not authenticated");
    }
    
    return () => {
      abortRef.current?.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useMock, delayMs, isAuthenticated, token]);

  const refresh = async () => load();

  // ===== Derived/normalized fields =====
  const firstName = deriveFirstName(user) ?? "there";
  const displayName = deriveDisplayName(user) ?? firstName;
  const email = user?.email ?? "";
  const initials = deriveInitials(user) ?? "??";

  const designation = deriveDesignation(user) ?? "";
  const accreditation = deriveAccreditation(user) ?? "";
  const phone = derivePhone(user) ?? "";
  const ical = deriveIcal(user) ?? "";

  return useMemo(
    () => ({
      user,
      firstName,
      displayName,
      email,
      initials,
      designation,
      accreditation,
      phone,
      ical,
      loading,
      error,
      refresh,
    }),
    [
      user,
      firstName,
      displayName,
      email,
      initials,
      designation,
      accreditation,
      phone,
      ical,
      loading,
      error,
    ]
  );
}

/* ===== Helpers ===== */
function deriveFirstName(u?: User | null) {
  if (!u) return;
  return (
    u.firstName ??
    u.given_name ??
    (u.name ? u.name.split(/\s+/)[0] : undefined) ??
    (u.email ? u.email.split("@")[0] : undefined)
  );
}
function deriveDisplayName(u?: User | null) {
  if (!u) return;
  if (u.firstName && u.lastName) return `${u.firstName} ${u.lastName}`.trim();
  if (u.name) return u.name;
  if (u.given_name && u.family_name) return `${u.given_name} ${u.family_name}`.trim();
  if (u.firstName) return u.firstName;
  if (u.email) return u.email.split("@")[0];
}
function deriveInitials(u?: User | null) {
  if (!u) return;
  const first = u.firstName ?? u.given_name;
  const last = u.lastName ?? u.family_name;
  if (first && last) return (first[0] + last[0]).toUpperCase();

  const name = u.name ?? deriveDisplayName(u);
  if (name) {
    const tokens = name.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 1) return tokens[0].slice(0, 2).toUpperCase();
    if (tokens.length >= 2) return (tokens[0][0] + tokens[tokens.length - 1][0]).toUpperCase();
  }
  if (u.email) {
    const userPart = u.email.split("@")[0].replace(/[^A-Za-z0-9]/g, "");
    if (userPart.length >= 2) return userPart.slice(0, 2).toUpperCase();
    if (userPart.length === 1) return (userPart + userPart).toUpperCase();
  }
}
function deriveDesignation(u?: User | null) {
  if (!u) return;
  return u.designation ?? u.title ?? undefined;
}
function deriveAccreditation(u?: User | null) {
  if (!u) return;
  return u.accreditation ?? u.accreditationName ?? undefined;
}
function derivePhone(u?: User | null) {
  if (!u) return;
  return u.phone ?? u.mobile ?? u.phoneNumber ?? undefined;
}
function deriveIcal(u?: User | null) {
  if (!u) return;
  return u.ical ?? u.icalUrl ?? u.calendarIcsUrl ?? undefined;
}
