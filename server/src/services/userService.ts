import mongoose from "mongoose";
import { ROLE_PERMISSIONS, TicketStatus, UserRole } from "../constants/enums";
import { AppError } from "../middleware/errorHandler";
import Ticket from "../models/Ticket";
import User, { IUser } from "../models/User";

export interface UserDirectoryItem {
  _id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
  activeTicketsCount: number;
}

/** Map of lowercase role strings → UserRole enum values for safe lookup. */
const ROLE_MAP: Record<string, UserRole> = {
  admin: UserRole.Admin,
  agent: UserRole.Agent,
  user: UserRole.User,
};

/**
 * Gets all users from the database.
 * Supports filtering by role. Rejects unknown role values instead of passing them
 * to the query.
 */
export const getUsersService = async (roleQuery?: string): Promise<IUser[]> => {
  const filter: Record<string, unknown> = {};

  if (roleQuery) {
    const mapped = ROLE_MAP[roleQuery.toLowerCase()];
    if (!mapped) {
      throw new AppError(`Invalid role filter: ${roleQuery}`, 400);
    }
    filter.role = mapped;
  }

  return User.find(filter).select("-password").sort({ name: 1 });
};

/**
 * Gets all users with their active tickets count.
 *
 * Fixes applied:
 *  - B1: `userIds` is now actually used to scope the ticket aggregation.
 *  - P2: Aggregation is filtered by `$in: userIds` instead of scanning all tickets.
 *  - S4: Return type is `UserDirectoryItem[]` instead of `any[]`.
 *  - S5: Explicit field selection via projection instead of fragile `toJSON()` spread.
 */
export const getUsersDirectoryService = async (): Promise<UserDirectoryItem[]> => {
  const users = await User.find({}).select("-password").sort({ name: 1 });
  const userIds = users.map((u) => u._id);

  // Aggregate active ticket counts — scoped to known user IDs only (P2)
  const ticketCounts = await Ticket.aggregate([
    {
      $match: {
        assignedTo: { $in: userIds },
        status: { $ne: TicketStatus.Closed },
      },
    },
    {
      $group: {
        _id: "$assignedTo",
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = new Map<string, number>(
    ticketCounts.map((item) => [item._id.toString(), item.count]),
  );

  // S5: Explicit field projection instead of toJSON() spread
  return users.map((u) => ({
    _id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    permissions: ROLE_PERMISSIONS[u.role] ?? [],
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    activeTicketsCount: countMap.get(u._id.toString()) ?? 0,
  }));
};

/**
 * Changes a user's role (promote/demote).
 * Wraps ticket unassignment + role change in a transaction for atomicity (B3).
 */
export const changeUserServiceRole = async (
  userId: string,
  currentUserId: string,
  targetRole: UserRole,
  alreadyRoleError: string,
): Promise<IUser> => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError("Invalid user ID format", 400);
  }

  if (currentUserId === userId) {
    throw new AppError("You cannot change your own role", 400);
  }

  if (targetRole === UserRole.Admin) {
    throw new AppError("Cannot change role to Admin", 400);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.role === UserRole.Admin) {
    throw new AppError("Cannot change role of an Admin", 400);
  }

  if (user.role === targetRole) {
    throw new AppError(alreadyRoleError, 400);
  }

  if (user.role === UserRole.Agent && targetRole === UserRole.User) {
    // Use a transaction so ticket unassignment + role change are atomic (B3)
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      await Ticket.updateMany(
        { assignedTo: user._id },
        { $set: { assignedTo: null } },
        { session },
      );
      user.role = targetRole;
      await user.save({ session });
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
    return user;
  }

  user.role = targetRole;
  await user.save();

  return user;
};

/**
 * Deletes a user from the database.
 * Wraps ticket unassignment + user deletion in a transaction for atomicity (B3).
 */
export const deleteUserService = async (userId: string, currentUserId: string): Promise<IUser> => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError("Invalid user ID format", 400);
  }

  if (userId === currentUserId) {
    throw new AppError("You cannot delete your own account", 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.role === UserRole.Admin) {
    throw new AppError("Cannot delete an Admin user", 400);
  }

  // Use a transaction so ticket unassignment + user deletion are atomic (B3)
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    await Ticket.updateMany({ assignedTo: user._id }, { $set: { assignedTo: null } }, { session });
    await user.deleteOne({ session });
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }

  return user;
};
