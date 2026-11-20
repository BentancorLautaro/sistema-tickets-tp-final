export type TicketStatus = "abierto" | "en_progreso" | "resuelto" | "cerrado";
export type TicketPriority = "baja" | "media" | "alta" | "urgente";

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

export interface CreateTicketPayload {
  title: string;
  description: string;
  priority: TicketPriority;
  assignedTo: string | null;
}
