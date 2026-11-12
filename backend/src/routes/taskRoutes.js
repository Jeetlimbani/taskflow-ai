
import express from "express";
import { getAllTasks } from "../controllers/taskController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Require login for all task routes
router.use(authMiddleware);

router.get("/", getAllTasks);

export default router;
