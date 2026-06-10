import crypto from "crypto";
import { Types } from "mongoose";
import {
  Permission,
  ROLE_PERMISSIONS,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  UserRole,
} from "../constants/enums";
import { AppError } from "../middleware/errorHandler";
import Ticket, { ITicket, IComment, IStatusHistory } from "../models/Ticket";
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
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  if (userPermissions.includes(Permission.ViewAllTickets)) {
    // Admins see everything
    query = {};
  } else if (userPermissions.includes(Permission.ViewAssignedTickets)) {
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

  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  if (userPermissions.includes(Permission.ViewAllTickets)) {
    // Admin-level: can see any ticket, no ownership check needed
  } else if (userPermissions.includes(Permission.ViewAssignedTickets)) {
    if (!ticket.assignedTo || ticket.assignedTo.toString() !== userId) {
      throw new AppError("Not authorized to access this ticket", 403);
    }
  } else {
    if (ticket.createdBy.toString() !== userId) {
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

const mapRecentTickets = (tickets: ITicket[]) => {
  return tickets.map(t => {
    let lastActivity = "Ticket created";
    let lastTime = t.createdAt.getTime();

    if (t.statusHistory && t.statusHistory.length > 0) {
      const latestStatus = t.statusHistory.reduce((prev: IStatusHistory, current: IStatusHistory) => 
        (prev.changedAt.getTime() > current.changedAt.getTime()) ? prev : current
      );
      if (latestStatus.changedAt.getTime() > lastTime) {
        lastActivity = `Status updated to ${latestStatus.status}`;
        lastTime = latestStatus.changedAt.getTime();
      }
    }

    if (t.comments && t.comments.length > 0) {
      const latestComment = t.comments.reduce((prev: IComment, current: IComment) => 
        (prev.createdAt.getTime() > current.createdAt.getTime()) ? prev : current
      );
      if (latestComment.createdAt.getTime() > lastTime) {
        lastActivity = "New comment added";
        lastTime = latestComment.createdAt.getTime();
      }
    }

    return {
      _id: t._id,
      ticketNumber: t.ticketNumber,
      title: t.title,
      status: t.status,
      updatedAt: t.updatedAt,
      lastActivity,
    };
  });
};

export const getTicketStatisticsService = async (
  userId: string,
  userRole: UserRole,
) => {
  let query = {};
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  if (userPermissions.includes(Permission.ViewAllTickets)) {
    // Admins see everything
    query = {};
  } else if (userPermissions.includes(Permission.ViewAssignedTickets)) {
    // Agents see tickets assigned to them
    query = { assignedTo: new Types.ObjectId(userId) };
  } else {
    // Users only see their own tickets
    query = { createdBy: new Types.ObjectId(userId) };
  }

  // Common: status counts
  const statusCounts = await Ticket.aggregate([
    { $match: query },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  const stats = {
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  };

  statusCounts.forEach(item => {
    switch (item._id) {
      case TicketStatus.Open:
        stats.open = item.count;
        break;
      case TicketStatus.InProgress:
        stats.inProgress = item.count;
        break;
      case TicketStatus.Resolved:
        stats.resolved = item.count;
        break;
      case TicketStatus.Closed:
        stats.closed = item.count;
        break;
    }
  });

  // Role-specific tailored data
  let totalUsers: number | undefined = undefined;
  let triageBacklog: number | undefined = undefined;
  let categoryDistribution: Record<string, number> | undefined = undefined;
  let urgentEscalations: number | undefined = undefined;
  let priorityFocus: number | undefined = undefined;
  let recentTickets: any[] | undefined = undefined;

  if (userPermissions.includes(Permission.ManageUsers)) {
    // Admin metrics (run concurrently for best performance)
    const [usersCount, backlogCount, catCounts, escalationsCount] = await Promise.all([
      User.countDocuments({ role: { $in: [UserRole.User, UserRole.Agent] } }),
      Ticket.countDocuments({
        assignedTo: null,
        status: { $in: [TicketStatus.Open, TicketStatus.InProgress] },
      }),
      Ticket.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
      Ticket.countDocuments({
        priority: { $in: [TicketPriority.High, TicketPriority.Urgent] },
        status: { $in: [TicketStatus.Open, TicketStatus.InProgress] },
      }),
    ]);

    totalUsers = usersCount;
    triageBacklog = backlogCount;
    urgentEscalations = escalationsCount;

    categoryDistribution = {
      [TicketCategory.Bug]: 0,
      [TicketCategory.FeatureRequest]: 0,
      [TicketCategory.TechnicalIssue]: 0,
      [TicketCategory.PaymentIssue]: 0,
      [TicketCategory.AccountIssue]: 0,
      [TicketCategory.Other]: 0,
    };

    catCounts.forEach(item => {
      if (item._id && categoryDistribution) {
        categoryDistribution[item._id] = item.count;
      }
    });
  } else if (userPermissions.includes(Permission.ViewAssignedTickets)) {
    // Agent metrics (run concurrently for best performance)
    const agentObjectId = new Types.ObjectId(userId);
    const [focusCount, agentTickets] = await Promise.all([
      Ticket.countDocuments({
        assignedTo: agentObjectId,
        priority: { $in: [TicketPriority.High, TicketPriority.Urgent] },
        status: { $in: [TicketStatus.Open, TicketStatus.InProgress] },
      }),
      Ticket.find({ assignedTo: agentObjectId })
        .sort({ updatedAt: -1 })
        .limit(5),
    ]);

    priorityFocus = focusCount;
    recentTickets = mapRecentTickets(agentTickets);
  } else {
    // User metrics
    const userObjectId = new Types.ObjectId(userId);
    const userTickets = await Ticket.find({ createdBy: userObjectId })
      .sort({ updatedAt: -1 })
      .limit(5);

    recentTickets = mapRecentTickets(userTickets);
  }

  return {
    ticketsByStatus: stats,
    totalUsers,
    triageBacklog,
    categoryDistribution,
    urgentEscalations,
    priorityFocus,
    recentTickets,
  };
};
