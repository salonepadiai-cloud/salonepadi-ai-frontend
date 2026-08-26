import {
  login
} from "../auth.js";

import {
  CONFIG
} from "../config.js";


/*
|--------------------------------------------------------------------------
| LOGIN PAGE
|--------------------------------------------------------------------------
|
| Authentication remains handled by auth.js.
|
| Branding is loaded from CONFIG so:
|
|   CONFIG.appName
|   CONFIG.logo
|   CONFIG.logoAlt
|
| control the identity of the application.
|
|--------------------------------------------------------------------------
*/

export function renderLogin(container) {

  container.innerHTML = `
    <main class="auth-page">

      <section class="auth-container">


        <!-- =====================================================
             APP LOGO
             ===================================================== -->

        <div class="auth-logo">

          <img
            src="${escapeAttribute(CONFIG.logo)}"
            alt="${escapeAttribute(CONFIG.logoAlt)}"
            class="auth-logo-image"
          >

        </div>


        <!-- =====================================================
             WELCOME
             ===================================================== -->

        <h1>
          Welcome back
        </h1>


        <p>
          Log in to continue with
          ${escapeHTML(CONFIG.appName)}.
        </p>


        <!-- =====================================================
             LOGIN FORM
             ===================================================== -->

        <form id="loginForm">


          <!-- EMAIL -->

          <input
            id="email"
            type="email"
            placeholder="Email address"
            autocomplete="email"
            required
          />


          <!-- PASSWORD -->

          <div class="password-field">

            <input
              id="password"
              type="password"
              placeholder="Password"
              autocomplete="current-password"
              required
            />


            <button
              id="togglePassword"
              class="password-toggle"
              type="button"
              aria-label="Show password"
              title="Show password"
            >
              👁️
            </button>

          </div>


          <!-- LOGIN BUTTON -->

          <button
            id="loginButton"
            type="submit"
          >
            Log In
          </button>


        </form>


        <!-- =====================================================
             LOGIN MESSAGE
             ===================================================== -->

        <p
          id="loginMessage"
          class="auth-message"
        ></p>


        <!-- =====================================================
             SIGNUP LINK
             ===================================================== -->

        <button
          id="signupLink"
          class="auth-link"
          type="button"
        >
          Don't have an account? Create one
        </button>


      </section>

    </main>
  `;


  /*
  |--------------------------------------------------------------------------
  | ELEMENTS
  |--------------------------------------------------------------------------
  */

  const form =
    document.getElementById(
      "loginForm"
    );


  const message =
    document.getElementById(
      "loginMessage"
    );


  const button =
    document.getElementById(
      "loginButton"
    );


  const password =
    document.getElementById(
      "password"
    );


  const togglePassword =
    document.getElementById(
      "togglePassword"
    );


  const signupLink =
    document.getElementById(
      "signupLink"
    );


  /*
  |--------------------------------------------------------------------------
  | SHOW / HIDE PASSWORD
  |--------------------------------------------------------------------------
  */

  togglePassword.addEventListener(
    "click",
    () => {

      const hidden =
        password.type === "password";


      password.type =
        hidden
          ? "text"
          : "password";


      togglePassword.textContent =
        hidden
          ? "🙈"
          : "👁️";


      togglePassword.setAttribute(
        "aria-label",
        hidden
          ? "Hide password"
          : "Show password"
      );


      togglePassword.setAttribute(
        "title",
        hidden
          ? "Hide password"
          : "Show password"
      );

    }
  );


  /*
  |--------------------------------------------------------------------------
  | GO TO SIGNUP
  |--------------------------------------------------------------------------
  */

  signupLink.addEventListener(
    "click",
    () => {

      window.location.hash =
        "#/signup";

    }
  );


  /*
  |--------------------------------------------------------------------------
  | LOGIN
  |--------------------------------------------------------------------------
  */

  form.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const email =
        document
          .getElementById("email")
          .value
          .trim()
          .toLowerCase();


      const passwordValue =
        password.value;


      /*
      |--------------------------------------------------------------------------
      | DISABLE BUTTON WHILE LOGIN IS PROCESSING
      |--------------------------------------------------------------------------
      */

      button.disabled =
        true;


      button.textContent =
        "Logging in...";


      message.textContent =
        "";


      message.className =
        "auth-message";


      try {

        /*
        |--------------------------------------------------------------------------
        | CALL EXISTING AUTH SYSTEM
        |--------------------------------------------------------------------------
        */

        const data =
          await login(
            email,
            passwordValue
          );


        /*
        |--------------------------------------------------------------------------
        | VERIFY ACTIVE SESSION
        |--------------------------------------------------------------------------
        |
        | Do not redirect unless auth.js/backend
        | returned a real access token.
        |
        */

        if (
          !data?.session?.access_token
        ) {

          throw new Error(
            "Login succeeded, but no active session was returned."
          );

        }


        /*
        |--------------------------------------------------------------------------
        | SUCCESS
        |--------------------------------------------------------------------------
        */

        message.textContent =
          `Login successful! Opening ${CONFIG.appName}...`;


        message.className =
          "auth-message success-message";


        /*
        |--------------------------------------------------------------------------
        | OPEN CHAT
        |--------------------------------------------------------------------------
        */

        setTimeout(
          () => {

            window.location.hash =
              "#/chat";

          },
          300
        );

      } catch (error) {

        console.error(
          "Login error:",
          error
        );


        message.textContent =
          error.message ||
          "Unable to log in.";


        message.className =
          "auth-message error-message";


        button.disabled =
          false;


        button.textContent =
          "Log In";

      }

    }
  );

}


/*
|--------------------------------------------------------------------------
| SAFE HTML ESCAPE
|--------------------------------------------------------------------------
|
| Prevents CONFIG branding values from being
| interpreted as HTML.
|
|--------------------------------------------------------------------------
*/

function escapeHTML(value) {

  return String(value ?? "")
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/*
|--------------------------------------------------------------------------
| SAFE ATTRIBUTE ESCAPE
|--------------------------------------------------------------------------
*/

function escapeAttribute(value) {

  return escapeHTML(value);

    }
