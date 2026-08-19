import { api } from "./api";

const TOKEN_KEY = "salonepadi_token";
const USER_KEY = "salonepadi_user";

export function saveSession(session, user) {
  if (session?.access_token) {
    localStorage.setItem(TOKEN_KEY, session.access_token);
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const user = localStorage.getItem(USER_KEY);

  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function logout() {
  try {
    await api.logout();
  } finally {
    clearSession();
  }
}
