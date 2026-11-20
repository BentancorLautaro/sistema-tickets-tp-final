import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ticketApi } from "./api";
import type { Ticket, TicketPriority, TicketStatus, CreateTicketPayload } from "./types";

const statuses: { value: TicketStatus | "todos"; label: string }[] = [
  { value: "todos", label: "Todos los estados" },
  { value: "abierto", label: "Abierto" },
  { value: "en_progreso", label: "En progreso" },
  { value: "resuelto", label: "Resuelto" },
  { value: "cerrado", label: "Cerrado" },
];
const priorities: { value: TicketPriority | "todas"; label: string }[] = [
  { value: "todas", label: "Todas las prioridades" },
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
];

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "todos">("todos");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "todas">("todas");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<CreateTicketPayload>({
    title: "", description: "", priority: "media", assignedTo: null,
  });

  const loadTickets = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try { setTickets(await ticketApi.list()); }
    catch (err) { setError(err instanceof Error ? err.message : "No se pudieron cargar los tickets."); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { void loadTickets(); }, [loadTickets]);

  const visibleTickets = useMemo(() => tickets.filter((ticket) =>
    (statusFilter === "todos" || ticket.status === statusFilter) &&
    (priorityFilter === "todas" || ticket.priority === priorityFilter)
  ), [tickets, statusFilter, priorityFilter]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim()) { setError("El título es obligatorio."); return; }
    setIsSubmitting(true);
    setError("");
    try {
      const created = await ticketApi.create(form);
      setTickets((current) => [created, ...current]);
      setForm({ title: "", description: "", priority: "media", assignedTo: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el ticket.");
    } finally { setIsSubmitting(false); }
  }

  async function handleUpdate(id: string, payload: { status?: TicketStatus; assignedTo?: string | null }) {
    setError("");
    try {
      const updated = await ticketApi.update(id, payload);
      setTickets((current) => current.map((ticket) => ticket.id === id ? updated : ticket));
    } catch (err) { setError(err instanceof Error ? err.message : "No se pudo actualizar el ticket."); }
  }

  const counts = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter((ticket) => ticket.status === "abierto").length,
    urgent: tickets.filter((ticket) => ticket.priority === "urgente").length,
    resolved: tickets.filter((ticket) => ticket.status === "resuelto" || ticket.status === "cerrado").length,
  }), [tickets]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div><span className="eyebrow">CENTRO DE SOPORTE</span><h1>Sistema de tickets</h1>
          <p>Organizá solicitudes, prioridades y responsables desde un solo lugar.</p></div>
        <button className="button button-ghost" onClick={() => void loadTickets()} disabled={isLoading}>↻ Actualizar</button>
      </header>

      <section className="stats-grid" aria-label="Resumen de tickets">
        <article className="stat-card"><span>Total de tickets</span><strong>{counts.total}</strong></article>
        <article className="stat-card"><span>Abiertos</span><strong>{counts.open}</strong></article>
        <article className="stat-card"><span>Prioridad urgente</span><strong className="urgent-number">{counts.urgent}</strong></article>
        <article className="stat-card"><span>Resueltos / cerrados</span><strong>{counts.resolved}</strong></article>
      </section>

      {error && <div className="alert" role="alert"><span>{error}</span><button onClick={() => setError("")} aria-label="Cerrar alerta">×</button></div>}

      <div className="content-grid">
        <section className="panel create-panel">
          <div className="section-heading"><div><span className="eyebrow">NUEVA SOLICITUD</span><h2>Crear ticket</h2></div><span className="plus-icon">＋</span></div>
          <form onSubmit={handleCreate}>
            <label htmlFor="title">Título <b>*</b></label>
            <input id="title" value={form.title} maxLength={120} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ej. No puedo acceder al sistema" required />
            <label htmlFor="description">Descripción</label>
            <textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Agregá detalles para entender el problema..." rows={4} />
            <label htmlFor="priority">Prioridad</label>
            <select id="priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TicketPriority })}>
              {priorities.filter((item) => item.value !== "todas").map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            <label htmlFor="assignee">Asignar a</label>
            <input id="assignee" value={form.assignedTo ?? ""} onChange={(e) => setForm({ ...form, assignedTo: e.target.value || null })} placeholder="Nombre del responsable (opcional)" />
            <button className="button button-primary submit-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Creando..." : "＋ Crear ticket"}</button>
          </form>
        </section>

        <section className="panel tickets-panel">
          <div className="section-heading tickets-heading"><div><span className="eyebrow">SEGUIMIENTO</span><h2>Tickets registrados</h2></div><span className="result-count">{visibleTickets.length} resultados</span></div>
          <div className="filters">
            <select aria-label="Filtrar por estado" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as TicketStatus | "todos")}>
              {statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            <select aria-label="Filtrar por prioridad" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as TicketPriority | "todas")}>
              {priorities.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
          {isLoading ? <div className="empty-state"><span className="loader" />Cargando tickets...</div> :
            visibleTickets.length === 0 ? <div className="empty-state"><span className="empty-icon">▤</span><strong>No hay tickets para mostrar</strong><span>Probá cambiar los filtros o creá una solicitud nueva.</span></div> :
            <div className="ticket-list">{visibleTickets.map((ticket) => (
              <article className="ticket-card" key={ticket.id}>
                <div className="ticket-main">
                  <div className="ticket-title-row"><h3>{ticket.title}</h3><span className={`priority priority-${ticket.priority}`}>{ticket.priority}</span></div>
                  {ticket.description && <p className="ticket-description">{ticket.description}</p>}
                  <div className="ticket-meta"><span>#{ticket.id.slice(0, 8)}</span><span>Creado: {formatDate(ticket.createdAt)}</span></div>
                </div>
                <div className="ticket-controls">
                  <label className="sr-only" htmlFor={`status-${ticket.id}`}>Estado de {ticket.title}</label>
                  <select id={`status-${ticket.id}`} value={ticket.status} onChange={(e) => void handleUpdate(ticket.id, { status: e.target.value as TicketStatus })}>
                    {statuses.filter((item) => item.value !== "todos").map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                  <label className="sr-only" htmlFor={`assignee-${ticket.id}`}>Responsable de {ticket.title}</label>
                  <input id={`assignee-${ticket.id}`} key={`${ticket.id}-${ticket.assignedTo ?? ""}`} defaultValue={ticket.assignedTo ?? ""} placeholder="Sin asignar" onBlur={(e) => {
                    const value = e.target.value.trim() || null;
                    if (value !== ticket.assignedTo) void handleUpdate(ticket.id, { assignedTo: value });
                  }} />
                </div>
              </article>
            ))}</div>}
        </section>
      </div>
      <footer>Gestión de soporte · Los cambios se guardan en el backend local.</footer>
    </main>
  );
}
