import React, { createContext, useEffect, useState } from "react";
import { setToken, setAuthPayload, getToken as clearToken, getAuthPayload as _getAuthPayload } from "../utils/helper";
import { AuthAPI } from "../services/services";

type User = {
    userID: number;
    firstName: string;
    lastName?: string;
    email: string;
} | null;

type Company = {
    companyID: number;
    companyName: string;
    currencySymbol?: string;
} | null;

type AuthState = {
    token?: string | null;
    user?: User;
    company?: Company;
} | null;

type AuthContextType = {
    auth: AuthState;
    login: (email: string, password: string) => Promise<void>;
    signup: (payload: any) => Promise<void>;
    logout: () => void;
    loading: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [auth, setAuth] = useState<AuthState>(null);
    const [loading, setLoading] = useState(false);

    // Load saved auth on start
    useEffect(() => {
        const saved = _getAuthPayload();
        if (saved && saved.token) {
            setAuth({ token: saved.token, user: saved.user, company: saved.company });
            localStorage.setItem("token", saved.token);
        }
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const { data } = await AuthAPI.login(email, password);
            setToken(data.token);
            setAuthPayload(data);
            setAuth({ token: data.token, user: data.user, company: data.company });
        } finally {
            setLoading(false);
        }
    };

    const signup = async (payload: any) => {
        setLoading(true);
        try {
            const formData = new FormData();
            for (const [key, value] of Object.entries(payload)) {
                formData.append(key, value as any);
            }
            const { data } = await AuthAPI.signup(formData);
            setToken(data.token);
            setAuthPayload(data);
            setAuth({ token: data.token, user: data.user, company: data.company });
        } finally {
            setLoading(false);
        }
    };


    const logout = () => {
        clearToken();
        setAuth(null);
    };

    return (
        <AuthContext.Provider value={{ auth, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};