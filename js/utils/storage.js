const TOKEN_KEY =
  "salonepadi_access_token";

const REFRESH_TOKEN_KEY =
  "salonepadi_refresh_token";

const USER_KEY =
  "salonepadi_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token) {
  if (!token) return;

  localStorage.setItem(
    TOKEN_KEY,
    token
  );
}

export function getRefreshToken() {
  return localStorage.getItem(
    REFRESH_TOKEN_KEY
  );
}

export function saveRefreshToken(
  refreshToken
) {
  if (!refreshToken) return;

  localStorage.setItem(
    REFRESH_TOKEN_KEY,
    refreshToken
  );
}

export function getUser() {
  const value =
    localStorage.getItem(USER_KEY);

  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function saveUser(user) {
  if (!user) return;

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );
}

export function clearStorage() {
  localStorage.removeItem(TOKEN_KEY);

  localStorage.removeItem(
    REFRESH_TOKEN_KEY
  );

  localStorage.removeItem(USER_KEY);
}
