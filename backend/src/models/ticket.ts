export const TICKET_STATUSES = ["abierto", "en_progreso", "resuelto", "cerrado"] as const;
export const TICKET_PRIORITIES = ["baja", "media", "alta", "urgente"] as const;

export type TicketStatus = typeof TICKET_STATUSES[number];
export type TicketPriority = typeof TICKET_PRIORITIES[number];

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketInput {
  title: string;
  description?: string;
  priority?: TicketPriority;
  assignedTo?: string | null;
}

export interface UpdateTicketInput {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedTo?: string | null;
}
