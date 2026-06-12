import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db";
import { errorHandler } from "./middleware/errorHandler";
import adminRoutes from "./routes/adminRoutes";
import authRoutes from "./routes/authRoutes";
import ticketRoutes from "./routes/ticketRoutes";
import userRoutes from "./routes/userRoutes";

/**
 * Build the list of allowed origins from the FRONTEND_URL env variable.
 * Supports comma-separated values for multiple origins.
 * Example: FRONTEND_URL=https://app.qtechy.com,https://staging.qtechy.com
 */
const getAllowedOrigins = (): string[] => {
  const raw = process.env.FRONTEND_URL;
  if (!raw) return [];
  return raw
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
};

const startServer = async () => {
  try {
    // Connect to Database
    await connectDB();

    const app: Application = express();

    // ── Security Middleware ──────────────────────────────────────────────
    app.use(
      helmet({
        // Prevent clickjacking — deny all framing of the API
        frameguard: { action: "deny" },
        // Content Security Policy — restrictive defaults for an API server
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'none'"],
            scriptSrc: ["'none'"],
            styleSrc: ["'none'"],
            imgSrc: ["'none'"],
            connectSrc: ["'self'"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            baseUri: ["'none'"],
            formAction: ["'self'"],
          },
        },
      }),
    );

    // ── CORS ────────────────────────────────────────────────────────────
    const allowedOrigins = getAllowedOrigins();
    app.use(
      cors({
        origin(origin, callback) {
          // Allow server-to-server / non-browser requests (no origin header)
          if (!origin) return callback(null, true);

          if (allowedOrigins.includes(origin)) {
            return callback(null, true);
          }

          return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
      }),
    );

    // ── Body Parsing & Logging ──────────────────────────────────────────
    app.use(express.json());
    app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

    // Health Check Route
    app.get("/api/health", (req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        message: "API is running smoothly",
        timestamp: new Date().toISOString(),
      });
    });

    // Mount Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/tickets", ticketRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/admin", adminRoutes);

    // Global Error Handler (must be after all routes)
    app.use(errorHandler);

    const PORT: number = parseInt(process.env.PORT as string, 10) || 8080;

    app.listen(PORT, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
      );
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown startup error";
    process.stderr.write(`Failed to start server: ${message}\n`);
    process.exit(1);
  }
};

startServer();
