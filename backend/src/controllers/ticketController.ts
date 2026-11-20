import { Request, Response, NextFunction } from "express";
import * as service from "../services/ticketService";
import { TICKET_PRIORITIES, TICKET_STATUSES } from "../models/ticket";

export async function getTickets(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await service.listTickets());
  } catch (error) { next(error); }
}

export async function postTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body;
    // Primera capa de validación: formato y campos antes de invocar el service.
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({ error: "El cuerpo JSON es obligatorio." });
    }
    if (typeof body.title !== "string" || !body.title.trim()) {
      return res.status(400).json({ error: "El título no puede estar vacío." });
    }
    if (body.description !== undefined && typeof body.description !== "string") {
      return res.status(400).json({ error: "La descripción debe ser texto." });
    }
    if (body.priority !== undefined && !(TICKET_PRIORITIES as readonly unknown[]).includes(body.priority)) {
      return res.status(400).json({ error: "La prioridad no es válida." });
    }
    if (body.assignedTo !== undefined && body.assignedTo !== null && typeof body.assignedTo !== "string") {
      return res.status(400).json({ error: "La persona asignada debe ser texto o null." });
    }
    const ticket = await service.createTicket(body);
    return res.status(201).json(ticket);
  } catch (error) { return next(error); }
}

export async function patchTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({ error: "El cuerpo JSON es obligatorio." });
    }
    if (Object.keys(body).length === 0) return res.status(400).json({ error: "Indicá al menos un campo para actualizar." });
    if (body.status !== undefined && !(TICKET_STATUSES as readonly unknown[]).includes(body.status)) {
      return res.status(400).json({ error: "El estado no es válido." });
    }
    if (body.priority !== undefined && !(TICKET_PRIORITIES as readonly unknown[]).includes(body.priority)) {
      return res.status(400).json({ error: "La prioridad no es válida." });
    }
    if (body.assignedTo !== undefined && body.assignedTo !== null && typeof body.assignedTo !== "string") {
      return res.status(400).json({ error: "La persona asignada debe ser texto o null." });
    }
    const ticket = await service.updateTicket(req.params.id, body);
    return res.json(ticket);
  } catch (error) { return next(error); }
}
