"use client";

export interface ClientActor {
  id: string;
}

export function getClientActor(): ClientActor | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("tshira_auth");
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { id?: string };
    if (!parsed?.id) return null;
    return { id: parsed.id };
  } catch {
    return null;
  }
}
