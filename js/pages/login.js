import {
  login
} from "../auth.js";

export function renderLogin(container) {
  container.innerHTML = `
    <main class="auth-page">

      <section class="auth-container">

        <div class="auth-logo">🦁</div>

        <h1>Welcome back</h1>

        <p>
          Log in to continue with SalonePadi AI.
        </p>

        <form id="loginForm">

          <input
            id="email"
            type="email"
            placeholder="Email address"
            autocomplete="email"
            required
          />

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

          <button
            id="loginButton"
            type="submit"
          >
            Log In
          </button>

        </form>

        <p
          id="loginMessage"
          class="auth-message"
        ></p>

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
   * Show / hide password
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
   * Go to signup
   */
  signupLink.addEventListener(
    "click",
    () => {
      window.location.hash =
        "#/signup";
    }
  );

  /*
   * Login
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

      button.disabled = true;
      button.textContent =
        "Logging in...";

      message.textContent = "";
      message.className =
        "auth-message";

      try {
        const data =
          await login(
            email,
            passwordValue
          );

        /*
         * Login is only successful if
         * the backend returned a real
         * access token.
         */
        if (
          !data?.session?.access_token
        ) {
          throw new Error(
            "Login succeeded, but no active session was returned."
          );
        }

        message.textContent =
          "Login successful! Opening SalonePadi AI...";

        message.className =
          "auth-message success-message";

        /*
         * auth.js already saved the
         * token and user.
         */
        setTimeout(() => {
          window.location.hash =
            "#/chat";
        }, 300);

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

        button.disabled = false;
        button.textContent =
          "Log In";
      }
    }
  );
}
