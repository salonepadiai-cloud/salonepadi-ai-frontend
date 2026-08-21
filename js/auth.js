import { CONFIG } from "./config.js";

import {
  getToken,
  getUser,
  saveToken,
  saveUser,
  clearStorage
} from "./utils/storage.js";

export function authenticated() {
  return Boolean(getToken() && getUser());
}

export async function login(email, password) {
  return request("/api/auth/login", {
    method: "POST",
    body: {
      email,
      password
    }
  });
}

export async function signup(name, email, password) {
  return request("/api/auth/signup", {
    method: "POST",
    body: {
      name,
      email,
      password
    }
  });
}

export async function logout() {
  const token = getToken();

  try {
    if (token) {
      await request("/api/auth/logout", {
        method: "POST",
        token
      });
    }
  } finally {
    clearStorage();
  }
}

export function currentUser() {
  return getUser();
}

async function request(endpoint, options = {}) {
  if (!CONFIG.apiUrl) {
    throw new Error(
      "Backend API URL has not been configured."
    );
  }

  const headers = {
    "Content-Type": "application/json"
  };

  const token = options.token || getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(
      `${CONFIG.apiUrl}${endpoint}`,
      {
        method: options.method || "GET",
        headers,
        body: options.body
          ? JSON.stringify(options.body)
          : undefined
      }
    );
  } catch (error) {
    console.error("SalonePadi AI API error:", error);

    throw new Error(
      "Unable to connect to SalonePadi AI server."
    );
  }

  const contentType =
    response.headers.get("content-type") || "";

  let data;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();

    data = {
      message: text
    };
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
      data?.message ||
      "Request failed."
    );
  }

  if (data.session?.access_token) {
    saveToken(data.session.access_token);
  }

  if (data.user) {
    saveUser(data.user);
  }

  return data;
}
