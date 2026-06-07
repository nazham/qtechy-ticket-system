import { Router } from "express";
import { UserRole } from "../constants/enums";
import {
  addComment,
  assignTicket,
  createTicket,
  getTicket,
  getTickets,
  updateTicketStatus,
} from "../controllers/ticketController";
import { authorizeRoles, protect } from "../middleware/authMiddleware";
import { validate } from "../middleware/validate";
import {
  addCommentSchema,
  assignTicketSchema,
  createTicketSchema,
  updateTicketStatusSchema,
} from "../validators/ticketValidators";

const router = Router();

// Apply authentication middleware to all routes in this file
router.use(protect);

router.route("/").post(validate(createTicketSchema), createTicket).get(getTickets);

router.get("/:id", getTicket);

router.put(
  "/:id/assign",
  authorizeRoles(UserRole.Admin),
  validate(assignTicketSchema),
  assignTicket,
);

router.put(
  "/:id/status",
  authorizeRoles(UserRole.Admin, UserRole.Agent),
  validate(updateTicketStatusSchema),
  updateTicketStatus,
);

router.post("/:id/comments", validate(addCommentSchema), addComment);

export default router;
