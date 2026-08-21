import { api } from "./api.js";

import {
  saveToken,
  saveUser,
  clearStorage,
  getUser,
  getToken
} from "./utils/storage.js";

export async function signup(
  name,
  email,
  password
) {
  const data = await api.post(
    "/api/auth/signup",
    {
      name,
      email,
      password
    }
  );

  if (data.session?.access_token) {
    saveToken(
      data.session.access_token
    );
  }

  if (data.user) {
    saveUser(data.user);
  }

  return data;
}

export async function login(
  email,
  password
) {
  const data = await api.post(
    "/api/auth/login",
    {
      email,
      password
    }
  );

  if (data.session?.access_token) {
    saveToken(
      data.session.access_token
    );
  }

  if (data.user) {
    saveUser(data.user);
  }

  return data;
}

export async function getCurrentUser() {
  const data = await api.get(
    "/api/auth/me"
  );

  if (data.user) {
    saveUser(data.user);
  }

  return data;
}

export async function logout() {
  try {
    await api.post(
      "/api/auth/logout",
      {}
    );
  } finally {
    clearStorage();
  }
}

export function getAuthenticatedUser() {
  return getUser();
}

export function authenticated() {
  return Boolean(getToken());
}
