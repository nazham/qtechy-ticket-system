import { Router } from "express";
import { seedDb, sweepDb } from "../controllers/adminController";
import { authorizePermissions, protect } from "../middleware/authMiddleware";
import { Permission } from "../constants/enums";

const router = Router();

// Require authentication + Admin-level ManageUsers permission on all admin routes
router.use(protect);
router.use(authorizePermissions(Permission.ManageUsers));

// POST /api/admin/seed   → wipe DB and insert seed data
router.post("/seed", seedDb);

// DELETE /api/admin/sweep → wipe all data from DB
router.delete("/sweep", sweepDb);

export default router;
