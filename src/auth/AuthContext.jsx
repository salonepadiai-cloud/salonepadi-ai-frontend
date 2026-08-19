import {
  createContext,
  useEffect,
  useState
} from "react";

import {
  getCurrentUser,
  login as loginService,
  logout as logoutService,
  signup as signupService
} from "../services/authService";

import {
  getToken,
  getUser,
  clearStorage
} from "../utils/storage";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      if (!getToken()) {
        setLoading(false);
        return;
      }

      try {
        const data = await getCurrentUser();
        setUser(data.user || null);
      } catch {
        clearStorage();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  async function login(email, password) {
    const data = await loginService(email, password);
    setUser(data.user);
    return data;
  }

  async function signup(name, email, password) {
    const data = await signupService(
      name,
      email,
      password
    );

    if (data.user) {
      setUser(data.user);
    }

    return data;
  }

  async function logout() {
    await logoutService();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authenticated: Boolean(user),
        login,
        signup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
      }
