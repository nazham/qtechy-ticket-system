import { Router } from "express";
import { createTicket, getTickets } from "../controllers/ticketController";
import { protect } from "../middleware/authMiddleware";
import { validate } from "../middleware/validate";
import { createTicketSchema } from "../validators/ticketValidators";

const router = Router();

// Apply authentication middleware to all routes in this file
router.use(protect);

router.route("/").post(validate(createTicketSchema), createTicket).get(getTickets);

export default router;
