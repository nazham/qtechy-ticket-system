import bcrypt from "bcryptjs";
import Ticket from "../models/Ticket";
import User from "../models/User";
import { SEED_TICKETS, SEED_USERS } from "../data/seedData";

// ─── Seed ───────────────────────────────────────────────────────────────────
export const seedDatabase = async () => {
  // 1. Wipe existing data
  await Ticket.deleteMany({});
  await User.deleteMany({});

  // 2. Hash passwords and insert users
  const hashedUsers = await Promise.all(
    SEED_USERS.map(async (u) => ({
      ...u,
      password: await bcrypt.hash(u.password, 10),
    }))
  );
  await User.insertMany(hashedUsers);

  // 3. Insert tickets (ObjectId references are already set correctly in seedData)
  await Ticket.insertMany(SEED_TICKETS);

  return {
    usersCreated: hashedUsers.length,
    ticketsCreated: SEED_TICKETS.length,
  };
};

// ─── Sweep ──────────────────────────────────────────────────────────────────
export const sweepDatabase = async () => {
  const [ticketResult, userResult] = await Promise.all([
    Ticket.deleteMany({}),
    User.deleteMany({}),
  ]);

  return {
    ticketsDeleted: ticketResult.deletedCount,
    usersDeleted: userResult.deletedCount,
  };
};
