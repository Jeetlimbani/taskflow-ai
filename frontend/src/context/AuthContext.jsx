
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    () => localStorage.getItem("taskflowToken")
  );

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("taskflowUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (data) => {
    localStorage.setItem("taskflowToken", data.token);
    localStorage.setItem("taskflowUser", JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("taskflowToken");
    localStorage.removeItem("taskflowUser");
    localStorage.removeItem("taskflowConversationId");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
