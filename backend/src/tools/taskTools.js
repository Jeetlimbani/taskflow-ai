
import Task from "../models/taskModel.js";
import { pendingDeletions } from "./confirmationStorage.js";

// 1. Create a task
export const createTask = async ({
  title,
  description = "",
  userId,
}) => {
  try {
    const task = await Task.create({
      title,
      description,
      userId,
    });

    return {
      success: true,
      message: "Task created successfully",
      task,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to create task",
    };
  }
};

// 2. Get all tasks belonging to a user
export const getTasks = async ({ userId }) => {
  try {
    const tasks = await Task.find({ userId }).sort({
      createdAt: -1,
    });

    return {
      success: true,
      tasks,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch tasks",
    };
  }
};

// 3. Update a task
export const updateTask = async ({ taskId, title, userId }) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: taskId, userId },
      { title },
      { returnDocument: "after", runValidators: true }
    );

    if (!task) {
      return {
        success: false,
        message: "Task not found",
      };
    }

    return {
      success: true,
      message: "Task updated successfully",
      task,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to update task",
    };
  }
};

// 4. Complete a task
export const completeTask = async ({ taskId, userId }) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: taskId, userId },
      { completed: true },
      { returnDocument: "after", runValidators: true }
    );

    if (!task) {
      return {
        success: false,
        message: "Task not found",
      };
    }

    return {
      success: true,
      message: "Task completed successfully",
      task,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to complete task",
    };
  }
};

// 5. Delete a task
export const deleteTask = async ({ taskId, userId }) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: taskId,
      userId,
    });

    if (!task) {
      return {
        success: false,
        message: "Task not found",
      };
    }

    // Remove pending confirmation for this user's task
    for (const [key, pendingTaskId] of pendingDeletions) {
      if (pendingTaskId === taskId && key.startsWith(`${userId}:`)) {
        pendingDeletions.delete(key);
      }
    }

    return {
      success: true,
      message: "Task deleted successfully",
      task,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to delete task",
    };
  }
};

// 6. Find a task by title
export const findTaskByTitle = async ({ title, userId }) => {
  try {
    const matchingTasks = await Task.find({
      userId,
      title: { $regex: `^${title}$`, $options: "i" },
    });

    if (matchingTasks.length === 0) {
      return {
        success: false,
        message: "Task not found",
      };
    }

    if (matchingTasks.length > 1) {
      return {
        success: false,
        message: "Multiple tasks have this title. Please clarify.",
        tasks: matchingTasks,
      };
    }

    return {
      success: true,
      task: matchingTasks[0],
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to find task",
    };
  }
};

// 7. Request task deletion (confirmation required)
export const requestDeleteTask = async ({
  taskId,
  conversationId,
  userId,
}) => {
  if (!conversationId) {
    return {
      success: false,
      message: "Conversation ID is required",
    };
  }

  try {
    const task = await Task.findOne({
      _id: taskId,
      userId,
    });

    if (!task) {
      return {
        success: false,
        message: "Task not found",
      };
    }

    // Keep confirmation separate for each user and conversation
    const confirmationKey = `${userId}:${conversationId}`;

    pendingDeletions.set(confirmationKey, task.id);

    return {
      success: true,
      confirmationRequired: true,
      message: `Are you sure you want to delete "${task.title}"?`,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to request task deletion",
    };
  }
};
