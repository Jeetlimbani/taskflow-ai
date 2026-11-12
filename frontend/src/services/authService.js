
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5001/api"}/auth`;

// Register a new user
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Registration failed"
    );
  }
};

// Login an existing user
export const loginUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, userData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Login failed"
    );
  }
};
