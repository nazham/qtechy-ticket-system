import crypto from "crypto";
import { TicketCategory, TicketPriority, UserRole } from "../constants/enums";
import Ticket from "../models/Ticket";

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

export const getTicketsService = async (userId: string, userRole: UserRole) => {
  // Role-based data fetching
  if (userRole === UserRole.Admin) {
    // Admins see everything
    return await Ticket.find().populate("createdBy", "name email").sort({ createdAt: -1 });
  } else if (userRole === UserRole.Agent) {
    // Agents see tickets assigned to them
    return await Ticket.find({ assignedTo: userId })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
  } else {
    // Users only see their own tickets
    return await Ticket.find({ createdBy: userId }).sort({ createdAt: -1 });
  }
};
