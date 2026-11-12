
import "dotenv/config";

import express from "express";
import cors from "cors";

import chatRoutes from "./routes/chatRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/tasks", taskRoutes);
app.get("/api/auth/profile", authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authentication successful!",
    userId: req.user.id,
  });
});

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TaskFlow AI Backend is running!",
  });
});

export default app;
