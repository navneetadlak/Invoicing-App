const TOKEN_KEY = "ai_token";
const AUTH_KEY = "ai_auth";

export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const setAuthPayload = (payload: any) => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(payload));
};
export const getAuthPayload = (): any | null => {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
export const clearAuthPayload = () => localStorage.removeItem(AUTH_KEY);

export const clearAllAuth = () => {
  clearToken();
  clearAuthPayload();
};