import { EventEmitter } from "node:events";
import { Ticket } from "../models/ticket";

export const ticketEvents = new EventEmitter();

ticketEvents.on("ticket:urgente", (ticket: Ticket, action: string) => {
  console.log("\n🚨 ===== ALERTA: TICKET URGENTE =====");
  console.log(`Acción: ${action}`);
  console.log(`ID: ${ticket.id}`);
  console.log(`Título: ${ticket.title}`);
  console.log(`Descripción: ${ticket.description || "(sin descripción)"}`);
  console.log(`Estado: ${ticket.status}`);
  console.log(`Asignado a: ${ticket.assignedTo ?? "Sin asignar"}`);
  console.log(`Creado: ${ticket.createdAt}`);
  console.log("====================================\n");
});
