
import express from "express";

import {
  chatWithAI,
  getChatHistory,
  createNewConversation,
  getAllChats,
  deleteChat,
} from "../controllers/chatController.js";

import uploadImage from "../middleware/uploadMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect every chat route
router.use(authMiddleware);

router.post("/conversations", createNewConversation);
router.get("/conversations", getAllChats);
router.post("/", uploadImage, chatWithAI);
router.get("/:conversationId", getChatHistory);
router.delete("/conversations/:conversationId", deleteChat);

export default router;
