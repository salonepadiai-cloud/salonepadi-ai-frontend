import { API_URL } from "./config.js";
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
  const response = await fetch(
    `${API_URL}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    }
  );

  const data = await readResponse(response);

  if (!response.ok) {
    throw new Error(
      data.error ||
      data.message ||
      "Login failed."
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

export async function signup(
  name,
  email,
  password
) {
  const response = await fetch(
    `${API_URL}/api/auth/signup`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        password
      })
    }
  );

  const data = await readResponse(response);

  if (!response.ok) {
    throw new Error(
      data.error ||
      data.message ||
      "Account creation failed."
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

export async function logout() {
  const token = getToken();

  try {
    if (token) {
      await fetch(
        `${API_URL}/api/auth/logout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );
    }
  } finally {
    clearStorage();
  }
}

export function currentUser() {
  return getUser();
}

async function readResponse(response) {
  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();

  return {
    message: text
  };
}
