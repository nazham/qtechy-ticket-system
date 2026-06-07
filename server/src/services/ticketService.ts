import crypto from "crypto";
import { Types } from "mongoose";
import { TicketCategory, TicketPriority, TicketStatus, UserRole } from "../constants/enums";
import { AppError } from "../middleware/errorHandler";
import Ticket from "../models/Ticket";
import User from "../models/User";

const generateTicketNumber = (): string => {
  // Generates a string like TKT-A8F2B
  const randomStr = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `TKT-${randomStr}`;
};

export const createTicketService = async (
  userId: string,
  ticketData: {
    title: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
  },
) => {
  const ticketNumber = generateTicketNumber();

  const newTicket = await Ticket.create({
    ticketNumber,
    createdBy: userId,
    title: ticketData.title,
    description: ticketData.description,
    category: ticketData.category,
    priority: ticketData.priority,
    // Status defaults to 'Open' via Mongoose schema
  });

  return newTicket;
};

export const getTicketsService = async (
  userId: string,
  userRole: UserRole,
  options?: { page?: number; limit?: number },
) => {
  const page = Math.max(1, options?.page || 1);
  const limit = Math.max(1, Math.min(100, options?.limit || 10));
  const skip = (page - 1) * limit;

  let query = {};
  if (userRole === UserRole.Admin) {
    // Admins see everything
    query = {};
  } else if (userRole === UserRole.Agent) {
    // Agents see tickets assigned to them
    query = { assignedTo: userId };
  } else {
    // Users only see their own tickets
    query = { createdBy: userId };
  }

  const tickets = await Ticket.find(query)
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Ticket.countDocuments(query);

  return {
    tickets,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getTicketByIdService = async (
  ticketId: string,
  userId: string,
  userRole: UserRole,
) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  if (userRole === UserRole.User) {
    if (ticket.createdBy.toString() !== userId) {
      throw new AppError("Not authorized to access this ticket", 403);
    }
  } else if (userRole === UserRole.Agent) {
    if (!ticket.assignedTo || ticket.assignedTo.toString() !== userId) {
      throw new AppError("Not authorized to access this ticket", 403);
    }
  }

  return ticket;
};

export const assignTicketService = async (ticketId: string, assignToUserId: string | null) => {
  if (assignToUserId) {
    // Verify that the assigned user exists
    const userExists = await User.exists({ _id: assignToUserId });
    if (!userExists) {
      throw new AppError("Assigned user not found", 404);
    }
  }

  const ticket = await Ticket.findByIdAndUpdate(
    ticketId,
    { assignedTo: assignToUserId || null },
    { new: true, runValidators: true },
  );
  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }
  return ticket;
};

export const updateTicketStatusService = async (
  ticketId: string,
  newStatus: TicketStatus,
  userId: string,
  userRole: UserRole,
) => {
  // Ensure the user has access to this ticket
  const ticket = await getTicketByIdService(ticketId, userId, userRole);

  // Avoid redundant updates and history pollution if status is unchanged
  if (ticket.status === newStatus) {
    return ticket;
  }

  ticket.status = newStatus;
  ticket.statusHistory.push({
    status: newStatus,
    changedBy: new Types.ObjectId(userId),
    changedAt: new Date(),
  });

  return await ticket.save();
};

export const addCommentService = async (
  ticketId: string,
  userId: string,
  userRole: UserRole,
  message: string,
) => {
  // Ensure the user has access to this ticket
  const ticket = await getTicketByIdService(ticketId, userId, userRole);

  ticket.comments.push({
    user: new Types.ObjectId(userId),
    message,
    createdAt: new Date(),
  });

  return await ticket.save();
};
