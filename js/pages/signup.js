import {
  signup
} from "../auth.js";

export function renderSignup(container) {
  container.innerHTML = `
    <main class="auth-page">

      <section class="auth-container">

        <div class="auth-logo">🦁</div>

        <h1>Create your account</h1>

        <p>
          Join SalonePadi AI and start building
          your personal AI relationship.
        </p>

        <form id="signupForm">

          <input
            id="name"
            type="text"
            placeholder="Your name"
            autocomplete="name"
            required
          />

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

          <button
            id="signupButton"
            type="submit"
          >
            Create Account
          </button>

        </form>

        <p
          id="signupMessage"
          class="auth-message"
        ></p>

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
   * Go to login
   */
  loginLink.addEventListener(
    "click",
    () => {
      window.location.hash =
        "#/login";
    }
  );

  /*
   * Create account
   */
  form.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

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

      button.disabled = true;
      button.textContent =
        "Creating account...";

      message.textContent = "";
      message.className =
        "auth-message";

      try {
        const data =
          await signup(
            name,
            email,
            passwordValue
          );

        /*
         * The backend must return an
         * authenticated session.
         */
        if (
          !data?.session?.access_token
        ) {
          throw new Error(
            "Your account was created, but automatic login was not completed. Please log in."
          );
        }

        message.textContent =
          "Account created successfully! Opening SalonePadi AI...";

        message.className =
          "auth-message success-message";

        /*
         * auth.js has already saved:
         *
         * salonepadi_access_token
         * salonepadi_user
         *
         * Now open the AI chat.
         */
        setTimeout(() => {
          window.location.hash =
            "#/chat";
        }, 300);

      } catch (error) {
        console.error(
          "Signup error:",
          error
        );

        message.textContent =
          error.message ||
          "Unable to create your account.";

        message.className =
          "auth-message error-message";

        button.disabled = false;
        button.textContent =
          "Create Account";
      }
    }
  );
}
