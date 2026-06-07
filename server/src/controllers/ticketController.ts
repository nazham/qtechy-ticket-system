import { NextFunction, Response } from "express";
import { UserRole } from "../constants/enums";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  addCommentService,
  assignTicketService,
  createTicketService,
  getTicketByIdService,
  getTicketsService,
  updateTicketStatusService,
} from "../services/ticketService";

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private
export const createTicket = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const ticket = await createTicketService(req.user!._id.toString(), req.body);

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
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

    const { tickets, pagination } = await getTicketsService(
      req.user!._id.toString(),
      req.user!.role as UserRole,
      { page, limit },
    );

    res.status(200).json({
      success: true,
      count: tickets.length,
      pagination,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ticket by ID
// @route   GET /api/tickets/:id
// @access  Private
export const getTicket = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const ticketId = req.params.id as string;
    const userId = req.user!._id.toString();
    const userRole = req.user!.role as UserRole;

    const ticket = await getTicketByIdService(ticketId, userId, userRole);

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign ticket to agent
// @route   PATCH /api/tickets/:id/assign
// @access  Private
export const assignTicket = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const ticketId = req.params.id as string;
    const { assignedTo } = req.body;

    const ticket = await assignTicketService(ticketId, assignedTo);

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ticket status
// @route   PATCH /api/tickets/:id/status
// @access  Private
export const updateTicketStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const ticketId = req.params.id as string;
    const { status } = req.body;
    const userId = req.user!._id.toString();
    const userRole = req.user!.role as UserRole;

    const ticket = await updateTicketStatusService(ticketId, status, userId, userRole);

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to ticket
// @route   POST /api/tickets/:id/comments
// @access  Private
export const addComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const ticketId = req.params.id as string;
    const { message } = req.body;
    const userId = req.user!._id.toString();
    const userRole = req.user!.role as UserRole;

    const ticket = await addCommentService(ticketId, userId, userRole, message);

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};
