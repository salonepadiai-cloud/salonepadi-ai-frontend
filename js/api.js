import { CONFIG } from "./config.js";

import {
  getToken,
  getRefreshToken,
  saveToken,
  saveRefreshToken,
  clearStorage
} from "./utils/storage.js";

let refreshPromise = null;

/*
|--------------------------------------------------------------------------
| Refresh session
|--------------------------------------------------------------------------
|
| Uses the stored Supabase refresh token to obtain
| a new access token when the current one expires.
|
*/

async function refreshSession() {
  const refreshToken =
    getRefreshToken();

  if (!refreshToken) {
    return false;
  }

  /*
   * Prevent multiple requests from refreshing
   * the session at the same time.
   */
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(
        `${CONFIG.apiUrl}/api/auth/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            refresh_token: refreshToken
          })
        }
      );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      const data =
        contentType.includes(
          "application/json"
        )
          ? await response.json()
          : null;

      if (
        !response.ok ||
        !data?.session?.access_token
      ) {
        return false;
      }

      saveToken(
        data.session.access_token
      );

      if (
        data.session.refresh_token
      ) {
        saveRefreshToken(
          data.session.refresh_token
        );
      }

      return true;

    } catch (error) {
      console.error(
        "Session refresh error:",
        error
      );

      return false;

    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/*
|--------------------------------------------------------------------------
| API request
|--------------------------------------------------------------------------
*/

async function request(
  endpoint,
  options = {},
  retry = true
) {
  if (!CONFIG.apiUrl) {
    throw new Error(
      "Backend API URL has not been configured."
    );
  }

  const token =
    getToken();

  const headers = {
    "Content-Type":
      "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
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

  /*
   * If the access token expired,
   * refresh it and retry the request once.
   */
  if (
    response.status === 401 &&
    retry
  ) {
    const refreshed =
      await refreshSession();

    if (refreshed) {
      return request(
        endpoint,
        options,
        false
      );
    }

    /*
     * Refresh failed, so the session
     * is genuinely no longer valid.
     */
    clearStorage();

    throw new Error(
      "Your session has expired. Please log in again."
    );
  }

  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  let data;

  if (
    contentType.includes(
      "application/json"
    )
  ) {
    data =
      await response.json();
  } else {
    const text =
      await response.text();

    data = {
      message: text
    };
  }

  if (!response.ok) {
    const message =
      typeof data === "object"
        ? data?.error ||
          data?.message ||
          "Request failed."
        : data;

    throw new Error(
      message ||
      "Request failed."
    );
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Public API
|--------------------------------------------------------------------------
*/

export const api = {

  get(endpoint) {
    return request(
      endpoint,
      {
        method: "GET"
      }
    );
  },

  post(
    endpoint,
    body = {}
  ) {
    return request(
      endpoint,
      {
        method: "POST",
        body:
          JSON.stringify(body)
      }
    );
  },

  patch(
    endpoint,
    body = {}
  ) {
    return request(
      endpoint,
      {
        method: "PATCH",
        body:
          JSON.stringify(body)
      }
    );
  },

  delete(endpoint) {
    return request(
      endpoint,
      {
        method: "DELETE"
      }
    );
  }
};
