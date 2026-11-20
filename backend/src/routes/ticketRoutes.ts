import { Router } from "express";
import { getTickets, postTicket, patchTicket } from "../controllers/ticketController";

const router = Router();
router.get("/", getTickets);
router.post("/", postTicket);
router.patch("/:id", patchTicket);
export default router;
