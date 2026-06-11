import { Router } from "express";
import { Permission } from "../constants/enums";
import {
  addComment,
  assignTicket,
  createTicket,
  getTicket,
  getTickets,
  updateTicketStatus,
  getTicketStatistics,
  updateTicket,
  deleteTicket,
} from "../controllers/ticketController";
import { authorizePermissions, protect } from "../middleware/authMiddleware";
import { validate, validateQuery } from "../middleware/validate";
import {
  addCommentSchema,
  assignTicketSchema,
  createTicketSchema,
  getTicketsQuerySchema,
  updateTicketStatusSchema,
  updateTicketSchema,
} from "../validators/ticketValidators";

const router = Router();

// Apply authentication middleware to all routes in this file
router.use(protect);

router
  .route("/")
  .post(authorizePermissions(Permission.CreateTicket), validate(createTicketSchema), createTicket)
  .get(validateQuery(getTicketsQuerySchema), getTickets);

router.get("/statistics", authorizePermissions(Permission.ViewDashboard), getTicketStatistics);

router
  .route("/:id")
  .get(getTicket)
  .put(authorizePermissions(Permission.UpdateTicket), validate(updateTicketSchema), updateTicket)
  .delete(authorizePermissions(Permission.DeleteTicket), deleteTicket);

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
