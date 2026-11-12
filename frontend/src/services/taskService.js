
import api from "./api";

const API_URL = "/tasks";

// Get all tasks from backend
export const getAllTasks = async () => {
  try {
    const response = await api.get(API_URL);

    return response.data;
  } catch (error) {
    console.error("Get Tasks API Error:", error);

    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to load tasks."
      );
    }

    throw new Error(
      "Unable to connect to the server. Please check your connection."
    );
  }
};
