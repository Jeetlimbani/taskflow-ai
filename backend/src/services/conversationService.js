
import { randomUUID } from "crypto";
import Conversation from "../models/conversationModel.js";

// 1. Create a new conversation
export const createConversation = async (userId) => {
  try {
    const conversation = await Conversation.create({
      userId,
      conversationId: randomUUID(),
      title: "New Chat",
      messages: [],
    });

    return {
      success: true,
      conversation,
    };
  } catch (error) {
    console.error("Create Conversation Error:", error.message);

    return {
      success: false,
      message: "Failed to create conversation",
    };
  }
};

// 2. Get all conversations belonging to a user
export const getAllConversations = async (userId) => {
  try {
    const conversations = await Conversation.find({ userId })
      .select("conversationId title createdAt updatedAt messages")
      .sort({ updatedAt: -1 })
      .lean();

    const formattedConversations = conversations.map(
      ({ messages = [], ...conversation }) => ({
        ...conversation,
        hasMessages: messages.length > 0,
      })
    );

    return {
      success: true,
      conversations: formattedConversations,
    };
  } catch (error) {
    console.error("Get All Conversations Error:", error.message);

    return {
      success: false,
      message: "Failed to retrieve conversations",
    };
  }
};

// 3. Save a user or assistant message
export const saveMessage = async (
  conversationId,
  role,
  content,
  userId
) => {
  try {
    let conversation = await Conversation.findOne({
      conversationId,
      userId,
    });

    // Create conversation if it doesn't exist
    if (!conversation) {
      conversation = new Conversation({
        userId,
        conversationId,
        title: "New Chat",
        messages: [],
      });
    }

    // Set title using the first user message
    const hasUserMessage = conversation.messages.some(
      (message) => message.role === "user"
    );

    if (role === "user" && !hasUserMessage) {
      const trimmedTitle = content.trim();

      conversation.title =
        trimmedTitle.length > 40
          ? trimmedTitle.substring(0, 40) + "..."
          : trimmedTitle;
    }

    conversation.messages.push({
      role,
      content,
    });

    await conversation.save();

    return {
      success: true,
      conversation,
    };
  } catch (error) {
    console.error("Save Message Error:", error.message);

    return {
      success: false,
      message: "Failed to save message",
    };
  }
};

// 4. Get complete conversation belonging to a user
export const getConversation = async (conversationId, userId) => {
  try {
    const conversation = await Conversation.findOne({
      conversationId,
      userId,
    });

    return {
      success: true,
      conversation,
    };
  } catch (error) {
    console.error("Get Conversation Error:", error.message);

    return {
      success: false,
      message: "Failed to retrieve conversation",
    };
  }
};

// 5. Get messages from a user's conversation
export const getConversationMessages = async (
  conversationId,
  userId
) => {
  try {
    const conversation = await Conversation.findOne({
      conversationId,
      userId,
    }).select("messages");

    if (!conversation) {
      return {
        success: false,
        message: "Conversation not found",
      };
    }

    return {
      success: true,
      messages: conversation.messages,
    };
  } catch (error) {
    console.error(
      "Get Conversation Messages Error:",
      error.message
    );

    return {
      success: false,
      message: "Failed to retrieve conversation messages",
    };
  }
};

// 6. Delete a user's conversation
export const deleteConversation = async (
  conversationId,
  userId
) => {
  try {
    const conversation = await Conversation.findOneAndDelete({
      conversationId,
      userId,
    });

    if (!conversation) {
      return {
        success: false,
        message: "Conversation not found",
      };
    }

    return {
      success: true,
      message: "Conversation deleted successfully",
    };
  } catch (error) {
    console.error("Delete Conversation Error:", error.message);

    return {
      success: false,
      message: "Failed to delete conversation",
    };
  }
};
