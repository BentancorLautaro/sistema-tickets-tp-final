import type { Ticket, CreateTicketPayload, TicketStatus } from "./types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Error HTTP ${response.status}`);
  return data as T;
}

export const ticketApi = {
  list: () => request<Ticket[]>("/tickets"),
  create: (payload: CreateTicketPayload) =>
    request<Ticket>("/tickets", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: string, payload: { status?: TicketStatus; assignedTo?: string | null }) =>
    request<Ticket>(`/tickets/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(payload) }),
};
