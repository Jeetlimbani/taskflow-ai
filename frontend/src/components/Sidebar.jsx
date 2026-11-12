
import { useState } from "react";

import {
  FiPlus,
  FiMessageSquare,
  FiCheckSquare,
  FiMenu,
  FiX,
  FiMoreVertical,
  FiTrash2,
  FiLogOut,
} from "react-icons/fi";

import { useAuth } from "../context/AuthContext";

function Sidebar({
  activePage,
  onNavigate,
  conversations,
  selectedConversationId,
  onSelectChat,
  onNewChat,
  isCreatingChat,
  onDeleteChat,
  deletingChatId,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  const { user, logout } = useAuth();

  const handleNavigate = (page) => {
    onNavigate(page);
    setIsOpen(false);
  };

  const handleSelectChat = (conversationId) => {
    onSelectChat(conversationId);
    setIsOpen(false);
  };

  const handleNewChat = () => {
    onNewChat();
    setIsOpen(false);
  };

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmed) return;

    logout();
  };

  const handleDeleteChat = async (chat) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${chat.title || "New Chat"}"?`
    );

    if (!confirmed) return;

    setOpenMenuId(null);

    try {
      await onDeleteChat(chat.conversationId);
    } catch (error) {
      alert(error.message || "Failed to delete chat.");
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 w-full z-30 bg-gray-950 text-white p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">
          TaskFlow <span className="text-blue-500">AI</span>
        </h1>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white text-2xl"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 z-30"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-40
          w-64 bg-gray-950 text-white
          h-screen shrink-0 p-5 flex flex-col
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* App Logo */}
        <h1 className="hidden md:block text-2xl font-bold mb-8">
          TaskFlow <span className="text-blue-500">AI</span>
        </h1>

        {/* New Chat Button */}
        <button
          onClick={handleNewChat}
          disabled={isCreatingChat}
          className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed p-3 rounded-lg mb-6"
        >
          <FiPlus size={20} />
          {isCreatingChat ? "Creating..." : "New Chat"}
        </button>

        {/* Navigation */}
        <div className="space-y-3 shrink-0">
          <button
            onClick={() => handleNavigate("chat")}
            className={`w-full flex items-center gap-3 p-2 rounded-lg ${
              activePage === "chat" && !selectedConversationId
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FiMessageSquare />
            <span>Chats</span>
          </button>

          <button
            onClick={() => handleNavigate("tasks")}
            className={`w-full flex items-center gap-3 p-2 rounded-lg ${
              activePage === "tasks"
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FiCheckSquare />
            <span>My Tasks</span>
          </button>
        </div>

        {/* Previous Conversations */}
        <div className="mt-6 flex-1 min-h-0 flex flex-col">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">
            Recent Chats
          </h3>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {conversations.length === 0 ? (
              <p className="text-sm text-gray-500 px-2">
                No previous chats
              </p>
            ) : (
              conversations.map((chat) => (
                <div
                  key={chat.conversationId}
                  className={`group relative flex items-center rounded-lg transition-colors ${
                    selectedConversationId === chat.conversationId
                      ? "bg-gray-800"
                      : "hover:bg-gray-900"
                  }`}
                >
                  {/* Chat Select Button */}
                  <button
                    onClick={() => handleSelectChat(chat.conversationId)}
                    className={`flex-1 min-w-0 flex items-center gap-3 p-2 text-left text-sm ${
                      selectedConversationId === chat.conversationId
                        ? "text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                    title={chat.title || "New Chat"}
                  >
                    <FiMessageSquare size={16} className="shrink-0" />

                    <span className="truncate">
                      {chat.title || "New Chat"}
                    </span>
                  </button>

                  {/* Three Dot Menu */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(
                        openMenuId === chat.conversationId
                          ? null
                          : chat.conversationId
                      );
                    }}
                    className="p-2 mr-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="More options"
                  >
                    <FiMoreVertical size={17} />
                  </button>

                  {/* Dropdown Menu */}
                  {openMenuId === chat.conversationId && (
                    <div className="absolute right-2 top-10 z-50 w-36 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-1">
                      <button
                        onClick={() => handleDeleteChat(chat)}
                        disabled={deletingChatId === chat.conversationId}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiTrash2 size={15} />

                        {deletingChatId === chat.conversationId
                          ? "Deleting..."
                          : "Delete Chat"}
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-4 border-t border-gray-800 pt-4 shrink-0">
          <p className="text-white text-sm font-medium truncate">
            {user?.name || "User"}
          </p>

          <p className="text-gray-500 text-xs truncate mt-1">
            {user?.email || ""}
          </p>

          <p className="text-gray-400 text-xs mt-3 mb-3">
            Your personal AI assistant
          </p>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-lg p-2 text-red-400 hover:bg-gray-800 hover:text-red-300 transition"
          >
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
