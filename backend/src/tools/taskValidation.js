
import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Task title is required"),
  description: z.string().trim().optional().default(""),
});

export const getTasksSchema = z.object({});

export const completeTaskSchema = z.object({
  taskId: z.string().regex(
    /^[0-9a-fA-F]{24}$/,
    "Invalid MongoDB task ID"
  ),
});
export const updateTaskSchema = z.object({
  taskId: z.string().regex(
    /^[0-9a-fA-F]{24}$/,
    "Invalid MongoDB task ID"
  ),

  title: z.string().min(
    1,
    "Task title cannot be empty"
  ),
});
export const deleteTaskSchema = z.object({
  taskId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB task ID")
});
export const requestDeleteTaskSchema = z.object({
  taskId: z.string().regex(
    /^[0-9a-fA-F]{24}$/,
    "Invalid MongoDB task ID"
  ),
  conversationId: z.string().min(1, "Conversation ID is required"),
});