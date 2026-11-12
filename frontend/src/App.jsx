
import { useState } from "react";

import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import TaskList from "./components/TaskList";

import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

import { useAuth } from "./context/AuthContext";
import useConversations from "./hooks/useConversations";

// Main application after login
function AuthenticatedApp() {
  const [activePage, setActivePage] = useState("chat");

  const {
    conversationId,
    conversations,
    isCreatingChat,
    deletingChatId,
    handleSelectChat,
    handleNewChat,
    handleConversationChange,
    handleRefreshChats,
    handleDeleteChat,
  } = useConversations();

  const selectChat = (id) => {
    handleSelectChat(id);
    setActivePage("chat");
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-900">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        conversations={conversations}
        selectedConversationId={conversationId}
        onSelectChat={selectChat}
        onNewChat={() => {
          handleNewChat();
          setActivePage("chat");
        }}
        isCreatingChat={isCreatingChat}
        onDeleteChat={handleDeleteChat}
        deletingChatId={deletingChatId}
      />

      <main className="flex-1 min-w-0 min-h-screen pt-16 md:pt-0 overflow-y-auto bg-gray-900">
        {activePage === "chat" && (
          <ChatWindow
            conversationId={conversationId}
            onConversationChange={handleConversationChange}
            onRefreshChats={handleRefreshChats}
          />
        )}

        {activePage === "tasks" && <TaskList />}
      </main>
    </div>
  );
}

// Authentication and application entry point
function App() {
  const { isAuthenticated, login } = useAuth();

  const [authPage, setAuthPage] = useState("login");

  if (!isAuthenticated) {
    return authPage === "login" ? (
      <Login
        onSwitchToRegister={() => setAuthPage("register")}
        onLoginSuccess={login}
      />
    ) : (
      <Register
        onSwitchToLogin={() => setAuthPage("login")}
        onRegisterSuccess={() => setAuthPage("login")}
      />
    );
  }

  return <AuthenticatedApp />;
}

export default App;
