import { useState, useEffect, useRef, useCallback } from "react";

import {
  createNewChat,
  getAllChats,
  deleteChat,
} from "../services/chatService";
const STORAGE_KEY = "taskflowConversationId";

export default function useConversations() {
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [deletingChatId, setDeletingChatId] = useState(null);

  // Prevent duplicate requests from rapid clicks.
  const creatingRef = useRef(false);

  // Prevent duplicate initial creation in React StrictMode.
  const initialChatPromise = useRef(null);

  // Load conversations
  const loadConversations = useCallback(async () => {
    const response = await getAllChats();

    if (!response.success) return;

    let chats = response.conversations || [];

    // Create first chat if none exists.
    if (chats.length === 0) {
      if (!initialChatPromise.current) {
        initialChatPromise.current = createNewChat();
      }

      const result = await initialChatPromise.current;

      if (!result.success) return;

      chats = [
        { ...result.conversation, hasMessages: false },
      ];
    }

    setConversations(chats);

    const savedId = localStorage.getItem(STORAGE_KEY);

    const selectedChat = chats.find(
      (chat) => chat.conversationId === savedId
    );

    const selectedId =
      selectedChat?.conversationId || chats[0].conversationId;

    setConversationId(selectedId);
    localStorage.setItem(STORAGE_KEY, selectedId);
  }, []);

  // Initial load
  useEffect(() => {
    loadConversations().catch((error) => {
      console.error("Failed to load conversations:", error);
    });
  }, [loadConversations]);

  // Select existing chat
  const handleSelectChat = useCallback((id) => {
    setConversationId(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  // Create new chat or reuse ANY existing empty chat in the list.
  const handleNewChat = useCallback(async () => {
    if (creatingRef.current) return;

    // Check if there is ANY existing chat in the list that has no messages
    const existingEmptyChat = conversations.find(
      (chat) => !chat.hasMessages
    );

    if (existingEmptyChat) {
      // Reuse the existing empty chat instead of making a new API call
      setConversationId(existingEmptyChat.conversationId);
      localStorage.setItem(STORAGE_KEY, existingEmptyChat.conversationId);
      return;
    }

    creatingRef.current = true;
    setIsCreatingChat(true);

    try {
      const response = await createNewChat();

      if (!response.success) {
        throw new Error(response.message || "Unable to create chat.");
      }

      const newChat = {
        ...response.conversation,
        hasMessages: false,
      };

      setConversations((previous) => [
        newChat,
        ...previous,
      ]);

      setConversationId(newChat.conversationId);

      localStorage.setItem(
        STORAGE_KEY,
        newChat.conversationId
      );
    } catch (error) {
      console.error("Failed to create chat:", error);
      alert(error.message);
    } finally {
      creatingRef.current = false;
      setIsCreatingChat(false);
    }
  }, [conversations]);

  // Update selected conversation after sending a message.
  const handleConversationChange = useCallback((id) => {
    setConversationId(id);
    localStorage.setItem(STORAGE_KEY, id);

    setConversations((previous) =>
      previous.map((chat) =>
        chat.conversationId === id
          ? { ...chat, hasMessages: true }
          : chat
      )
    );
  }, []);

  // Refresh sidebar conversations.
  const handleRefreshChats = useCallback(async () => {
    const response = await getAllChats();

    if (response.success) {
      setConversations(response.conversations || []);
    }
  }, []);
  // Delete conversation
const handleDeleteChat = useCallback(
  async (id) => {
    if (deletingChatId) return;

    setDeletingChatId(id);

    try {
      const response = await deleteChat(id);

      if (!response.success) {
        throw new Error(
          response.message || "Failed to delete chat."
        );
      }

      // Remove deleted conversation from sidebar
      const updatedConversations = conversations.filter(
        (chat) => chat.conversationId !== id
      );

      setConversations(updatedConversations);

      // If deleted conversation was selected
      if (conversationId === id) {
        if (updatedConversations.length > 0) {
          // Select the most recent remaining conversation
          const nextChat = updatedConversations[0];

          setConversationId(nextChat.conversationId);

          localStorage.setItem(
            STORAGE_KEY,
            nextChat.conversationId
          );
        } else {
          // No conversations remaining
          setConversationId(null);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } finally {
      setDeletingChatId(null);
    }
  },
  [conversationId, conversations, deletingChatId]
);

  return {
    conversationId,
    conversations,
    isCreatingChat,
    handleSelectChat,
    handleNewChat,
    handleConversationChange,
    handleRefreshChats,
    handleDeleteChat
  };
}