import {
  signup
} from "../auth.js";

import {
  CONFIG
} from "../config.js";


/*
|--------------------------------------------------------------------------
| SIGNUP PAGE
|--------------------------------------------------------------------------
|
| Authentication remains handled by auth.js.
|
| Branding comes from CONFIG so the application name
| and logo stay synchronized across the app.
|
|--------------------------------------------------------------------------
*/

export function renderSignup(container) {

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
             PAGE TITLE
             ===================================================== -->

        <h1>
          Create your account
        </h1>


        <!-- =====================================================
             DESCRIPTION
             ===================================================== -->

        <p>
          Join ${escapeHTML(CONFIG.appName)}
          and start building your personal AI relationship.
        </p>


        <!-- =====================================================
             SIGNUP FORM
             ===================================================== -->

        <form id="signupForm">


          <!-- NAME -->

          <input
            id="name"
            type="text"
            placeholder="Your name"
            autocomplete="name"
            required
          />


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
              autocomplete="new-password"
              minlength="8"
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


          <!-- CREATE ACCOUNT -->

          <button
            id="signupButton"
            type="submit"
          >
            Create Account
          </button>


        </form>


        <!-- =====================================================
             SIGNUP MESSAGE
             ===================================================== -->

        <p
          id="signupMessage"
          class="auth-message"
        ></p>


        <!-- =====================================================
             LOGIN LINK
             ===================================================== -->

        <button
          id="loginLink"
          class="auth-link"
          type="button"
        >
          Already have an account? Log in
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
      "signupForm"
    );


  const message =
    document.getElementById(
      "signupMessage"
    );


  const button =
    document.getElementById(
      "signupButton"
    );


  const password =
    document.getElementById(
      "password"
    );


  const togglePassword =
    document.getElementById(
      "togglePassword"
    );


  const loginLink =
    document.getElementById(
      "loginLink"
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
  | GO TO LOGIN
  |--------------------------------------------------------------------------
  */

  loginLink.addEventListener(
    "click",
    () => {

      window.location.hash =
        "#/login";

    }
  );


  /*
  |--------------------------------------------------------------------------
  | CREATE ACCOUNT
  |--------------------------------------------------------------------------
  */

  form.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      /*
      |--------------------------------------------------------------------------
      | GET FORM VALUES
      |--------------------------------------------------------------------------
      */

      const name =
        document
          .getElementById("name")
          .value
          .trim();


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
      | DISABLE BUTTON
      |--------------------------------------------------------------------------
      */

      button.disabled =
        true;


      button.textContent =
        "Creating account...";


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
          await signup(
            name,
            email,
            passwordValue
          );


        /*
        |--------------------------------------------------------------------------
        | VERIFY ACTIVE SESSION
        |--------------------------------------------------------------------------
        |
        | We only open the chat when the backend
        | actually returned an access token.
        |
        */

        if (
          !data?.session?.access_token
        ) {

          throw new Error(
            "Your account was created, but automatic login was not completed. Please log in."
          );

        }


        /*
        |--------------------------------------------------------------------------
        | SUCCESS MESSAGE
        |--------------------------------------------------------------------------
        */

        message.textContent =
          `Account created successfully! Opening ${CONFIG.appName}...`;


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
          "Signup error:",
          error
        );


        /*
        |--------------------------------------------------------------------------
        | ERROR
        |--------------------------------------------------------------------------
        */

        message.textContent =
          error.message ||
          "Unable to create your account.";


        message.className =
          "auth-message error-message";


        button.disabled =
          false;


        button.textContent =
          "Create Account";

      }

    }
  );

}


/*
|--------------------------------------------------------------------------
| SAFE HTML ESCAPE
|--------------------------------------------------------------------------
|
| Prevents branding values from being interpreted
| as HTML.
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

  return escapeHTML(
    value
  );

}
