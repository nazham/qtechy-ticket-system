import { Router } from "express";
import { Permission } from "../constants/enums";
import {
  addComment,
  assignTicket,
  createTicket,
  getTicket,
  getTickets,
  updateTicketStatus,
} from "../controllers/ticketController";
import { authorizePermissions, protect } from "../middleware/authMiddleware";
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

router
  .route("/")
  .post(authorizePermissions(Permission.CreateTicket), validate(createTicketSchema), createTicket)
  .get(getTickets);

router.get("/:id", getTicket);

router.put(
  "/:id/assign",
  authorizePermissions(Permission.AssignTicket),
  validate(assignTicketSchema),
  assignTicket,
);

router.put(
  "/:id/status",
  authorizePermissions(Permission.UpdateTicketStatus),
  validate(updateTicketStatusSchema),
  updateTicketStatus,
);

router.post(
  "/:id/comments",
  authorizePermissions(Permission.AddComment),
  validate(addCommentSchema),
  addComment,
);

export default router;
