import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import client from "../api/client";

interface AuthState {
  token: string | null;
  user: { id: number; email: string; name: string | null; role: string } | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthState["user"]>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("adminToken");
    const storedUser = window.localStorage.getItem("adminUser");
    if (stored) {
      setToken(stored);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  useEffect(() => {
    client.defaults.headers.common.Authorization = token ? `Bearer ${token}` : "";
  }, [token]);

  const login = async (email: string, password: string) => {
    const response = await client.post("/auth/login", { email, password });
    const { token: newToken, user: newUser } = response.data;
    setToken(newToken);
    setUser(newUser);
    window.localStorage.setItem("adminToken", newToken);
    window.localStorage.setItem("adminUser", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    window.localStorage.removeItem("adminToken");
    window.localStorage.removeItem("adminUser");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

