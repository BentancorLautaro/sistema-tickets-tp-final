import { randomUUID } from "node:crypto";
import * as repository from "../data/ticketRepository";
import {
  CreateTicketInput, Ticket, TicketPriority, TicketStatus,
  TICKET_PRIORITIES, TICKET_STATUSES, UpdateTicketInput
} from "../models/ticket";
import { ticketEvents } from "../events/ticketEvents";

export class ServiceError extends Error {
  constructor(message: string, public statusCode = 400) {
    super(message);
    this.name = "ServiceError";
  }
}

function isPriority(value: unknown): value is TicketPriority {
  return typeof value === "string" && (TICKET_PRIORITIES as readonly string[]).includes(value);
}
function isStatus(value: unknown): value is TicketStatus {
  return typeof value === "string" && (TICKET_STATUSES as readonly string[]).includes(value);
}

export async function listTickets(): Promise<Ticket[]> {
  return (await repository.getAll()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  // Segunda capa de validación: el service nunca confía en el controller.
  if (!input || typeof input !== "object") throw new ServiceError("El cuerpo de la solicitud es obligatorio.");
  if (typeof input.title !== "string" || !input.title.trim()) throw new ServiceError("El título no puede estar vacío.");
  if (input.description !== undefined && typeof input.description !== "string") throw new ServiceError("La descripción debe ser texto.");
  if (input.priority !== undefined && !isPriority(input.priority)) throw new ServiceError("La prioridad no es válida.");
  if (input.assignedTo !== undefined && input.assignedTo !== null && typeof input.assignedTo !== "string") {
    throw new ServiceError("La persona asignada debe ser texto o null.");
  }

  const now = new Date().toISOString();
  const ticket: Ticket = {
    id: randomUUID(),
    title: input.title.trim(),
    description: input.description?.trim() ?? "",
    status: "abierto",
    priority: input.priority ?? "media",
    assignedTo: input.assignedTo?.trim() || null,
    createdAt: now,
    updatedAt: now
  };
  const tickets = await repository.getAll();
  tickets.push(ticket);
  await repository.saveAll(tickets);
  if (ticket.priority === "urgente") ticketEvents.emit("ticket:urgente", ticket, "Creación");
  return ticket;
}

export async function updateTicket(id: string, input: UpdateTicketInput): Promise<Ticket> {
  if (!id || typeof id !== "string") throw new ServiceError("El identificador no es válido.");
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new ServiceError("El cuerpo de la solicitud es obligatorio.");
  const keys = Object.keys(input);
  if (!keys.length) throw new ServiceError("Indicá al menos un campo para actualizar.");
  if (keys.some((key) => !["status", "priority", "assignedTo"].includes(key))) {
    throw new ServiceError("Hay campos de actualización no permitidos.");
  }
  if (input.status !== undefined && !isStatus(input.status)) throw new ServiceError("El estado no es válido.");
  if (input.priority !== undefined && !isPriority(input.priority)) throw new ServiceError("La prioridad no es válida.");
  if (input.assignedTo !== undefined && input.assignedTo !== null && typeof input.assignedTo !== "string") {
    throw new ServiceError("La persona asignada debe ser texto o null.");
  }

  const tickets = await repository.getAll();
  const index = tickets.findIndex((ticket) => ticket.id === id);
  if (index < 0) throw new ServiceError("No se encontró el ticket.", 404);
  const updated: Ticket = {
    ...tickets[index],
    ...input,
    assignedTo: input.assignedTo === undefined ? tickets[index].assignedTo : (input.assignedTo?.trim() || null),
    updatedAt: new Date().toISOString()
  };
  tickets[index] = updated;
  await repository.saveAll(tickets);
  if (updated.priority === "urgente") ticketEvents.emit("ticket:urgente", updated, "Actualización");
  return updated;
}
