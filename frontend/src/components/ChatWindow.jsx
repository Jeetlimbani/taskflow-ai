import { useState, useEffect, useRef } from "react";

import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

import {
  sendMessageToAI,
  getChatHistory,
} from "../services/chatService";

function ChatWindow({
  conversationId,
  onConversationChange,
  onRefreshChats,
}) {
  const [messages, setMessages] = useState([]);
  const [failedMessage, setFailedMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);

  // Load messages whenever the selected conversation changes
  useEffect(() => {
    let isActive = true;

    const loadChatHistory = async () => {
      setMessages([]);
      setFailedMessage("");
      setError("");

      if (!conversationId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const response = await getChatHistory(conversationId);

        if (isActive && response.success) {
          setMessages(
            response.messages.map((message) => ({
              id: message._id,
              role: message.role,
              content: message.content,
            }))
          );
        }
      } catch (error) {
        if (isActive) {
          setError(
            error.message || "Unable to load previous conversation."
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadChatHistory();

    return () => {
      isActive = false;
    };
  }, [conversationId]);

  // Send message to AI
  const handleSendMessage = async (message) => {
    if (!conversationId) {
      setError("Please create a new chat before sending a message.");
      return;
    }

    const currentConversationId = conversationId;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: message,
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
    ]);

    setLoading(true);
    setError("");
    setFailedMessage("");

    try {
      const response = await sendMessageToAI(
        message,
        currentConversationId
      );

      if (response.conversationId) {
        onConversationChange(response.conversationId);
      }

      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: response.message,
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        aiMessage,
      ]);

      await onRefreshChats();

    } catch (error) {
      setError(error.message || "Unable to send message.");
      setFailedMessage(message);

    } finally {
      setLoading(false);
    }
  };

  // Retry failed message
  const handleRetry = async () => {
    if (!failedMessage || loading || !conversationId) return;

    const currentConversationId = conversationId;
    const messageToRetry = failedMessage;

    setLoading(true);
    setError("");

    try {
      const response = await sendMessageToAI(
        messageToRetry,
        currentConversationId
      );

      if (response.conversationId) {
        onConversationChange(response.conversationId);
      }

      const aiMessage = {
        id: Date.now(),
        role: "assistant",
        content: response.message,
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        aiMessage,
      ]);

      setFailedMessage("");

      await onRefreshChats();

    } catch (error) {
      setError(error.message || "Retry failed. Please try again.");

    } finally {
      setLoading(false);
    }
  };

  // Automatically scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  return (
    <div className="flex-1 min-w-0 bg-gray-900 text-white h-screen flex flex-col overflow-hidden">

      {/* Header */}
      <header className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-800 shrink-0">
        <h2 className="text-base sm:text-lg font-semibold">
          AI Assistant
        </h2>

        <p className="text-xs sm:text-sm text-gray-400">
          Your personal task management assistant
        </p>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-5 sm:px-6 sm:py-6 md:p-8">
        <div className="max-w-3xl mx-auto w-full">

          {/* Welcome Message */}
          {messages.length === 0 && !loading && (
            <div className="text-center mb-10 mt-10 px-2">
              <h1 className="text-2xl sm:text-3xl font-bold mb-3">
                Welcome to TaskFlow AI
              </h1>

              <p className="text-sm sm:text-base text-gray-400">
                How can I help you manage your tasks today?
              </p>
            </div>
          )}

          {/* Conversation Messages */}
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              role={message.role}
              content={message.content}
            />
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div
              className="flex items-center gap-3 mb-5"
              role="status"
              aria-live="polite"
            >
              <div className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-3 sm:px-4 flex items-center gap-3">
                <span className="text-xs sm:text-sm text-gray-300">
                  TaskFlow AI is thinking
                </span>

                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4">
              <p className="text-sm sm:text-base text-red-400 mb-2">
                {error}
              </p>

              {failedMessage && (
                <button
                  onClick={handleRetry}
                  disabled={loading}
                  className="text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg"
                >
                  {loading ? "Retrying..." : "Try Again"}
                </button>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <div className="px-3 py-3 sm:px-6 sm:py-4 border-t border-gray-800 shrink-0 bg-gray-900">
        <div className="max-w-3xl mx-auto w-full">
          <ChatInput
            onSend={handleSendMessage}
            disabled={loading || !conversationId}
          />
        </div>
      </div>

    </div>
  );
}

export default ChatWindow;