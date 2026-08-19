const API_URL = import.meta.env.VITE_API_URL;

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("salonepadi_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong.");
  }

  return data;
}

export const api = {
  signup: (data) =>
    request("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  login: (data) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  me: () =>
    request("/api/auth/me"),

  logout: () =>
    request("/api/auth/logout", {
      method: "POST"
    }),

  conversations: () =>
    request("/api/chat/conversations"),

  createConversation: (title) =>
    request("/api/chat/conversations", {
      method: "POST",
      body: JSON.stringify({ title })
    }),

  messages: (conversationId) =>
    request(`/api/chat/conversations/${conversationId}/messages`),

  sendMessage: (conversationId, message) =>
    request(`/api/chat/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ message })
    }),

  memories: () =>
    request("/api/memory"),

  saveMemory: (data) =>
    request("/api/memory", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  deleteMemory: (id) =>
    request(`/api/memory/${id}`, {
      method: "DELETE"
    }),

  profile: () =>
    request("/api/user/profile"),

  updateProfile: (data) =>
    request("/api/user/profile", {
      method: "PATCH",
      body: JSON.stringify(data)
    })
};
