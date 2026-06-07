import { Router } from "express";
import { getMe, loginUser, registerUser } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";
import { authLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validate";
import { loginSchema, registerSchema } from "../validators/authValidators";

const router = Router();

// Public Routes
router.post("/register", authLimiter, validate(registerSchema), registerUser);
router.post("/login", authLimiter, validate(loginSchema), loginUser);

// Protected Routes
router.get("/me", protect, getMe);

export default router;
