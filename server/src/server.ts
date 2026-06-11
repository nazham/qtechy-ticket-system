import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/authRoutes";
import ticketRoutes from "./routes/ticketRoutes";
import userRoutes from "./routes/userRoutes";

const startServer = async () => {
  try {
    // Connect to Database
    await connectDB();

    const app: Application = express();

    // Middleware
    app.use(helmet());
    app.use(cors());
    app.use(express.json());
    app.use(morgan("dev"));

    // Health Check Route
    app.get("/api/health", (req: Request, res: Response) => {
      res.status(200).json({ success: true, message: "API is running smoothly" });
    });

    // Mount Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/tickets", ticketRoutes);
    app.use("/api/users", userRoutes);

    // Global Error Handler (must be after all routes)
    app.use(errorHandler);

    const PORT: number = parseInt(process.env.PORT as string, 10) || 8080;

    app.listen(PORT, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
