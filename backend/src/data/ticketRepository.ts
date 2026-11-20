import { promises as fs } from "node:fs";
import path from "node:path";
import { Ticket } from "../models/ticket";

const DATA_FILE = path.join(__dirname, "tickets.json");

async function ensureFile(): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]\n", "utf8");
  }
}

export async function getAll(): Promise<Ticket[]> {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("El archivo de tickets tiene un formato inválido.");
  return parsed as Ticket[];
}

export async function saveAll(tickets: Ticket[]): Promise<void> {
  await ensureFile();
  const tempFile = `${DATA_FILE}.tmp`;
  await fs.writeFile(tempFile, `${JSON.stringify(tickets, null, 2)}\n`, "utf8");
  await fs.rename(tempFile, DATA_FILE);
}
