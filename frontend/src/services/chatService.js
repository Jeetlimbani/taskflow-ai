
import api from "./api";

const API_URL = "/chat";

// Send message to AI

// Send text and optional image to AI
export const sendMessageToAI = async (
  message,
  conversationId,
  imageFile = null
) => {
  try {
    const formData = new FormData();

    formData.append("message", message || "");
    formData.append("conversationId", conversationId);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    const response = await api.post(API_URL, formData);

    return response.data;
  } catch (error) {
    console.error("Chat API Error:", error);

    if (error.response) {
      throw new Error(
        error.response.data.message || "Server error occurred."
      );
    }

    if (error.request) {
      throw new Error(
        "Unable to connect to the server. Please check your connection."
      );
    }

    throw new Error("Something went wrong. Please try again.");
  }
};


// Get previous conversation history
export const getChatHistory = async (conversationId) => {
  try {
    const response = await api.get(`${API_URL}/${conversationId}`);

    return response.data;
  } catch (error) {
    console.error("Get Chat History Error:", error);

    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to load conversation."
      );
    }

    throw new Error("Unable to connect to the server. Please try again.");
  }
};

// Create a new conversation
export const createNewChat = async () => {
  try {
    const response = await api.post(`${API_URL}/conversations`);

    return response.data;
  } catch (error) {
    console.error("Create Chat Error:", error);

    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to create new chat."
      );
    }

    throw new Error("Unable to connect to the server. Please check your connection.");
  }
};

// Get all conversations
export const getAllChats = async () => {
  try {
    const response = await api.get(`${API_URL}/conversations`);

    return response.data;
  } catch (error) {
    console.error("Get All Chats Error:", error);

    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to load conversations."
      );
    }

    throw new Error("Unable to connect to the server. Please check your connection.");
  }
};

// Delete a conversation
export const deleteChat = async (conversationId) => {
  try {
    const response = await api.delete(
      `${API_URL}/conversations/${conversationId}`
    );

    return response.data;
  } catch (error) {
    console.error("Delete Chat Error:", error);

    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to delete chat."
      );
    }

    throw new Error("Unable to connect to the server. Please check your connection.");
  }
};
