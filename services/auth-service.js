// JOHNNY TEC OS — services/auth-service.js

const SESSION_KEY = 'jt_session';

const AuthService = {
  async signup(email, password, name) {
    const data = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: { email, password, name },
    });
    if (data.session) this.saveSession(data.session, data.user);
    return data;
  },

  async login(email, password) {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    this.saveSession(data.session, data.user);
    return data;
  },

  async logout() {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST', auth: true });
    } catch (_) {
      // Even if the server call fails, still clear the local session.
    }
    this.clearSession();
  },

  saveSession(session, user) {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ token: session?.access_token || null, user: user || null })
    );
  },

  clearSession() {
    localStorage.removeItem(SESSION_KEY);
  },

  getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch (_) {
      return null;
    }
  },

  getToken() {
    return this.getSession()?.token || null;
  },

  getUser() {
    return this.getSession()?.user || null;
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};
