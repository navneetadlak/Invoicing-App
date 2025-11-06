import React, { createContext, useCallback, useEffect, useState } from "react";
import { setToken, setAuthPayload, getAuthPayload, clearAllAuth } from "../utils/helper";
import { AuthAPI } from "../services/services";

type User = { userID: number; firstName: string; lastName?: string; email: string } | null;
type Company = { companyID: number; companyName: string; currencySymbol?: string } | null;
type AuthState = { token?: string | null; user?: User; company?: Company } | null;

type AuthContextType = {
  auth: AuthState;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // on mount: restore auth from localStorage once
  useEffect(() => {
    const saved = getAuthPayload();
    if (saved && saved.token) {
      setAuth({ token: saved.token, user: saved.user, company: saved.company });
      // ensure token key is set for axios
      setToken(saved.token);
    } else {
      setAuth(null);
    }
    setInitialized(true);
  }, []);

  // listen for 401-driven global logout (from axios interceptor)
  useEffect(() => {
    const handle = () => setAuth(null);
    window.addEventListener("auth:loggedOut", handle);
    return () => window.removeEventListener("auth:loggedOut", handle);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await AuthAPI.login(email, password);
      // assume API returns { token, user, company }
      setToken(data.token);
      setAuthPayload(data);
      setAuth({ token: data.token, user: data.user, company: data.company });
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (payload: any) => {
    setLoading(true);
    try {
      const form = new FormData();
      for (const [k, v] of Object.entries(payload)) form.append(k, v as any);
      const { data } = await AuthAPI.signup(form);
      setToken(data.token);
      setAuthPayload(data);
      setAuth({ token: data.token, user: data.user, company: data.company });
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearAllAuth();
    setAuth(null);
  }, []);

  return (
    <AuthContext.Provider value={{ auth, initialized, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
