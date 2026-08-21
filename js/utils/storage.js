const TOKEN_KEY =
  "salonepadi_access_token";

const USER_KEY =
  "salonepadi_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token) {
  localStorage.setItem(
    TOKEN_KEY,
    token
  );
}

export function getUser() {
  const value =
    localStorage.getItem(USER_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function saveUser(user) {
  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );
}

export function clearStorage() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
