import { Request, Response, NextFunction } from "express";
import { createTicketService, getTicketsService } from "../services/ticketService";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { UserRole } from "../constants/enums";

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private
export const createTicket = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const ticket = await createTicketService(authReq.user._id.toString(), req.body);

    res.status(201).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tickets (Role-based)
// @route   GET /api/tickets
// @access  Private
export const getTickets = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const tickets = await getTicketsService(
      authReq.user._id.toString(),
      authReq.user.role as UserRole,
    );

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};
