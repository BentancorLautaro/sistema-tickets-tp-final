import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import ticketRoutes from "./routes/ticketRoutes";
import { ServiceError } from "./services/ticketService";

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: FRONTEND_ORIGIN, methods: ["GET", "POST", "PATCH", "OPTIONS"], allowedHeaders: ["Content-Type"] }));
app.use(express.json({ limit: "1mb" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/tickets", ticketRoutes);

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ServiceError) return res.status(error.statusCode).json({ error: error.message });
  if (error instanceof SyntaxError) return res.status(400).json({ error: "El JSON enviado no es válido." });
  console.error("Error inesperado:", error);
  return res.status(500).json({ error: "Ocurrió un error interno del servidor." });
});

app.listen(PORT, () => {
  console.log(`Backend disponible en http://localhost:${PORT}`);
  console.log(`CORS habilitado para ${FRONTEND_ORIGIN}`);
});
