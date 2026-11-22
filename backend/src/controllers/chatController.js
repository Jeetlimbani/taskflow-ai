import { randomUUID } from "crypto";
import { runTaskAgent } from "../agents/taskAgent.js";
import { analyzeImage } from "../services/visionService.js";
import { uploadImage as uploadImageToCloudinary } from "../services/imageService.js";
import {
  saveMessage,
  getConversationMessages,
  createConversation,
  getAllConversations,
  deleteConversation,
} from "../services/conversationService.js";

// 1. Chat with AI
export const chatWithAI = async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const image = req.file || null;
    const userId = req.user.id;

    if (
      (!message || typeof message !== "string" || !message.trim()) &&
      !image
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a message or upload an image.",
      });
    }

    const currentConversationId = conversationId || randomUUID();

    // Verify conversation ownership before using it
    const existingConversation = await getConversationMessages(
      currentConversationId,
      userId
    );

    if (
      conversationId &&
      !existingConversation.success
    ) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

// Prepare user's message (also supports image-only requests)
// Prepare user's message
const userMessage = message?.trim() || "Please describe this image.";

let agentMessage = userMessage;
let uploadedImageUrl = null;

// Upload image to Cloudinary and analyze it using Groq Vision
if (image) {
  const uploadResult = await uploadImageToCloudinary(image.buffer);

  uploadedImageUrl = uploadResult.imageUrl;

  const imageAnalysis = await analyzeImage(image, userMessage);

  agentMessage = `
The user uploaded an image.

Image analysis:
${imageAnalysis}

User's request:
${userMessage}
`;
}

// Run AI agent with authenticated user ID
const aiResponse = await runTaskAgent(
  agentMessage,
  currentConversationId,
  userId
);

// Save user's message
const userSaveResult = await saveMessage(
  currentConversationId,
  "user",
  userMessage,
  userId,
  uploadedImageUrl
);

    // Save AI response
    const assistantSaveResult = await saveMessage(
      currentConversationId,
      "assistant",
      aiResponse,
      userId
    );

    if (!userSaveResult.success || !assistantSaveResult.success) {
      console.error("Conversation message saving failed.");
    }

    return res.status(200).json({
      success: true,
      conversationId: currentConversationId,
      message: aiResponse,
    });
  } catch (error) {
    console.error("TaskFlow Agent Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while running TaskFlow AI.",
    });
  }
};

// 2. Get chat history
export const getChatHistory = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required",
      });
    }

    const result = await getConversationMessages(
      conversationId,
      userId
    );

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      conversationId,
      messages: result.messages,
    });
  } catch (error) {
    console.error("Get Chat History Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve chat history",
    });
  }
};

// 3. Create a new conversation
export const createNewConversation = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await createConversation(userId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(201).json({
      success: true,
      conversation: result.conversation,
    });
  } catch (error) {
    console.error("Create Conversation Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create conversation",
    });
  }
};

// 4. Get all conversations
export const getAllChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await getAllConversations(userId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      conversations: result.conversations,
    });
  } catch (error) {
    console.error("Get All Conversations Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve conversations",
    });
  }
};

// 5. Delete a conversation
export const deleteChat = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required",
      });
    }

    const result = await deleteConversation(
      conversationId,
      userId
    );

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Delete Chat Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete conversation",
    });
  }
};
