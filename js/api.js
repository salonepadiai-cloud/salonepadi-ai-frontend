import { CONFIG } from "./config.js";

import {
  getToken,
  getRefreshToken,
  saveToken,
  saveRefreshToken,
  clearStorage
} from "./utils/storage.js";


/*
|--------------------------------------------------------------------------
| Johnny Tec OS
| API CLIENT
|--------------------------------------------------------------------------
|
| This file is responsible ONLY for:
|
| - GET requests
| - POST requests
| - PATCH requests
| - DELETE requests
| - Authentication headers
| - Session refresh
| - Backend error handling
|
|--------------------------------------------------------------------------
*/


let refreshPromise = null;


/*
|--------------------------------------------------------------------------
| BUILD API URL
|--------------------------------------------------------------------------
*/

function buildUrl(endpoint) {

  const base =
    String(CONFIG.apiUrl || "")
      .replace(/\/+$/, "");

  const path =
    String(endpoint || "");

  if (!base) {

    throw new Error(
      "Johnny Tec OS backend URL is not configured."
    );

  }

  return `${base}${path.startsWith("/") ? path : `/${path}`}`;

}


/*
|--------------------------------------------------------------------------
| REFRESH SESSION
|--------------------------------------------------------------------------
*/

async function refreshSession() {

  const refreshToken =
    getRefreshToken();


  if (!refreshToken) {

    return false;

  }


  /*
   * Prevent multiple simultaneous
   * refresh requests.
   */

  if (refreshPromise) {

    return refreshPromise;

  }


  refreshPromise =
    (async () => {

      try {

        const response =
          await fetch(
            buildUrl(
              "/api/auth/refresh"
            ),
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify({
                  refresh_token:
                    refreshToken
                })
            }
          );


        const contentType =
          response.headers.get(
            "content-type"
          ) || "";


        let data = null;


        if (
          contentType.includes(
            "application/json"
          )
        ) {

          data =
            await response.json();

        }


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
          "Johnny Tec OS session refresh error:",
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
| API REQUEST
|--------------------------------------------------------------------------
*/

async function request(
  endpoint,
  options = {},
  retry = true
) {

  const url =
    buildUrl(endpoint);


  /*
   * Get the latest access token.
   */

  const token =
    getToken();


  /*
   * Build headers.
   */

  const headers = {

    Accept:
      "application/json",

    "Content-Type":
      "application/json",

    ...(options.headers || {})

  };


  /*
   * Add authentication.
   */

  if (token) {

    headers.Authorization =
      `Bearer ${token}`;

  }


  let response;


  /*
   * Send request.
   */

  try {

    response =
      await fetch(
        url,
        {
          ...options,
          headers
        }
      );

  } catch (error) {

    console.error(
      "Johnny Tec OS API connection error:",
      error
    );


    throw new Error(
      "Unable to connect to the Johnny Tec OS server."
    );

  }


  /*
   |--------------------------------------------------------------------------
   | ACCESS TOKEN EXPIRED
   |--------------------------------------------------------------------------
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
     * Refresh failed.
     */

    clearStorage();


    throw new Error(
      "Your session has expired. Please log in again."
    );

  }


  /*
   |--------------------------------------------------------------------------
   | READ RESPONSE
   |--------------------------------------------------------------------------
   */

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

    try {

      data =
        await response.json();

    } catch (error) {

      console.error(
        "Johnny Tec OS JSON response error:",
        error
      );

      throw new Error(
        "The server returned an invalid response."
      );

    }

  } else {

    const text =
      await response.text();

    data = {
      message: text
    };

  }


  /*
   |--------------------------------------------------------------------------
   | BACKEND ERROR
   |--------------------------------------------------------------------------
   */

  if (!response.ok) {

    const message =
      data?.error ||
      data?.message ||
      data?.details ||
      `Request failed with status ${response.status}.`;


    throw new Error(
      String(message)
    );

  }


  /*
   |--------------------------------------------------------------------------
   | SUCCESS
   |--------------------------------------------------------------------------
   */

  return data;

}


/*
|--------------------------------------------------------------------------
| PUBLIC API
|--------------------------------------------------------------------------
*/

export const api = {


  /*
   |--------------------------------------------------------------------------
   | GET
   |--------------------------------------------------------------------------
   */

  get(endpoint) {

    return request(
      endpoint,
      {
        method: "GET"
      }
    );

  },


  /*
   |--------------------------------------------------------------------------
   | POST
   |--------------------------------------------------------------------------
   */

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


  /*
   |--------------------------------------------------------------------------
   | PATCH
   |--------------------------------------------------------------------------
   */

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


  /*
   |--------------------------------------------------------------------------
   | DELETE
   |--------------------------------------------------------------------------
   */

  delete(endpoint) {

    return request(
      endpoint,
      {
        method: "DELETE"
      }
    );

  }

};
