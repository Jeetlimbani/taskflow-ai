import Groq from "groq-sdk";
import "dotenv/config";
import { getConversationMessages } from "../services/conversationService.js";
import {
  createTask,
  getTasks,
  completeTask,
  updateTask,
  deleteTask,
  requestDeleteTask,
} from "../tools/taskTools.js";

import { pendingDeletions } from "../tools/confirmationStorage.js";

import {
  createTaskSchema,
  getTasksSchema,
  completeTaskSchema,
  updateTaskSchema,
  requestDeleteTaskSchema,
} from "../tools/taskValidation.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Available tools for the AI Agent
const tools = [
  {
    type: "function",
    function: {
      name: "createTask",
      description: "Create a new task for the user.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "The task title",
          },
          description: {
            type: "string",
            description: "Optional task description",
          },
        },
        required: ["title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getTasks",
      description: "Get all tasks of the user.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "completeTask",
      description: "Mark a task as completed using its ID.",
      parameters: {
        type: "object",
        properties: {
          taskId: {
            type: "string",
            description: "The task ID",
          },
        },
        required: ["taskId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "updateTask",
      description: "Update a task's title  using its ID.",
      parameters: {
        type: "object",
        properties: {
          taskId: {
            type: "string",
            description: "The task ID",
          },
          title: {
            type: "string",
            description: "The updated task title",
          },
        },
        required: ["taskId", "title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "requestDeleteTask",
      description:
        "Request deletion of a task. Always use this when the user asks to delete a task. Never delete directly.",
      parameters: {
        type: "object",
        properties: {
          taskId: {
            type: "string",
            description: "ID of the task to delete",
          },
        },
        required: ["taskId"],
      },
    },
  },
];

// Only expose safe tools to the AI.
// deleteTask is deliberately excluded because the backend
// calls it only after the user confirms deletion.
const availableFunctions = {
  createTask,
  getTasks,
  completeTask,
  updateTask,
  requestDeleteTask,
};

const toolSchemas = {
  createTask: createTaskSchema,
  getTasks: getTasksSchema,
  completeTask: completeTaskSchema,
  updateTask:updateTaskSchema,
  requestDeleteTask: requestDeleteTaskSchema,
};

// Validate and execute AI tool calls

export const executeToolCall = async (
  toolCall,
  conversationId,
  userId
) => {
  try {
    const functionName = toolCall.function.name;

    const selectedFunction = availableFunctions[functionName];
    const selectedSchema = toolSchemas[functionName];

    if (!selectedFunction || !selectedSchema) {
      return {
        success: false,
        message: "Unknown tool requested.",
      };
    }

    const functionArgs = JSON.parse(
      toolCall.function.arguments
    );

    // Always get userId from authenticated backend data.
    functionArgs.userId = userId;

    // Add conversationId from the backend.
    if (functionName === "requestDeleteTask") {
      functionArgs.conversationId = conversationId;
    }

    const validationResult = selectedSchema.safeParse(
      functionArgs
    );

    if (!validationResult.success) {
      return {
        success: false,
        message: "Invalid tool arguments.",
        errors: validationResult.error.issues.map(
          (issue) => issue.message
        ),
      };
    }

    return await selectedFunction({
      ...validationResult.data,
      userId,
    });  } catch (error) {
    console.error("Tool Execution Error:", error);

    return {
      success: false,
      message: "Tool execution failed.",
    };
  }
};


// Main AI Agent function

export const runTaskAgent = async (
  userMessage,
  conversationId,
  userId
) => {
  // Unique confirmation key for each user and conversation
  const confirmationKey = `${userId}:${conversationId}`;

  // Handle pending deletion confirmation
  const pendingTaskId = pendingDeletions.get(confirmationKey);

  if (pendingTaskId) {
    const confirmation = userMessage.trim().toLowerCase();

    if (confirmation === "yes") {
      const result = await deleteTask({
        taskId: pendingTaskId,
        userId,
      });

      pendingDeletions.delete(confirmationKey);

      return result.success
        ? "Your task has been deleted successfully."
        : result.message;
    }

    if (confirmation === "no") {
      pendingDeletions.delete(confirmationKey);

      return "Deletion cancelled. Your task is safe.";
    }

    return "Please reply Yes to confirm deletion or No to cancel it.";
  }

  // Get conversation history
  const historyResult = await getConversationMessages(
    conversationId,
    userId
  );
  if (
    !historyResult.success &&
    historyResult.message !== "Conversation not found"
  ) {
    return historyResult.message;
  }
  const conversationMessages = historyResult.success
    ? historyResult.messages
    : [];

  const messages = [
    {
      role: "system",
      content: `
        You are TaskFlow AI, a personal task management assistant.

        You can create, view, update, and complete tasks using the available tools.
        You can also request task deletion with user confirmation.

        General rules:
        1. Ask for a task title if it is missing.
        2. Use getTasks when the user asks to view tasks.
        3. Before completing or deleting a task, identify the correct task ID using getTasks.
        4. Never invent task IDs.
        5. If a task is ambiguous, ask the user to clarify.
        6. If a tool returns success: false, explain the error to the user.
        7. Never tell the user an action succeeded unless the tool confirms success.
        8. Do not invent task information.
        9. Before updating a task, use getTasks to identify the correct task ID.

        Deletion rules:
        1. First use getTasks to identify the correct task.
        2. Never delete a task directly.
        3. Use requestDeleteTask to request confirmation.
        4. Wait for the user to confirm separately.
        5. Never claim deletion succeeded before confirmation.
        6. When requestDeleteTask returns confirmationRequired: true,
           ask the user to reply Yes to confirm or No to cancel it.
      `,
    },

    ...conversationMessages.map((message) => ({
            role: message.role,
      content: message.content,
    })),

    {
      role: "user",
      content: userMessage,
    },
  ];

  let response = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL,
    messages,
    tools,
    tool_choice: "auto",
    temperature: 0,
  });

  let assistantMessage = response.choices[0].message;

  let iterations = 0;
  const MAX_ITERATIONS = 5;

  while (assistantMessage.tool_calls?.length) {
    if (iterations >= MAX_ITERATIONS) {
      throw new Error("Maximum tool execution limit reached");
    }

    iterations++;

    messages.push(assistantMessage);

    for (const toolCall of assistantMessage.tool_calls) {
      const functionResult = await executeToolCall(
        toolCall,
        conversationId,
        userId
      );

      console.log(
        `[Agent Tool Execution] ${toolCall.function.name}:`,
        functionResult
      );

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        name: toolCall.function.name,
        content: JSON.stringify(functionResult),
      });
    }

    response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL,
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0,
    });

    assistantMessage = response.choices[0].message;
  }

  return assistantMessage.content || "Your request has been processed.";
};
