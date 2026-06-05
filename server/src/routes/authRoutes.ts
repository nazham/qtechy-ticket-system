import { Router } from "express";
import { getMe, loginUser, registerUser } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// Public Routes (No middleware needed)
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected Routes (Middleware injected before the controller)
router.get("/me", protect, getMe);

export default router;
