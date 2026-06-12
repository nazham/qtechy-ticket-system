import crypto from "crypto";
import mongoose, { Types } from "mongoose";
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

const getBaseRbacQuery = (userId: string, userRole: UserRole) => {
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  if (userPermissions.includes(Permission.ViewAllTickets)) {
    // Admins see everything
    return {};
  } else if (userPermissions.includes(Permission.ViewAssignedTickets)) {
    // Agents see tickets assigned to them
    return { assignedTo: new Types.ObjectId(userId) };
  } else {
    // Users only see their own tickets
    return { createdBy: new Types.ObjectId(userId) };
  }
};

const generateTicketNumber = (): string => {
  // Generates a string like TKT-A8F2B
  const randomStr = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `TKT-${randomStr}`;
};

export const validateTicketAssignee = async (assigneeId: string): Promise<void> => {
  const user = await User.findById(assigneeId);
  if (!user) {
    throw new AppError("Assigned user not found", 404);
  }
  if (user.role !== UserRole.Agent) {
    throw new AppError("Tickets can only be assigned to Agents", 400);
  }
};

export const createTicketService = async (
  userId: string,
  ticketData: {
    title: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
    assignedTo?: string | null;
  },
) => {
  const ticketNumber = generateTicketNumber();

  if (ticketData.assignedTo) {
    await validateTicketAssignee(ticketData.assignedTo);
  }

  const newTicket = await Ticket.create({
    ticketNumber,
    createdBy: userId,
    title: ticketData.title,
    description: ticketData.description,
    category: ticketData.category,
    priority: ticketData.priority,
    assignedTo: ticketData.assignedTo || null,
    // Status defaults to 'Open' via Mongoose schema
  });

  return await newTicket.populate([
    { path: "createdBy", select: "name email" },
    { path: "assignedTo", select: "name email" },
    { path: "comments.user", select: "name email role" },
    { path: "statusHistory.changedBy", select: "name" },
  ]);
};

export const getTicketsService = async (
  userId: string,
  userRole: UserRole,
  options?: {
    page?: number;
    limit?: number;
    searchTerm?: string;
    status?: TicketStatus;
    priority?: TicketPriority;
    category?: TicketCategory;
    sortBy?: string;
    sortOrder?: string;
  },
) => {
  const page = Math.max(1, options?.page || 1);
  const limit = Math.max(1, Math.min(100, options?.limit || 10));
  const skip = (page - 1) * limit;

  const rbacQuery = getBaseRbacQuery(userId, userRole);

  const filters: any = {};
  if (options?.searchTerm) {
    const escapedSearchTerm = options.searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filters.$or = [
      { title: mongoose.trusted({ $regex: escapedSearchTerm, $options: "i" }) },
      { ticketNumber: mongoose.trusted({ $regex: escapedSearchTerm, $options: "i" }) },
    ];
  }
  if (options?.status) {
    filters.status = options.status;
  }
  if (options?.priority) {
    filters.priority = options.priority;
  }
  if (options?.category) {
    filters.category = options.category;
  }

  const query: any = {};
  const andClauses = [];
  if (Object.keys(rbacQuery).length > 0) {
    andClauses.push(rbacQuery);
  }
  if (Object.keys(filters).length > 0) {
    andClauses.push(filters);
  }

  if (andClauses.length > 0) {
    query.$and = andClauses;
  }

  let sortOptions: any = { createdAt: -1 };
  if (options?.sortBy) {
    const order = options.sortOrder === "asc" || options.sortOrder === "1" ? 1 : -1;
    sortOptions = { [options.sortBy]: order };
  }

  let tickets: any[];
  if (options?.sortBy === "priority") {
    const order = options.sortOrder === "asc" || options.sortOrder === "1" ? 1 : -1;
    const rawTickets = await Ticket.aggregate([
      { $match: query },
      {
        $addFields: {
          priorityOrder: {
            $switch: {
              branches: [
                { case: { $eq: ["$priority", "Urgent"] }, then: 4 },
                { case: { $eq: ["$priority", "High"] }, then: 3 },
                { case: { $eq: ["$priority", "Medium"] }, then: 2 },
                { case: { $eq: ["$priority", "Low"] }, then: 1 },
              ],
              default: 0,
            },
          },
        },
      },
      { $sort: { priorityOrder: order, createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);
    tickets = await Ticket.populate(rawTickets, [
      { path: "createdBy", select: "name email" },
      { path: "assignedTo", select: "name email" },
    ]);
  } else {
    tickets = await Ticket.find(query)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
  }

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
  const ticket = await Ticket.findById(ticketId)
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email")
    .populate("comments.user", "name email role")
    .populate("statusHistory.changedBy", "name");
  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  if (userPermissions.includes(Permission.ViewAllTickets)) {
    // Admin-level: can see any ticket, no ownership check needed
  } else if (userPermissions.includes(Permission.ViewAssignedTickets)) {
    const assignedId = (ticket.assignedTo as any)?._id?.toString() || ticket.assignedTo?.toString();
    if (!assignedId || assignedId !== userId) {
      throw new AppError("Not authorized to access this ticket", 403);
    }
  } else {
    const creatorId = (ticket.createdBy as any)?._id?.toString() || ticket.createdBy?.toString();
    if (creatorId !== userId) {
      throw new AppError("Not authorized to access this ticket", 403);
    }
  }

  return ticket;
};

export const assignTicketService = async (ticketId: string, assignToUserId: string | null) => {
  if (assignToUserId) {
    await validateTicketAssignee(assignToUserId);
  }

  const ticket = await Ticket.findByIdAndUpdate(
    ticketId,
    { assignedTo: assignToUserId || null },
    { new: true, runValidators: true },
  )
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email")
    .populate("comments.user", "name email role")
    .populate("statusHistory.changedBy", "name");
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
  // Enforce that only Admins and Agents can update ticket status
  if (userRole !== UserRole.Admin && userRole !== UserRole.Agent) {
    throw new AppError("Only Admins and Agents can update ticket status", 403);
  }

  // Ensure the user has access to this ticket
  const ticket = await getTicketByIdService(ticketId, userId, userRole);

  // Avoid redundant updates and history pollution if status is unchanged
  if (ticket.status === newStatus) {
    return ticket;
  }

  // An Agent must be assigned to the ticket before updating status to anything other than 'Closed'
  if (!ticket.assignedTo && newStatus !== TicketStatus.Closed) {
    throw new AppError("Ticket must be assigned to an Agent before updating status", 400);
  }

  ticket.status = newStatus;
  ticket.statusHistory.push({
    status: newStatus,
    changedBy: new Types.ObjectId(userId),
    changedAt: new Date(),
  });

  const savedTicket = await ticket.save();
  return await savedTicket.populate([
    { path: "createdBy", select: "name email" },
    { path: "assignedTo", select: "name email" },
    { path: "comments.user", select: "name email role" },
    { path: "statusHistory.changedBy", select: "name" },
  ]);
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

  const savedTicket = await ticket.save();
  return await savedTicket.populate([
    { path: "createdBy", select: "name email" },
    { path: "assignedTo", select: "name email" },
    { path: "comments.user", select: "name email role" },
    { path: "statusHistory.changedBy", select: "name" },
  ]);
};

const mapRecentTickets = (tickets: ITicket[]) => {
  return tickets.map((t) => {
    let lastActivity = "Ticket created";
    let lastTime = t.createdAt.getTime();

    if (t.statusHistory && t.statusHistory.length > 0) {
      const latestStatus = t.statusHistory.reduce(
        (prev: IStatusHistory, current: IStatusHistory) =>
          prev.changedAt.getTime() > current.changedAt.getTime() ? prev : current,
      );
      if (latestStatus.changedAt.getTime() > lastTime) {
        lastActivity = `Status updated to ${latestStatus.status}`;
        lastTime = latestStatus.changedAt.getTime();
      }
    }

    if (t.comments && t.comments.length > 0) {
      const latestComment = t.comments.reduce((prev: IComment, current: IComment) =>
        prev.createdAt.getTime() > current.createdAt.getTime() ? prev : current,
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

export const getTicketStatisticsService = async (userId: string, userRole: UserRole) => {
  const query = getBaseRbacQuery(userId, userRole);

  // Common: status counts
  const statusCounts = await Ticket.aggregate([
    { $match: query },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const stats = {
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  };

  statusCounts.forEach((item) => {
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
  let urgentFocus: number | undefined = undefined;
  let recentTickets: any[] | undefined = undefined;

  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  if (userPermissions.includes(Permission.ManageUsers)) {
    // Admin metrics (run concurrently for best performance)
    const [usersCount, backlogCount, catCounts, escalationsCount] = await Promise.all([
      User.countDocuments({}),
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
    urgentFocus = escalationsCount;

    categoryDistribution = {
      [TicketCategory.Bug]: 0,
      [TicketCategory.FeatureRequest]: 0,
      [TicketCategory.TechnicalIssue]: 0,
      [TicketCategory.PaymentIssue]: 0,
      [TicketCategory.AccountIssue]: 0,
      [TicketCategory.Other]: 0,
    };

    catCounts.forEach((item) => {
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
      Ticket.find({ assignedTo: agentObjectId }).sort({ updatedAt: -1 }).limit(5),
    ]);

    urgentFocus = focusCount;
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
    urgentFocus,
    recentTickets,
  };
};

export const updateTicketService = async (
  ticketId: string,
  updateData: {
    title?: string;
    description?: string;
    category?: TicketCategory;
    priority?: TicketPriority;
    assignedTo?: string | null;
  },
  userId: string,
  userRole: UserRole,
) => {
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  if (!userPermissions.includes(Permission.UpdateTicket)) {
    throw new AppError("Only admins are authorized to update ticket details", 403);
  }

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  // Apply updates
  if (updateData.title !== undefined) ticket.title = updateData.title;
  if (updateData.description !== undefined) ticket.description = updateData.description;
  if (updateData.category !== undefined) ticket.category = updateData.category;
  if (updateData.priority !== undefined) ticket.priority = updateData.priority;
  if (updateData.assignedTo !== undefined) {
    if (updateData.assignedTo) {
      await validateTicketAssignee(updateData.assignedTo);
      ticket.assignedTo = new Types.ObjectId(updateData.assignedTo) as any;
    } else {
      ticket.assignedTo = null;
    }
  }

  await ticket.save();

  return Ticket.findById(ticketId)
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email")
    .populate("comments.user", "name email role")
    .populate("statusHistory.changedBy", "name");
};

export const deleteTicketService = async (ticketId: string, userRole: UserRole) => {
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  if (!userPermissions.includes(Permission.DeleteTicket)) {
    throw new AppError("Only admins are authorized to delete tickets", 403);
  }

  const ticket = await Ticket.findByIdAndDelete(ticketId);
  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  return ticket;
};
