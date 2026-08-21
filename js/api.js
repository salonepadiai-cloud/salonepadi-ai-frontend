import { CONFIG } from "./config.js";
import {
  getToken,
  clearStorage
} from "./utils/storage.js";

async function request(
  endpoint,
  options = {}
) {
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
    headers.Authorization =
      `Bearer ${token}`;
  }

  const response = await fetch(
    `${CONFIG.apiUrl}${endpoint}`,
    {
      ...options,
      headers
    }
  );

  const contentType =
    response.headers.get("content-type");

  const data =
    contentType?.includes(
      "application/json"
    )
      ? await response.json()
      : await response.text();

  if (response.status === 401) {
    clearStorage();

    throw new Error(
      "Your session has expired."
    );
  }

  if (!response.ok) {
    const message =
      typeof data === "object"
        ? data.error ||
          data.message
        : data;

    throw new Error(
      message || "Request failed."
    );
  }

  return data;
}

export const api = {
  get(endpoint) {
    return request(endpoint);
  },

  post(endpoint, body) {
    return request(endpoint, {
      method: "POST",
      body: JSON.stringify(body)
    });
  }
};
