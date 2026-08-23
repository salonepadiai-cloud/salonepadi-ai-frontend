import { CONFIG } from "./config.js";
import {
  getToken,
  clearStorage
} from "./utils/storage.js";

async function request(endpoint, options = {}) {
  if (!CONFIG.apiUrl) {
    throw new Error(
      "Backend API URL has not been configured."
    );
  }

  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(
      `${CONFIG.apiUrl}${endpoint}`,
      {
        ...options,
        headers
      }
    );
  } catch (error) {
    console.error(
      "API connection error:",
      error
    );

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

  /*
   * Only clear the local session when the backend
   * explicitly tells us that the authentication
   * token is invalid.
   */
  if (response.status === 401) {
    clearStorage();

    throw new Error(
      "Your session is invalid or has expired. Please log in again."
    );
  }

  if (!response.ok) {
    const message =
      typeof data === "object"
        ? data?.error ||
          data?.message ||
          "Request failed."
        : data;

    throw new Error(
      message || "Request failed."
    );
  }

  return data;
}

export const api = {
  get(endpoint) {
    return request(endpoint, {
      method: "GET"
    });
  },

  post(endpoint, body = {}) {
    return request(endpoint, {
      method: "POST",
      body: JSON.stringify(body)
    });
  },

  patch(endpoint, body = {}) {
    return request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body)
    });
  },

  delete(endpoint) {
    return request(endpoint, {
      method: "DELETE"
    });
  }
};
